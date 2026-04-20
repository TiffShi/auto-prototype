import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TripCreateRequest(BaseModel):
    pickup_lat: float = Field(..., ge=-90, le=90)
    pickup_lng: float = Field(..., ge=-180, le=180)
    dropoff_lat: float = Field(..., ge=-90, le=90)
    dropoff_lng: float = Field(..., ge=-180, le=180)


class TripResponse(BaseModel):
    trip_id: uuid.UUID
    status: str
    pickup_lat: float
    pickup_lng: float
    dropoff_lat: float
    dropoff_lng: float
    driver_origin_lat: Optional[float]
    driver_origin_lng: Optional[float]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class StatusUpdateMessage(BaseModel):
    event: str = "STATUS_UPDATE"
    trip_id: str
    status: str


class PositionUpdateMessage(BaseModel):
    event: str = "POSITION_UPDATE"
    trip_id: str
    lat: float
    lng: float


class SimulationCompleteMessage(BaseModel):
    event: str = "SIMULATION_COMPLETE"
    trip_id: str