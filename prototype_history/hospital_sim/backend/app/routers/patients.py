import uuid
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.patient import Patient
from app.models.hospital import Hospital
from app.models.department import Department
from app.schemas.patient import PatientAdmit, PatientResponse, PatientStatusUpdate
from app.services.patient_generator import generate_patient
from app.services.financial_service import record_transaction
from app.utils.enums import PatientStatus, TransactionType

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/hospitals/{hospital_id}/patients", response_model=list[PatientResponse])
async def list_patients(
    hospital_id: uuid.UUID,
    status: Optional[PatientStatus] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    hospital = await db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    query = select(Patient).where(Patient.hospital_id == hospital_id)
    if status:
        query = query.where(Patient.status == status)

    # Sort by severity priority: CRITICAL > MEDIUM > LOW
    query = query.order_by(
        Patient.admitted_at.asc()
    )

    result = await db.execute(query)
    return result.scalars().all()


@router.post("/hospitals/{hospital_id}/patients/admit", response_model=PatientResponse)
async def admit_patient(
    hospital_id: uuid.UUID,
    payload: PatientAdmit,
    db: AsyncSession = Depends(get_db),
):
    hospital = await db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    from app.services.patient_generator import calculate_treatment_cost, calculate_required_ticks

    patient = Patient(
        hospital_id=hospital_id,
        name=payload.name,
        age=payload.age,
        condition=payload.condition,
        severity=payload.severity,
        status=PatientStatus.WAITING,
        treatment_cost=calculate_treatment_cost(payload.severity),
        required_ticks=calculate_required_ticks(payload.severity),
    )
    db.add(patient)
    await db.commit()
    await db.refresh(patient)
    logger.info(f"Admitted patient {patient.name} with severity {patient.severity}")
    return patient


@router.post("/hospitals/{hospital_id}/patients/generate", response_model=PatientResponse)
async def generate_random_patient(
    hospital_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    hospital = await db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    patient = await generate_patient(db, hospital_id)
    await db.commit()
    await db.refresh(patient)
    return patient


@router.patch("/patients/{patient_id}/status", response_model=PatientResponse)
async def update_patient_status(
    patient_id: uuid.UUID,
    payload: PatientStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    patient = await db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    old_status = patient.status
    patient.status = payload.status

    if payload.department_id is not None:
        dept = await db.get(Department, payload.department_id)
        if not dept:
            raise HTTPException(status_code=404, detail="Department not found")

        # Update occupancy
        if old_status != PatientStatus.IN_TREATMENT and payload.status == PatientStatus.IN_TREATMENT:
            if patient.department_id:
                old_dept = await db.get(Department, patient.department_id)
                if old_dept:
                    old_dept.current_occupancy = max(0, old_dept.current_occupancy - 1)
            dept.current_occupancy = min(dept.bed_capacity, dept.current_occupancy + 1)
            patient.department_id = payload.department_id

    if payload.status in (PatientStatus.DISCHARGED, PatientStatus.DECEASED):
        from datetime import datetime, timezone
        patient.discharged_at = datetime.now(timezone.utc)

        # Free up bed
        if patient.department_id:
            dept = await db.get(Department, patient.department_id)
            if dept:
                dept.current_occupancy = max(0, dept.current_occupancy - 1)

        # Record revenue if discharged
        if payload.status == PatientStatus.DISCHARGED:
            hospital = await db.get(Hospital, patient.hospital_id)
            if hospital:
                hospital.budget = float(hospital.budget) + float(patient.treatment_cost)
                await record_transaction(
                    db=db,
                    hospital_id=patient.hospital_id,
                    type=TransactionType.REVENUE,
                    amount=float(patient.treatment_cost),
                    description=f"Treatment revenue: {patient.name} ({patient.condition})",
                )

    await db.commit()
    await db.refresh(patient)
    return patient