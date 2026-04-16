from pydantic import BaseModel
from typing import Optional


class DocumentCreate(BaseModel):
    title: str = "Untitled Document"
    content: str = ""


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class DocumentResponse(BaseModel):
    id: str
    title: str
    content: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True