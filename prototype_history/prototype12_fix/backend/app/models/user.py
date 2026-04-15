from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    """Request body for POST /auth/login."""
    username: str = Field(..., min_length=1, max_length=50, description="Username")
    password: str = Field(..., min_length=1, description="Plain-text password")

    model_config = {
        "json_schema_extra": {
            "example": {
                "username": "alice",
                "password": "password123",
            }
        }
    }


class User(BaseModel):
    """Internal user model as stored in users.json."""
    id: str
    username: str
    hashed_password: str


class TokenResponse(BaseModel):
    """Response body for a successful login."""
    access_token: str
    token_type: str = "bearer"
    username: str
    user_id: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "username": "alice",
                "user_id": "u1",
            }
        }
    }


class LogoutResponse(BaseModel):
    """Response body for logout."""
    message: str