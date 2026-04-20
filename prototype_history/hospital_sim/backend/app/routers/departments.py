import uuid
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.department import Department
from app.models.hospital import Hospital
from app.schemas.department import DepartmentResponse, DepartmentUpgrade
from app.services.financial_service import record_transaction
from app.utils.enums import TransactionType

logger = logging.getLogger(__name__)

router = APIRouter()

UPGRADE_COST_PER_LEVEL = 25_000.0
BED_INCREASE_PER_UPGRADE = 5


@router.get("/hospitals/{hospital_id}/departments", response_model=list[DepartmentResponse])
async def list_departments(hospital_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    hospital = await db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    result = await db.execute(
        select(Department).where(Department.hospital_id == hospital_id)
    )
    departments = result.scalars().all()
    return [DepartmentResponse.from_orm_with_computed(d) for d in departments]


@router.patch("/departments/{department_id}/upgrade", response_model=DepartmentResponse)
async def upgrade_department(
    department_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    dept = await db.get(Department, department_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    hospital = await db.get(Hospital, dept.hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    upgrade_cost = UPGRADE_COST_PER_LEVEL * dept.upgrade_level
    if float(hospital.budget) < upgrade_cost:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient budget. Need ${upgrade_cost:,.2f}, have ${float(hospital.budget):,.2f}",
        )

    # Apply upgrade
    dept.upgrade_level += 1
    dept.bed_capacity += BED_INCREASE_PER_UPGRADE
    hospital.budget = float(hospital.budget) - upgrade_cost

    await record_transaction(
        db=db,
        hospital_id=dept.hospital_id,
        type=TransactionType.EXPENSE,
        amount=upgrade_cost,
        description=f"Upgraded {dept.name} to level {dept.upgrade_level}",
    )

    await db.commit()
    await db.refresh(dept)
    logger.info(f"Upgraded department {dept.name} to level {dept.upgrade_level}")

    return DepartmentResponse.from_orm_with_computed(dept)