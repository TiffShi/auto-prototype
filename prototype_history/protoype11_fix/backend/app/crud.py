from datetime import date, datetime, timezone
from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import UserSettings, WaterEntry
from app.schemas import UserSettingsUpdate, WaterEntryCreate

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

OZ_TO_ML = 29.5735  # 1 fluid ounce ≈ 29.5735 ml


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _to_ml(amount: float, unit: str) -> float:
    """Convert an amount to millilitres."""
    return amount * OZ_TO_ML if unit == "oz" else amount


# ---------------------------------------------------------------------------
# WaterEntry CRUD
# ---------------------------------------------------------------------------


def create_entry(db: Session, payload: WaterEntryCreate) -> WaterEntry:
    logged_at = payload.logged_at or datetime.now(timezone.utc)
    entry = WaterEntry(
        amount=payload.amount,
        unit=payload.unit,
        logged_at=logged_at,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_entries_for_date(db: Session, target_date: date) -> List[WaterEntry]:
    """Return all entries whose logged_at falls on *target_date* (UTC)."""
    return (
        db.query(WaterEntry)
        .filter(func.date(WaterEntry.logged_at) == target_date.isoformat())
        .order_by(WaterEntry.logged_at.asc())
        .all()
    )


def get_entry_by_id(db: Session, entry_id: int) -> Optional[WaterEntry]:
    return db.query(WaterEntry).filter(WaterEntry.id == entry_id).first()


def delete_entry(db: Session, entry_id: int) -> bool:
    entry = get_entry_by_id(db, entry_id)
    if entry is None:
        return False
    db.delete(entry)
    db.commit()
    return True


def get_total_ml_for_date(db: Session, target_date: date) -> float:
    """
    Sum all entries for a given date, converting oz → ml where necessary.
    We do this in Python rather than SQL to keep the conversion logic in one place.
    """
    entries = get_entries_for_date(db, target_date)
    return sum(_to_ml(e.amount, e.unit) for e in entries)


# ---------------------------------------------------------------------------
# UserSettings CRUD
# ---------------------------------------------------------------------------


def get_or_create_settings(db: Session) -> UserSettings:
    """Always returns the singleton settings row, creating it if absent."""
    settings = db.query(UserSettings).filter(UserSettings.id == 1).first()
    if settings is None:
        settings = UserSettings(
            id=1,
            daily_goal_ml=2000.0,
            reminder_interval_min=60,
            preferred_unit="ml",
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def update_settings(db: Session, payload: UserSettingsUpdate) -> UserSettings:
    settings = get_or_create_settings(db)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return settings