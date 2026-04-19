from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class StreamCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100, description="Stream title")
    broadcaster_name: str = Field(..., min_length=1, max_length=50, description="Broadcaster display name")
    description: Optional[str] = Field(None, max_length=500, description="Stream description")


class StreamInfo(BaseModel):
    stream_id: str = Field(..., description="Unique stream identifier")
    title: str
    broadcaster_name: str
    description: Optional[str] = None
    viewer_count: int = Field(default=0)
    started_at: datetime
    is_live: bool = Field(default=True)
    thumbnail_url: Optional[str] = None

    class Config:
        from_attributes = True


class StreamUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class StreamResponse(BaseModel):
    stream_id: str
    title: str
    broadcaster_name: str
    description: Optional[str] = None
    viewer_count: int
    started_at: datetime
    is_live: bool
    ws_url: str
    hls_url: Optional[str] = None


class ICECandidate(BaseModel):
    candidate: str
    sdpMid: Optional[str] = None
    sdpMLineIndex: Optional[int] = None


class SDPOffer(BaseModel):
    type: str  # "offer" or "answer"
    sdp: str


class SignalingMessage(BaseModel):
    type: str  # "offer", "answer", "ice-candidate", "viewer-joined", "viewer-left"
    payload: dict
    sender_id: Optional[str] = None
    target_id: Optional[str] = None