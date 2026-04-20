import uuid
from typing import Optional

from pydantic import BaseModel, Field
from app.utils.enums import InventoryCategory


class InventoryPurchase(BaseModel):
    item_name: str = Field(..., min_length=1, max_length=255)
    category: InventoryCategory
    quantity: int = Field(..., ge=1)
    unit_cost: Optional[float] = None  # If None, use existing item's cost


class InventoryResponse(BaseModel):
    id: uuid.UUID
    hospital_id: uuid.UUID
    item_name: str
    category: InventoryCategory
    quantity: int
    unit_cost: float
    reorder_threshold: int
    is_low_stock: bool = False

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_with_computed(cls, item):
        return cls(
            id=item.id,
            hospital_id=item.hospital_id,
            item_name=item.item_name,
            category=item.category,
            quantity=item.quantity,
            unit_cost=float(item.unit_cost),
            reorder_threshold=item.reorder_threshold,
            is_low_stock=item.quantity <= item.reorder_threshold,
        )