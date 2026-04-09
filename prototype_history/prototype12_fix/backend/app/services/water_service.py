import json
import os
import uuid
from datetime import datetime, timezone
from typing import List

from app.models.water import WaterEntry, WaterEntryCreate

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "water_logs.json")
DAILY_GOAL_ML: float = 2000.0


def _abs_path() -> str:
    return os.path.abspath(DATA_FILE)


def _load_logs() -> dict:
    """Load the full water logs dictionary from the JSON file."""
    path = _abs_path()
    if not os.path.exists(path):
        return {"logs": {}}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_logs(data: dict) -> None:
    """Persist the water logs dictionary back to the JSON file."""
    path = _abs_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)


def _is_today(timestamp_str: str) -> bool:
    """Return True if the ISO timestamp string represents today (UTC)."""
    try:
        entry_dt = datetime.fromisoformat(timestamp_str)
        # Normalise to UTC-aware if naive
        if entry_dt.tzinfo is None:
            entry_dt = entry_dt.replace(tzinfo=timezone.utc)
        today = datetime.now(timezone.utc).date()
        return entry_dt.date() == today
    except (ValueError, TypeError):
        return False


def get_todays_entries(user_id: str) -> List[WaterEntry]:
    """
    Return all water intake entries for the given user that were logged today (UTC).
    Entries are sorted chronologically (oldest first).
    """
    data = _load_logs()
    user_entries: list = data.get("logs", {}).get(user_id, [])

    today_entries = [
        WaterEntry(
            id=entry["id"],
            amount_ml=entry["amount_ml"],
            timestamp=datetime.fromisoformat(entry["timestamp"]),
        )
        for entry in user_entries
        if _is_today(entry["timestamp"])
    ]

    today_entries.sort(key=lambda e: e.timestamp)
    return today_entries


def get_all_entries(user_id: str) -> List[WaterEntry]:
    """Return every water intake entry ever logged by the given user."""
    data = _load_logs()
    user_entries: list = data.get("logs", {}).get(user_id, [])
    return [
        WaterEntry(
            id=entry["id"],
            amount_ml=entry["amount_ml"],
            timestamp=datetime.fromisoformat(entry["timestamp"]),
        )
        for entry in user_entries
    ]


def add_water_entry(user_id: str, entry_data: WaterEntryCreate) -> WaterEntry:
    """
    Append a new water intake entry for the given user and persist it.
    Generates a UUID for the entry and defaults the timestamp to now (UTC).
    """
    data = _load_logs()
    logs = data.setdefault("logs", {})
    user_logs = logs.setdefault(user_id, [])

    timestamp = entry_data.timestamp or datetime.now(timezone.utc)
    # Ensure timezone-aware
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)

    new_entry = {
        "id": str(uuid.uuid4()),
        "amount_ml": entry_data.amount_ml,
        "timestamp": timestamp.isoformat(),
    }
    user_logs.append(new_entry)
    _save_logs(data)

    return WaterEntry(
        id=new_entry["id"],
        amount_ml=new_entry["amount_ml"],
        timestamp=timestamp,
    )


def delete_water_entry(user_id: str, entry_id: str) -> bool:
    """
    Remove the entry with the given ID from the user's log.
    Returns True if the entry was found and deleted, False otherwise.
    """
    data = _load_logs()
    user_logs: list = data.get("logs", {}).get(user_id, [])

    original_length = len(user_logs)
    updated_logs = [e for e in user_logs if e["id"] != entry_id]

    if len(updated_logs) == original_length:
        return False  # Nothing was removed

    data["logs"][user_id] = updated_logs
    _save_logs(data)
    return True


def get_last_entry_time(user_id: str) -> datetime | None:
    """
    Return the timestamp of the most recent water entry for the user,
    or None if the user has no entries at all.
    """
    data = _load_logs()
    user_entries: list = data.get("logs", {}).get(user_id, [])

    if not user_entries:
        return None

    timestamps = []
    for entry in user_entries:
        try:
            dt = datetime.fromisoformat(entry["timestamp"])
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            timestamps.append(dt)
        except (ValueError, TypeError):
            continue

    return max(timestamps) if timestamps else None