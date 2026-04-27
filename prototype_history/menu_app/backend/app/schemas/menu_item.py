import uuid
from decimal import Decimal
from pydantic import BaseModel, Field


class MenuItemCreateRequest(BaseModel):
    category_id: uuid.UUID
    name: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    price: Decimal = Field(gt=Decimal("0"), decimal_places=2)
    is_available: bool = Field(default=True)
    sort_order: int = Field(default=0, ge=0)


class MenuItemUpdateRequest(BaseModel):
    category_id: uuid.UUID | None = None
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    price: Decimal | None = Field(default=None, gt=Decimal("0"), decimal_places=2)
    is_available: bool | None = None
    sort_order: int | None = Field(default=None, ge=0)


class MenuItemResponse(BaseModel):
    id: uuid.UUID
    category_id: uuid.UUID
    name: str
    description: str | None
    price: Decimal
    image_url: str | None
    is_available: bool
    sort_order: int

    model_config = {"from_attributes": True}


class ImageUploadResponse(BaseModel):
    image_url: str
    message: str = "Image uploaded successfully"