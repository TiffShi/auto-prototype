from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class WaterEntryCreate(BaseModel):
    """Request body for creating a new water entry."""
    amount_ml: float = Field(
        ...,
        gt=0,
        le=5000,
        description="Amount of water in millilitres (must be positive, max 5000ml)",
    )
    timestamp: Optional[datetime] = Field(
        default=None,
        description="ISO 8601 timestamp; defaults to current UTC time if omitted",
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "amount_ml": 250,
                "timestamp": "2024-01-15T08:30:00",
            }
        }
    }


class WaterEntry(BaseModel):
    """A single water intake entry as stored and returned by the API."""
    id: str = Field(..., description="Unique entry UUID")
    amount_ml: float = Field(..., description="Amount of water in millilitres")
    timestamp: datetime = Field(..., description="When the entry was logged")

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "3f7a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
                "amount_ml": 250,
                "timestamp": "2024-01-15T08:30:00",
            }
        }
    }


class WaterEntriesResponse(BaseModel):
    """Response body for GET /water/entries."""
    entries: List[WaterEntry]
    total_ml: float = Field(..., description="Sum of all entry amounts for today")
    daily_goal_ml: float = Field(default=2000.0, description="Daily goal in millilitres")
    goal_percentage: float = Field(
        ..., description="Percentage of daily goal achieved (capped at 100)"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "entries": [
                    {
                        "id": "3f7a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
                        "amount_ml": 250,
                        "timestamp": "2024-01-15T08:30:00",
                    }
                ],
                "total_ml": 250,
                "daily_goal_ml": 2000,
                "goal_percentage": 12.5,
            }
        }
    }


class DeleteEntryResponse(BaseModel):
    """Response body for DELETE /water/entries/{id}."""
    message: str
    deleted_id: str