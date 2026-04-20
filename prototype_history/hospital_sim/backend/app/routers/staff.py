import uuid
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.staff import Staff
from app.models.hospital import Hospital
from app.models.department import Department
from app.schemas.staff import StaffHire, StaffResponse, StaffAssign
from app.services.staff_service import calculate_salary
from app.services.financial_service import record_transaction
from app.utils.enums import TransactionType

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/hospitals/{hospital_id}/staff", response_model=list[StaffResponse])
async def list_staff(hospital_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    hospital = await db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    result = await db.execute(
        select(Staff).where(Staff.hospital_id == hospital_id)
    )
    return result.scalars().all()


@router.post("/hospitals/{hospital_id}/staff/hire", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
async def hire_staff(
    hospital_id: uuid.UUID,
    payload: StaffHire,
    db: AsyncSession = Depends(get_db),
):
    hospital = await db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    salary = calculate_salary(payload.role, payload.skill_level)
    hiring_cost = salary * 0.5  # One-time hiring fee

    if float(hospital.budget) < hiring_cost:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient budget for hiring. Need ${hiring_cost:,.2f}",
        )

    # Validate department if provided
    if payload.department_id:
        dept = await db.get(Department, payload.department_id)
        if not dept or dept.hospital_id != hospital_id:
            raise HTTPException(status_code=404, detail="Department not found")

    staff_member = Staff(
        hospital_id=hospital_id,
        department_id=payload.department_id,
        name=payload.name,
        role=payload.role,
        skill_level=payload.skill_level,
        fatigue=0,
        salary=salary,
        shift=payload.shift,
        is_available=True,
    )
    db.add(staff_member)

    hospital.budget = float(hospital.budget) - hiring_cost
    await record_transaction(
        db=db,
        hospital_id=hospital_id,
        type=TransactionType.EXPENSE,
        amount=hiring_cost,
        description=f"Hiring cost: {payload.name} ({payload.role.value})",
    )

    await db.commit()
    await db.refresh(staff_member)
    logger.info(f"Hired {staff_member.name} as {staff_member.role.value}")
    return staff_member


@router.delete("/staff/{staff_id}", status_code=status.HTTP_204_NO_CONTENT)
async def fire_staff(staff_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    staff_member = await db.get(Staff, staff_id)
    if not staff_member:
        raise HTTPException(status_code=404, detail="Staff member not found")

    await db.delete(staff_member)
    await db.commit()
    logger.info(f"Fired staff member {staff_id}")


@router.patch("/staff/{staff_id}/assign", response_model=StaffResponse)
async def assign_staff(
    staff_id: uuid.UUID,
    payload: StaffAssign,
    db: AsyncSession = Depends(get_db),
):
    staff_member = await db.get(Staff, staff_id)
    if not staff_member:
        raise HTTPException(status_code=404, detail="Staff member not found")

    if payload.department_id is not None:
        dept = await db.get(Department, payload.department_id)
        if not dept or dept.hospital_id != staff_member.hospital_id:
            raise HTTPException(status_code=404, detail="Department not found")

    staff_member.department_id = payload.department_id
    await db.commit()
    await db.refresh(staff_member)
    return staff_member