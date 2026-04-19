from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ── Request Schemas ────────────────────────────────────────────────────────────

class ConflictCreate(BaseModel):
    primary_mod: str = Field(..., min_length=1, max_length=255)
    conflicting_mod: str = Field(..., min_length=1, max_length=255)
    crash_log_snippet: Optional[str] = Field(default=None)
    is_resolved: bool = Field(default=False)


class ConflictUpdate(BaseModel):
    primary_mod: str = Field(..., min_length=1, max_length=255)
    conflicting_mod: str = Field(..., min_length=1, max_length=255)
    crash_log_snippet: Optional[str] = Field(default=None)
    is_resolved: bool = Field(default=False)


class ConflictResolveToggle(BaseModel):
    is_resolved: bool


# ── Response Schemas ───────────────────────────────────────────────────────────

class ConflictResponse(BaseModel):
    id: UUID
    primary_mod: str
    conflicting_mod: str
    crash_log_snippet: Optional[str]
    is_resolved: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ConflictListResponse(BaseModel):
    conflicts: list[ConflictResponse]
    total: int


class StatsResponse(BaseModel):
    total: int
    resolved: int
    unresolved: int