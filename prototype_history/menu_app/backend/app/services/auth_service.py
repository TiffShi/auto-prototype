from datetime import datetime, timedelta, timezone
from typing import Any
from jose import JWTError, jwt
from app.config import get_settings

settings = get_settings()


def create_access_token(subject: str, extra_claims: dict[str, Any] | None = None) -> str:
    """
    Create a signed JWT access token.

    :param subject: Typically the user's UUID as a string.
    :param extra_claims: Optional additional claims to embed in the token.
    :return: Encoded JWT string.
    """
    expire = datetime.now(tz=timezone.utc) + timedelta(
        minutes=settings.jwt_access_token_expire_minutes
    )
    payload: dict[str, Any] = {
        "sub": subject,
        "exp": expire,
        "iat": datetime.now(tz=timezone.utc),
    }
    if extra_claims:
        payload.update(extra_claims)

    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT access token.

    :param token: The raw JWT string.
    :return: Decoded payload dict.
    :raises JWTError: If the token is invalid or expired.
    """
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])


def extract_subject(token: str) -> str:
    """
    Extract the 'sub' claim from a JWT token.

    :param token: The raw JWT string.
    :return: The subject string (user UUID).
    :raises JWTError: If decoding fails or 'sub' is missing.
    """
    payload = decode_access_token(token)
    sub: str | None = payload.get("sub")
    if sub is None:
        raise JWTError("Token payload missing 'sub' claim.")
    return sub