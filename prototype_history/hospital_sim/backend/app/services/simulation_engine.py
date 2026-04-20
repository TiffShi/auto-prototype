import asyncio
import uuid
import logging
import random
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal
from app.models.hospital import Hospital
from app.models.patient import Patient
from app.models.staff import Staff
from app.models.inventory import Inventory
from app.utils.enums import PatientStatus, SeverityLevel, TransactionType
from app.services.patient_generator import generate_patient
from app.services.event_generator import (
    maybe_generate_event,
    create_low_stock_event,
    create_patient_deceased_event,
    create_budget_warning_event,
)
from app.services.financial_service import record_transaction
from app.services.staff_service import apply_fatigue, is_staff_available
from app.config import settings

logger = logging.getLogger(__name__)


async def run_tick(db: AsyncSession, hospital_id: uuid.UUID) -> dict:
    """Execute one simulation tick for a hospital."""
    hospital = await db.get(Hospital, hospital_id)
    if not hospital:
        return {"error": "Hospital not found"}

    tick_summary = {
        "hospital_id": str(hospital_id),
        "day": hospital.day,
        "new_patients": 0,
        "discharged": 0,
        "deceased": 0,
        "events": [],
        "budget": float(hospital.budget),
    }

    # 1. Generate new patients (1-3 per tick, more if outbreak)
    num_new_patients = random.randint(1, 3)
    for _ in range(num_new_patients):
        patient = await generate_patient(db, hospital_id)
        tick_summary["new_patients"] += 1

    # 2. Process existing patients
    result = await db.execute(
        select(Patient).where(
            Patient.hospital_id == hospital_id,
            Patient.status.in_([PatientStatus.WAITING, PatientStatus.IN_TREATMENT]),
        )
    )
    active_patients = result.scalars().all()

    # Get available departments
    from app.models.department import Department
    dept_result = await db.execute(
        select(Department).where(Department.hospital_id == hospital_id)
    )
    departments = {d.type.value: d for d in dept_result.scalars().all()}

    for patient in active_patients:
        if patient.status == PatientStatus.WAITING:
            # Try to assign to a department
            assigned = await _try_assign_patient(db, patient, departments)
            if assigned:
                patient.status = PatientStatus.IN_TREATMENT
                patient.ticks_in_treatment = 0

        elif patient.status == PatientStatus.IN_TREATMENT:
            patient.ticks_in_treatment += 1

            # Check if treatment is complete
            if patient.ticks_in_treatment >= patient.required_ticks:
                # Determine outcome based on severity and random chance
                death_chance = {
                    SeverityLevel.LOW: 0.01,
                    SeverityLevel.MEDIUM: 0.05,
                    SeverityLevel.CRITICAL: 0.15,
                }
                if random.random() < death_chance.get(patient.severity, 0.05):
                    patient.status = PatientStatus.DECEASED
                    patient.discharged_at = datetime.now(timezone.utc)
                    tick_summary["deceased"] += 1

                    # Free bed
                    if patient.department_id:
                        dept = await db.get(Department, patient.department_id)
                        if dept:
                            dept.current_occupancy = max(0, dept.current_occupancy - 1)

                    await create_patient_deceased_event(db, hospital_id, patient.name)
                else:
                    patient.status = PatientStatus.DISCHARGED
                    patient.discharged_at = datetime.now(timezone.utc)
                    tick_summary["discharged"] += 1

                    # Free bed
                    if patient.department_id:
                        dept = await db.get(Department, patient.department_id)
                        if dept:
                            dept.current_occupancy = max(0, dept.current_occupancy - 1)

                    # Record revenue
                    revenue = float(patient.treatment_cost)
                    hospital.budget = float(hospital.budget) + revenue
                    await record_transaction(
                        db=db,
                        hospital_id=hospital_id,
                        type=TransactionType.REVENUE,
                        amount=revenue,
                        description=f"Treatment: {patient.name} ({patient.condition})",
                    )

    # 3. Apply staff fatigue and salary deductions
    staff_result = await db.execute(
        select(Staff).where(Staff.hospital_id == hospital_id)
    )
    all_staff = staff_result.scalars().all()

    total_salary_per_tick = 0.0
    for staff_member in all_staff:
        is_working = staff_member.is_available and staff_member.department_id is not None
        staff_member.fatigue = apply_fatigue(staff_member.fatigue, is_working)
        staff_member.is_available = is_staff_available(staff_member.fatigue)
        # Salary per tick (monthly salary / 30 days / ticks_per_day)
        total_salary_per_tick += float(staff_member.salary) / 30 / 6

    if total_salary_per_tick > 0:
        hospital.budget = float(hospital.budget) - total_salary_per_tick
        await record_transaction(
            db=db,
            hospital_id=hospital_id,
            type=TransactionType.EXPENSE,
            amount=total_salary_per_tick,
            description="Staff salary (per tick)",
        )

    # 4. Check inventory levels
    inv_result = await db.execute(
        select(Inventory).where(Inventory.hospital_id == hospital_id)
    )
    inventory_items = inv_result.scalars().all()

    for item in inventory_items:
        # Consume supplies per tick
        if item.quantity > 0 and item.category.value in ("MEDICINE", "SUPPLIES"):
            consumption = random.randint(1, 3)
            item.quantity = max(0, item.quantity - consumption)

        if item.quantity <= item.reorder_threshold:
            await create_low_stock_event(db, hospital_id, item.item_name, item.quantity)

    # 5. Generate random events
    random_events = await maybe_generate_event(db, hospital_id)
    for event in random_events:
        tick_summary["events"].append(event.event_type)

    # 6. Check budget warning
    if float(hospital.budget) < 10_000:
        await create_budget_warning_event(db, hospital_id, float(hospital.budget))

    # 7. Advance day counter (every 6 ticks = 1 day)
    hospital.day = hospital.day  # Will be incremented by manager

    tick_summary["budget"] = float(hospital.budget)
    await db.commit()

    return tick_summary


