import uuid
from typing import Optional

from pydantic import BaseModel, Field
from app.utils.enums import StaffRole, ShiftType


class StaffHire(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    role: StaffRole
    skill_level: int = Field(default=5, ge=1, le=10)
    shift: ShiftType = ShiftType.DAY
    department_id: Optional[uuid.UUID] = None


class StaffAssign(BaseModel):
    department_id: Optional[uuid.UUID] = None


class StaffResponse(BaseModel):
    id: uuid.UUID
    hospital_id: uuid.UUID
    department_id: Optional[uuid.UUID]
    name: str
    role: StaffRole
    skill_level: int
    fatigue: int
    salary: float
    shift: ShiftType
    is_available: bool

    model_config = {"from_attributes": True}