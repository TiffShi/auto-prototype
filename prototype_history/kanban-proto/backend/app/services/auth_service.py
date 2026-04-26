import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.user import User
from app.schemas.user import UserCreate, TokenData

settings = get_settings()


def hash_password(plain_password: str) -> str:
    """Hash a plain-text password using bcrypt directly."""
    password_bytes = plain_password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


def create_access_token(user_id: uuid.UUID) -> str:
    """Create a signed JWT access token."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> TokenData:
    """Decode and validate a JWT, returning TokenData."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise JWTError("Missing subject claim")
        return TokenData(user_id=uuid.UUID(user_id_str))
    except (JWTError, ValueError) as exc:
        raise JWTError(f"Invalid token: {exc}") from exc


def register_user(db: Session, payload: UserCreate) -> User:
    """Create a new user after checking for duplicate email."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise ValueError("Email already registered")
    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    """Authenticate a user by email and password."""
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise ValueError("Invalid email or password")
    return user