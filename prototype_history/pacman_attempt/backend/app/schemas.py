from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class ScoreCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=32,
        description="Player display name (1–32 characters)",
    )
    score: int = Field(
        ...,
        ge=0,
        description="Final score (non-negative integer)",
    )
    level: int = Field(
        ...,
        ge=1,
        description="Level reached (minimum 1)",
    )

    @field_validator("name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("name must not be blank")
        return stripped


class ScoreResponse(BaseModel):
    id: int
    name: str
    score: int
    level: int
    created_at: datetime

    model_config = {"from_attributes": True}


class HealthResponse(BaseModel):
    status: str