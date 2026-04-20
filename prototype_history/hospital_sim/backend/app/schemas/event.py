import uuid
from datetime import datetime

from pydantic import BaseModel
from app.utils.enums import EventSeverity


class EventResponse(BaseModel):
    id: uuid.UUID
    hospital_id: uuid.UUID
    event_type: str
    description: str
    severity: EventSeverity
    created_at: datetime

    model_config = {"from_attributes": True}