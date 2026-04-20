import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class HospitalCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)


class HospitalSpeedUpdate(BaseModel):
    speed_multiplier: float = Field(..., ge=0.0, le=10.0)
    is_paused: bool = False


class HospitalResponse(BaseModel):
    id: uuid.UUID
    name: str
    budget: float
    day: int
    speed_multiplier: float
    is_paused: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class HospitalStats(BaseModel):
    hospital: HospitalResponse
    total_beds: int
    occupied_beds: int
    available_beds: int
    patients_waiting: int
    patients_in_treatment: int
    staff_on_duty: int
    daily_revenue: float
    daily_expenses: float
    er_wait_time_estimate: int  # minutes