from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Any
from decimal import Decimal
from models.order import OrderStatus


class OrderItemModifierIn(BaseModel):
    modifier_id: int


class OrderItemIn(BaseModel):
    drink_id: int
    quantity: int = 1
    unit_price: Decimal
    customization_notes: Optional[Any] = None
    modifier_ids: Optional[List[int]] = []


class OrderCreate(BaseModel):
    items: List[OrderItemIn]


class OrderItemModifierOut(BaseModel):
    modifier_id: int
    modifier: Optional[Any] = None

    model_config = {"from_attributes": True}


class OrderItemOut(BaseModel):
    id: int
    drink_id: int
    quantity: int
    unit_price: Decimal
    customization_notes: Optional[Any] = None
    modifiers: List[OrderItemModifierOut] = []
    drink: Optional[Any] = None

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    user_id: int
    status: OrderStatus
    total_price: Decimal
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemOut] = []

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderSummary(BaseModel):
    id: int
    status: OrderStatus
    total_price: Decimal
    created_at: datetime
    item_count: int

    model_config = {"from_attributes": True}