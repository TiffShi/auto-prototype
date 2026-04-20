from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


class CategoryBase(BaseModel):
    name: str
    display_order: int = 0


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    id: int

    model_config = {"from_attributes": True}


class ModifierOut(BaseModel):
    id: int
    name: str
    type: str
    price_delta: Decimal

    model_config = {"from_attributes": True}


class DrinkBase(BaseModel):
    name: str
    description: Optional[str] = None
    base_price: Decimal
    category_id: int
    is_available: bool = True


class DrinkCreate(DrinkBase):
    modifier_ids: Optional[List[int]] = []


class DrinkUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    base_price: Optional[Decimal] = None
    category_id: Optional[int] = None
    is_available: Optional[bool] = None
    modifier_ids: Optional[List[int]] = None


class DrinkOut(DrinkBase):
    id: int
    image_url: Optional[str] = None
    created_at: datetime
    category: CategoryOut
    modifiers: List[ModifierOut] = []

    model_config = {"from_attributes": True}


class DrinkListOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    base_price: Decimal
    image_url: Optional[str] = None
    is_available: bool
    category: CategoryOut

    model_config = {"from_attributes": True}