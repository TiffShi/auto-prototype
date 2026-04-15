import json
import os
import threading
from datetime import datetime
from typing import Optional

from models import Photo

# Path to the JSON flat-file database
DB_FILE = os.path.join(os.path.dirname(__file__), "photos_db.json")

# Thread lock for safe concurrent access
_lock = threading.Lock()


def init_db() -> None:
    """Initialize the database file if it does not exist."""
    if not os.path.exists(DB_FILE):
        _write_db([])
        print(f"[database] Initialized new database at {DB_FILE}")
    else:
        print(f"[database] Loaded existing database from {DB_FILE}")


def _read_db() -> list[dict]:
    """Read all records from the JSON file."""
    with _lock:
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data if isinstance(data, list) else []
        except (json.JSONDecodeError, FileNotFoundError):
            return []


def _write_db(records: list[dict]) -> None:
    """Write all records to the JSON file."""
    with _lock:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2, default=str)


def get_all_photos() -> list[Photo]:
    """Retrieve all photo records, sorted by upload date descending."""
    records = _read_db()
    photos = []
    for record in records:
        try:
            photo = Photo(**record)
            photos.append(photo)
        except Exception as e:
            print(f"[database] Skipping malformed record: {e}")
    # Sort newest first
    photos.sort(key=lambda p: p.uploaded_at, reverse=True)
    return photos


def get_photo_by_id(photo_id: str) -> Optional[Photo]:
    """Retrieve a single photo by its ID."""
    records = _read_db()
    for record in records:
        if record.get("id") == photo_id:
            try:
                return Photo(**record)
            except Exception as e:
                print(f"[database] Error parsing photo {photo_id}: {e}")
                return None
    return None


def save_photo(photo: Photo) -> Photo:
    """Persist a new photo record to the database."""
    records = _read_db()
    records.append(json.loads(photo.json()))
    _write_db(records)
    return photo


def delete_photo(photo_id: str) -> bool:
    """Remove a photo record by ID. Returns True if deleted, False if not found."""
    records = _read_db()
    original_count = len(records)
    updated_records = [r for r in records if r.get("id") != photo_id]
    if len(updated_records) == original_count:
        return False
    _write_db(updated_records)
    return True


def photo_exists(photo_id: str) -> bool:
    """Check whether a photo with the given ID exists."""
    return get_photo_by_id(photo_id) is not None