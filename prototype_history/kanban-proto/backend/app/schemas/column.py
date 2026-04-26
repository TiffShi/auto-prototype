import uuid
from datetime import datetime
from pydantic import BaseModel


class ColumnCreate(BaseModel):
    title: str
    order: int | None = None


class ColumnUpdate(BaseModel):
    title: str | None = None
    order: int | None = None


class ColumnReorder(BaseModel):
    order: int


class ColumnOut(BaseModel):
    id: uuid.UUID
    board_id: uuid.UUID
    title: str
    order: int
    created_at: datetime

    model_config = {"from_attributes": True}