"""Unit tests for authentication helpers."""

import pytest
from app.auth import hash_password, verify_password, create_access_token, decode_access_token
from fastapi import HTTPException


def test_hash_and_verify_password():
    plain = "supersecret"
    hashed = hash_password(plain)
    assert hashed != plain
    assert verify_password(plain, hashed)


def test_verify_wrong_password():
    hashed = hash_password("correct")
    assert not verify_password("wrong", hashed)


def test_create_and_decode_token():
    payload = {"sub": "u1", "username": "alice"}
    token = create_access_token(data=payload)
    decoded = decode_access_token(token)
    assert decoded["sub"] == "u1"
    assert decoded["username"] == "alice"


def test_decode_invalid_token_raises():
    with pytest.raises(HTTPException) as exc_info:
        decode_access_token("this.is.not.valid")
    assert exc_info.value.status_code == 401