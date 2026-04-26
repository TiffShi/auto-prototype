import uuid
from datetime import datetime
from pydantic import BaseModel


class BoardCreate(BaseModel):
    title: str
    description: str | None = None


class BoardUpdate(BaseModel):
    title: str | None = None
    description: str | None = None


class BoardOut(BaseModel):
    id: uuid.UUID
    owner_id: uuid.UUID
    title: str
    description: str | None
    created_at: datetime

    model_config = {"from_attributes": True}