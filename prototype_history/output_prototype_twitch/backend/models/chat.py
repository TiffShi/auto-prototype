from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ChatMessageCreate(BaseModel):
    username: str = Field(..., min_length=1, max_length=30, description="Chat username")
    content: str = Field(..., min_length=1, max_length=500, description="Message content")


class ChatMessage(BaseModel):
    message_id: str
    stream_id: str
    username: str
    content: str
    timestamp: datetime
    color: Optional[str] = None  # User color for display

    class Config:
        from_attributes = True


class ChatEvent(BaseModel):
    type: str  # "message", "user_joined", "user_left", "system"
    data: dict
    stream_id: str
    timestamp: datetime