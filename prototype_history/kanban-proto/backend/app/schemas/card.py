import uuid
from datetime import datetime, date
from pydantic import BaseModel
from app.models.card import Priority


class CardCreate(BaseModel):
    title: str
    description: str | None = None
    due_date: date | None = None
    priority: Priority = Priority.medium
    order: int | None = None


class CardUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    due_date: date | None = None
    priority: Priority | None = None
    order: int | None = None


class CardMove(BaseModel):
    column_id: uuid.UUID
    order: int


class CardOut(BaseModel):
    id: uuid.UUID
    column_id: uuid.UUID
    title: str
    description: str | None
    due_date: date | None
    priority: Priority
    order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}