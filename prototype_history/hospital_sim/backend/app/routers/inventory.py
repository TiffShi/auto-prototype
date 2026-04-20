import uuid
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.inventory import Inventory
from app.models.hospital import Hospital
from app.schemas.inventory import InventoryPurchase, InventoryResponse
from app.services.financial_service import record_transaction
from app.utils.enums import TransactionType

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/hospitals/{hospital_id}/inventory", response_model=list[InventoryResponse])
async def list_inventory(hospital_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    hospital = await db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    result = await db.execute(
        select(Inventory).where(Inventory.hospital_id == hospital_id)
    )
    items = result.scalars().all()
    return [InventoryResponse.from_orm_with_computed(item) for item in items]


@router.post("/hospitals/{hospital_id}/inventory/purchase", response_model=InventoryResponse)
async def purchase_inventory(
    hospital_id: uuid.UUID,
    payload: InventoryPurchase,
    db: AsyncSession = Depends(get_db),
):
    hospital = await db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    # Check if item already exists
    result = await db.execute(
        select(Inventory).where(
            Inventory.hospital_id == hospital_id,
            Inventory.item_name == payload.item_name,
        )
    )
    existing_item = result.scalar_one_or_none()

    unit_cost = payload.unit_cost
    if existing_item:
        unit_cost = unit_cost or float(existing_item.unit_cost)
    elif unit_cost is None:
        raise HTTPException(status_code=400, detail="unit_cost required for new items")

    total_cost = unit_cost * payload.quantity

    if float(hospital.budget) < total_cost:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient budget. Need ${total_cost:,.2f}, have ${float(hospital.budget):,.2f}",
        )

    if existing_item:
        existing_item.quantity += payload.quantity
        item = existing_item
    else:
        item = Inventory(
            hospital_id=hospital_id,
            item_name=payload.item_name,
            category=payload.category,
            quantity=payload.quantity,
            unit_cost=unit_cost,
            reorder_threshold=10,
        )
        db.add(item)

    hospital.budget = float(hospital.budget) - total_cost
    await record_transaction(
        db=db,
        hospital_id=hospital_id,
        type=TransactionType.EXPENSE,
        amount=total_cost,
        description=f"Purchased {payload.quantity}x {payload.item_name}",
    )

    await db.commit()
    await db.refresh(item)
    logger.info(f"Purchased {payload.quantity}x {payload.item_name} for ${total_cost:,.2f}")
    return InventoryResponse.from_orm_with_computed(item)