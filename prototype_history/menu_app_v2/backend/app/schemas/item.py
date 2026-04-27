from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field


class ItemCreate(BaseModel):
    category_id: int
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2000)
    price: Decimal = Field(..., gt=0)
    is_available: bool = True
    sort_order: int = Field(0, ge=0)


class ItemUpdate(BaseModel):
    category_id: int | None = None
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2000)
    price: Decimal | None = Field(None, gt=0)
    is_available: bool | None = None
    sort_order: int | None = Field(None, ge=0)


class ItemReorder(BaseModel):
    id: int
    sort_order: int = Field(..., ge=0)


class ItemOut(BaseModel):
    id: int
    category_id: int
    name: str
    description: str | None
    price: Decimal
    image_url: str | None
    is_available: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}