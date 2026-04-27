from datetime import datetime
from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=1000)
    sort_order: int = Field(0, ge=0)
    is_published: bool = True


class CategoryUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, max_length=1000)
    sort_order: int | None = Field(None, ge=0)
    is_published: bool | None = None


class CategoryReorder(BaseModel):
    id: int
    sort_order: int = Field(..., ge=0)


class CategoryOut(BaseModel):
    id: int
    owner_id: int
    name: str
    description: str | None
    sort_order: int
    is_published: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}