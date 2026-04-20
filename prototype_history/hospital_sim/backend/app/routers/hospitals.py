import uuid
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.hospital import Hospital
from app.models.department import Department
from app.models.patient import Patient
from app.models.staff import Staff
from app.models.transaction import FinancialTransaction
from app.schemas.hospital import HospitalCreate, HospitalResponse, HospitalSpeedUpdate, HospitalStats
from app.services.simulation_engine import simulation_manager
from app.utils.enums import DepartmentType, PatientStatus, TransactionType

logger = logging.getLogger(__name__)

router = APIRouter()

INITIAL_DEPARTMENTS = [
    {"name": "Emergency Room", "type": DepartmentType.ER, "bed_capacity": 20},
    {"name": "Intensive Care Unit", "type": DepartmentType.ICU, "bed_capacity": 10},
    {"name": "General Ward", "type": DepartmentType.GENERAL, "bed_capacity": 30},
    {"name": "Surgery", "type": DepartmentType.SURGERY, "bed_capacity": 8},
    {"name": "Pharmacy", "type": DepartmentType.PHARMACY, "bed_capacity": 0},
]

INITIAL_INVENTORY = [
    {"item_name": "Antibiotics", "category": "MEDICINE", "quantity": 100, "unit_cost": 15.0, "reorder_threshold": 20},
    {"item_name": "Painkillers", "category": "MEDICINE", "quantity": 150, "unit_cost": 8.0, "reorder_threshold": 30},
    {"item_name": "IV Fluids", "category": "MEDICINE", "quantity": 80, "unit_cost": 12.0, "reorder_threshold": 20},
    {"item_name": "Surgical Gloves", "category": "SUPPLIES", "quantity": 500, "unit_cost": 2.0, "reorder_threshold": 100},
    {"item_name": "Syringes", "category": "SUPPLIES", "quantity": 300, "unit_cost": 1.5, "reorder_threshold": 50},
    {"item_name": "Bandages", "category": "SUPPLIES", "quantity": 200, "unit_cost": 3.0, "reorder_threshold": 40},
    {"item_name": "Defibrillator", "category": "EQUIPMENT", "quantity": 3, "unit_cost": 5000.0, "reorder_threshold": 1},
    {"item_name": "Ventilator", "category": "EQUIPMENT", "quantity": 5, "unit_cost": 8000.0, "reorder_threshold": 2},
    {"item_name": "X-Ray Machine", "category": "EQUIPMENT", "quantity": 2, "unit_cost": 15000.0, "reorder_threshold": 1},
]


@router.post("/hospitals", response_model=HospitalResponse, status_code=status.HTTP_201_CREATED)
async def create_hospital(payload: HospitalCreate, db: AsyncSession = Depends(get_db)):
    from app.models.inventory import Inventory
    from app.services.financial_service import record_transaction

    hospital = Hospital(
        name=payload.name,
        budget=500_000.0,
        day=1,
        speed_multiplier=1.0,
        is_paused=False,
    )
    db.add(hospital)
    await db.flush()

    # Create initial departments
    for dept_data in INITIAL_DEPARTMENTS:
        dept = Department(
            hospital_id=hospital.id,
            name=dept_data["name"],
            type=dept_data["type"],
            bed_capacity=dept_data["bed_capacity"],
            current_occupancy=0,
            upgrade_level=1,
        )
        db.add(dept)

    # Create initial inventory
    for inv_data in INITIAL_INVENTORY:
        item = Inventory(
            hospital_id=hospital.id,
            item_name=inv_data["item_name"],
            category=inv_data["category"],
            quantity=inv_data["quantity"],
            unit_cost=inv_data["unit_cost"],
            reorder_threshold=inv_data["reorder_threshold"],
        )
        db.add(item)

    await db.commit()
    await db.refresh(hospital)

    # Register with simulation manager
    await simulation_manager.register_hospital(str(hospital.id))
    logger.info(f"Created hospital: {hospital.name} ({hospital.id})")

    return hospital


@router.get("/hospitals/{hospital_id}", response_model=HospitalStats)
async def get_hospital(hospital_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    hospital = await db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    # Compute stats
    dept_result = await db.execute(
        select(
            func.sum(Department.bed_capacity).label("total_beds"),
            func.sum(Department.current_occupancy).label("occupied_beds"),
        ).where(Department.hospital_id == hospital_id)
    )
    dept_stats = dept_result.first()
    total_beds = int(dept_stats.total_beds or 0)
    occupied_beds = int(dept_stats.occupied_beds or 0)

    waiting_result = await db.execute(
        select(func.count()).where(
            Patient.hospital_id == hospital_id,
            Patient.status == PatientStatus.WAITING,
        )
    )
    patients_waiting = waiting_result.scalar() or 0

    treatment_result = await db.execute(
        select(func.count()).where(
            Patient.hospital_id == hospital_id,
            Patient.status == PatientStatus.IN_TREATMENT,
        )
    )
    patients_in_treatment = treatment_result.scalar() or 0

    staff_result = await db.execute(
        select(func.count()).where(
            Staff.hospital_id == hospital_id,
            Staff.is_available == True,
        )
    )
    staff_on_duty = staff_result.scalar() or 0

    # Daily revenue/expenses (last 20 transactions)
    tx_result = await db.execute(
        select(FinancialTransaction)
        .where(FinancialTransaction.hospital_id == hospital_id)
        .order_by(FinancialTransaction.created_at.desc())
        .limit(50)
    )
    transactions = tx_result.scalars().all()
    daily_revenue = sum(float(t.amount) for t in transactions if t.type == TransactionType.REVENUE)
    daily_expenses = sum(float(t.amount) for t in transactions if t.type == TransactionType.EXPENSE)

    return HospitalStats(
        hospital=HospitalResponse.model_validate(hospital),
        total_beds=total_beds,
        occupied_beds=occupied_beds,
        available_beds=max(0, total_beds - occupied_beds),
        patients_waiting=patients_waiting,
        patients_in_treatment=patients_in_treatment,
        staff_on_duty=staff_on_duty,
        daily_revenue=daily_revenue,
        daily_expenses=daily_expenses,
        er_wait_time_estimate=patients_waiting * 15,
    )


@router.patch("/hospitals/{hospital_id}/speed", response_model=HospitalResponse)
async def set_simulation_speed(
    hospital_id: uuid.UUID,
    payload: HospitalSpeedUpdate,
    db: AsyncSession = Depends(get_db),
):
    hospital = await db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    hospital.speed_multiplier = payload.speed_multiplier
    hospital.is_paused = payload.is_paused
    await db.commit()
    await db.refresh(hospital)

    return hospital


@router.get("/hospitals", response_model=list[HospitalResponse])
async def list_hospitals(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Hospital).order_by(Hospital.created_at.desc()))
    hospitals = result.scalars().all()

    # Re-register all hospitals with simulation manager on startup
    for h in hospitals:
        await simulation_manager.register_hospital(str(h.id))

    return hospitals