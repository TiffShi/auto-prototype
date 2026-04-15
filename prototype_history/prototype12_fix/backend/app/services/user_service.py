import json
import os
from typing import Optional

from app.auth import verify_password
from app.models.user import User

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "users.json")


def _load_users() -> list[dict]:
    """Load the users list from the JSON file."""
    abs_path = os.path.abspath(DATA_FILE)
    if not os.path.exists(abs_path):
        return []
    with open(abs_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("users", [])


def get_user_by_username(username: str) -> Optional[User]:
    """
    Look up a user by username in the mock database.
    Returns a User model instance or None if not found.
    """
    users = _load_users()
    for user_dict in users:
        if user_dict.get("username", "").lower() == username.lower():
            return User(**user_dict)
    return None


def get_user_by_id(user_id: str) -> Optional[User]:
    """
    Look up a user by their unique ID.
    Returns a User model instance or None if not found.
    """
    users = _load_users()
    for user_dict in users:
        if user_dict.get("id") == user_id:
            return User(**user_dict)
    return None


def validate_user_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against the stored bcrypt hash.
    Delegates to the auth module's verify_password helper.
    """
    return verify_password(plain_password, hashed_password)