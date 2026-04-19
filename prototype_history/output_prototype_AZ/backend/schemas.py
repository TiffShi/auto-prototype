from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, validator


# ─── Auth Schemas ────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=1)

    class Config:
        json_schema_extra = {
            "example": {
                "username": "admin",
                "password": "admin123",
            }
        }


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ─── Product Schemas ──────────────────────────────────────────────────────────

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None)
    price: float = Field(..., gt=0, description="Price must be greater than 0")


class ProductCreate(ProductBase):
    """Used internally after form data is parsed."""
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)

    @validator("price", pre=True, always=True)
    def price_must_be_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Price must be greater than 0")
        return v


class ProductResponse(ProductBase):
    id: int
    image_filename: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "Sample Product",
                "description": "A great product.",
                "price": 29.99,
                "image_filename": "abc123.jpg",
                "created_at": "2024-01-01T00:00:00",
            }
        }


# ─── User Schemas ─────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True