async def _try_assign_patient(db: AsyncSession, patient: Patient, departments: dict) -> bool:
    """Try to assign a patient to an appropriate department."""
    from app.utils.enums import DepartmentType

    # Map severity to preferred department
    severity_dept_map = {
        SeverityLevel.CRITICAL: [DepartmentType.ICU.value, DepartmentType.ER.value],
        SeverityLevel.MEDIUM: [DepartmentType.ER.value, DepartmentType.GENERAL.value],
        SeverityLevel.LOW: [DepartmentType.GENERAL.value, DepartmentType.ER.value],
    }

    preferred_depts = severity_dept_map.get(patient.severity, [DepartmentType.GENERAL.value])

    for dept_type in preferred_depts:
        dept = departments.get(dept_type)
        if dept and dept.current_occupancy < dept.bed_capacity:
            patient.department_id = dept.id
            dept.current_occupancy += 1
            return True

    return False


class SimulationManager:
    """Manages background simulation tasks for all active hospitals."""

    def __init__(self):
        self._hospital_ids: set[str] = set()
        self._tick_counter: dict[str, int] = {}
        self._running = False

    async def register_hospital(self, hospital_id: str):
        self._hospital_ids.add(hospital_id)
        if hospital_id not in self._tick_counter:
            self._tick_counter[hospital_id] = 0
        logger.info(f"Registered hospital {hospital_id} with simulation manager")

    async def unregister_hospital(self, hospital_id: str):
        self._hospital_ids.discard(hospital_id)
        logger.info(f"Unregistered hospital {hospital_id} from simulation manager")

    async def run(self):
        """Main simulation loop."""
        self._running = True
        logger.info("Simulation manager running...")

        while self._running:
            await asyncio.sleep(settings.TICK_INTERVAL_SECONDS)

            for hospital_id in list(self._hospital_ids):
                try:
                    await self._process_hospital_tick(hospital_id)
                except Exception as e:
                    logger.error(f"Error processing tick for hospital {hospital_id}: {e}")

    async def _process_hospital_tick(self, hospital_id: str):
        """Process a single tick for a hospital."""
        async with AsyncSessionLocal() as db:
            try:
                h_uuid = uuid.UUID(hospital_id)
                hospital = await db.get(Hospital, h_uuid)

                if not hospital or hospital.is_paused:
                    return

                # Adjust tick rate based on speed multiplier
                speed = hospital.speed_multiplier
                if speed <= 0:
                    return

                # Run tick
                result = await run_tick(db, h_uuid)

                # Increment tick counter and advance day
                self._tick_counter[hospital_id] = self._tick_counter.get(hospital_id, 0) + 1
                if self._tick_counter[hospital_id] % 6 == 0:
                    hospital = await db.get(Hospital, h_uuid)
                    if hospital:
                        hospital.day += 1
                        await db.commit()

                # Broadcast via WebSocket
                from app.websocket.manager import ws_manager
                await ws_manager.broadcast_to_hospital(
                    hospital_id,
                    {
                        "type": "TICK_UPDATE",
                        "data": result,
                    },
                )

            except Exception as e:
                logger.error(f"Tick error for {hospital_id}: {e}")
                await db.rollback()


simulation_manager = SimulationManager()