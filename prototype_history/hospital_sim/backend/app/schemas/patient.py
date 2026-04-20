import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field
from app.utils.enums import SeverityLevel, PatientStatus


class PatientAdmit(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    age: int = Field(..., ge=0, le=120)
    condition: str = Field(..., min_length=1, max_length=255)
    severity: SeverityLevel


class PatientStatusUpdate(BaseModel):
    status: PatientStatus
    department_id: Optional[uuid.UUID] = None


class PatientResponse(BaseModel):
    id: uuid.UUID
    hospital_id: uuid.UUID
    department_id: Optional[uuid.UUID]
    name: str
    age: int
    condition: str
    severity: SeverityLevel
    status: PatientStatus
    admitted_at: datetime
    discharged_at: Optional[datetime]
    treatment_cost: float
    ticks_in_treatment: int
    required_ticks: int

    model_config = {"from_attributes": True}