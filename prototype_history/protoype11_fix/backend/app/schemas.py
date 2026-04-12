from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# WaterEntry schemas
# ---------------------------------------------------------------------------


class WaterEntryCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Volume of water consumed (must be > 0)")
    unit: str = Field("ml", description="Unit of measurement: 'ml' or 'oz'")
    logged_at: Optional[datetime] = Field(
        None,
        description="UTC timestamp of the entry; defaults to now if omitted",
    )

    @field_validator("unit")
    @classmethod
    def validate_unit(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in {"ml", "oz"}:
            raise ValueError("unit must be 'ml' or 'oz'")
        return v


class WaterEntryResponse(BaseModel):
    id: int
    amount: float
    unit: str
    logged_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# UserSettings schemas
# ---------------------------------------------------------------------------


class UserSettingsUpdate(BaseModel):
    daily_goal_ml: Optional[float] = Field(None, gt=0)
    reminder_interval_min: Optional[int] = Field(None, ge=1)
    preferred_unit: Optional[str] = None

    @field_validator("preferred_unit")
    @classmethod
    def validate_unit(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.lower().strip()
        if v not in {"ml", "oz"}:
            raise ValueError("preferred_unit must be 'ml' or 'oz'")
        return v


class UserSettingsResponse(BaseModel):
    id: int
    daily_goal_ml: float
    reminder_interval_min: int
    preferred_unit: str

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Summary schemas
# ---------------------------------------------------------------------------


class TodaySummaryResponse(BaseModel):
    total_ml: float
    goal_ml: float
    percentage: float
    entries: List[WaterEntryResponse]


class DailyHistoryItem(BaseModel):
    date: str          # ISO date string "YYYY-MM-DD"
    total_ml: float
    goal_ml: float
    percentage: float


class HistorySummaryResponse(BaseModel):
    history: List[DailyHistoryItem]