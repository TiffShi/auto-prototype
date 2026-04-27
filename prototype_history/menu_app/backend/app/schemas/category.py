import uuid
from pydantic import BaseModel, Field


class CategoryCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    sort_order: int = Field(default=0, ge=0)


class CategoryUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    sort_order: int | None = Field(default=None, ge=0)


class CategoryResponse(BaseModel):
    id: uuid.UUID
    name: str
    sort_order: int
    owner_id: uuid.UUID

    model_config = {"from_attributes": True}


class CategoryWithItemsResponse(CategoryResponse):
    menu_items: list["MenuItemResponse"] = []  # noqa: F821

    model_config = {"from_attributes": True}


# Avoid circular import — resolved at module level
from app.schemas.menu_item import MenuItemResponse  # noqa: E402

CategoryWithItemsResponse.model_rebuild()