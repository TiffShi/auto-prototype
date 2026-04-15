from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class VideoBase(BaseModel):
    title: str
    description: Optional[str] = ""


class VideoCreate(VideoBase):
    pass


class VideoResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = ""
    filename: str
    thumbnail_filename: Optional[str] = None
    file_size: int
    duration: Optional[float] = 0.0
    views: int
    created_at: datetime

    class Config:
        from_attributes = True


class VideoListResponse(BaseModel):
    videos: list[VideoResponse]
    total: int


class ViewCountResponse(BaseModel):
    id: str
    views: int


class DeleteResponse(BaseModel):
    message: str
    id: str