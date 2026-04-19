from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
import uuid


class PhotoBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Title of the photo")
    description: str = Field(default="", max_length=1000, description="Description of the photo")


class PhotoCreate(PhotoBase):
    """Model used internally when creating a photo record."""
    filename: str
    url: str


class Photo(PhotoBase):
    """Full photo model returned to clients."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    url: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class PhotoResponse(BaseModel):
    """Response model for a single photo."""
    id: str
    title: str
    description: str
    filename: str
    url: str
    uploaded_at: str

    @classmethod
    def from_photo(cls, photo: Photo) -> "PhotoResponse":
        return cls(
            id=photo.id,
            title=photo.title,
            description=photo.description,
            filename=photo.filename,
            url=photo.url,
            uploaded_at=photo.uploaded_at.isoformat() if isinstance(photo.uploaded_at, datetime) else photo.uploaded_at,
        )


class PhotoListResponse(BaseModel):
    """Response model for a list of photos."""
    photos: list[PhotoResponse]
    total: int


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    success: bool = True