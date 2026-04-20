from pydantic import BaseModel
from decimal import Decimal
from models.modifier import ModifierType


class ModifierCreate(BaseModel):
    name: str
    type: ModifierType
    price_delta: Decimal = Decimal("0.00")


class ModifierOut(BaseModel):
    id: int
    name: str
    type: ModifierType
    price_delta: Decimal

    model_config = {"from_attributes": True}