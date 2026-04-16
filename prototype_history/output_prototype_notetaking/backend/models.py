from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
import uuid


class NoteBase(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="The title of the note",
    )
    content: str = Field(
        ...,
        min_length=0,
        description="The body content of the note",
    )


class NoteCreate(NoteBase):
    """Schema for creating a new note."""
    pass


class NoteUpdate(BaseModel):
    """Schema for updating an existing note. All fields are optional."""
    title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=255,
        description="Updated title of the note",
    )
    content: Optional[str] = Field(
        None,
        description="Updated body content of the note",
    )


class NoteResponse(NoteBase):
    """Schema for returning a note in API responses."""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Enables ORM mode for SQLAlchemy model compatibility