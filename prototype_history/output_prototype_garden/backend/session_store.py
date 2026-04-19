"""
In-memory session storage for the Blooming Flower Garden app.

Structure of each session entry:
{
    "session_id": str,          # UUID string
    "flower_type": str,         # e.g. "rose", "sunflower"
    "started_at": float,        # Unix timestamp (time.time())
    "bloom_count": int,         # Last known bloom count
}

Note: This is intentionally ephemeral — sessions are lost on server restart.
For production, replace with Redis or a database-backed store.
"""

from typing import Dict, Any, Optional

# Global in-memory store: session_id -> session dict
session_store: Dict[str, Dict[str, Any]] = {}


def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a session by ID, or None if not found."""
    return session_store.get(session_id)


def set_session(session_id: str, data: Dict[str, Any]) -> None:
    """Insert or overwrite a session entry."""
    session_store[session_id] = data


def delete_session(session_id: str) -> bool:
    """Remove a session. Returns True if it existed, False otherwise."""
    if session_id in session_store:
        del session_store[session_id]
        return True
    return False


def count_sessions() -> int:
    """Return the number of active sessions."""
    return len(session_store)


def clear_all_sessions() -> int:
    """Wipe all sessions. Returns the count of sessions cleared."""
    count = len(session_store)
    session_store.clear()
    return count