from pydantic import BaseModel, Field
from typing import Optional


VALID_FLOWER_TYPES = {"rose", "sunflower", "tulip", "cherry_blossom", "daisy"}


class SessionStart(BaseModel):
    flower_type: str = Field(
        ...,
        description="The type of flower chosen by the user",
        examples=["rose", "sunflower", "tulip", "cherry_blossom", "daisy"],
    )

    class Config:
        json_schema_extra = {
            "example": {
                "flower_type": "rose"
            }
        }


class SessionData(BaseModel):
    session_id: str = Field(..., description="Unique session identifier (UUID)")
    flower_type: str = Field(..., description="The flower type for this session")
    started_at: float = Field(..., description="Unix timestamp when session started")
    elapsed_seconds: float = Field(
        ..., description="Seconds elapsed since session start"
    )
    bloom_count: int = Field(
        ..., description="Current number of flowers that should be blooming"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                "flower_type": "rose",
                "started_at": 1700000000.0,
                "elapsed_seconds": 45.3,
                "bloom_count": 11,
            }
        }


class BloomUpdate(BaseModel):
    bloom_count: int = Field(..., ge=0, description="Updated bloom count from client")

    class Config:
        json_schema_extra = {
            "example": {
                "bloom_count": 7
            }
        }


class SessionSummary(BaseModel):
    session_id: str
    flower_type: str
    total_elapsed_seconds: float
    final_bloom_count: int
    ended: bool