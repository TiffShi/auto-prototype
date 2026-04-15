from pydantic import BaseModel, Field
from typing import Literal, Optional


# ---------------------------------------------------------------------------
# Community models
# ---------------------------------------------------------------------------

class CommunityCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(default="", max_length=500)


class CommunityResponse(BaseModel):
    id: str
    name: str
    description: str
    created_at: str


# ---------------------------------------------------------------------------
# Post models
# ---------------------------------------------------------------------------

class PostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    body: str = Field(default="", max_length=10000)
    author: str = Field(..., min_length=1, max_length=100)
    community_id: str = Field(..., min_length=1)


class PostResponse(BaseModel):
    id: str
    title: str
    body: str
    author: str
    community_id: str
    upvotes: int
    downvotes: int
    created_at: str


# ---------------------------------------------------------------------------
# Comment models
# ---------------------------------------------------------------------------

class CommentCreate(BaseModel):
    body: str = Field(..., min_length=1, max_length=5000)
    author: str = Field(..., min_length=1, max_length=100)


class CommentResponse(BaseModel):
    id: str
    post_id: str
    body: str
    author: str
    upvotes: int
    downvotes: int
    created_at: str


# ---------------------------------------------------------------------------
# Vote model
# ---------------------------------------------------------------------------

class VotePayload(BaseModel):
    direction: Literal["up", "down"]