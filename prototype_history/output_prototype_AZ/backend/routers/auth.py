from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import User
from auth import verify_password, create_access_token
from schemas import LoginRequest, TokenResponse

router = APIRouter()


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Admin Login",
    description="Authenticate with username and password to receive a JWT access token.",
)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate an admin user and return a JWT access token.

    - **username**: Admin username
    - **password**: Admin password
    """
    # Look up user by username
    user = db.query(User).filter(User.username == payload.username).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create JWT token with username as subject
    access_token = create_access_token(data={"sub": user.username})

    return TokenResponse(access_token=access_token, token_type="bearer")