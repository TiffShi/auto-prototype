"""
Reminder service using APScheduler.

A background job runs every hour between 08:00 and 22:00 (UTC).
For each known user, if they have not logged water in the last 60 minutes,
a reminder flag is set in an in-memory dictionary.

The frontend polls GET /reminders/check every 60 seconds; when a reminder
is present the flag is cleared (acknowledged).
"""

import json
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Dict

from apscheduler.schedulers.background import BackgroundScheduler

from app.services.water_service import get_last_entry_time

logger = logging.getLogger(__name__)

# In-memory reminder flags: { user_id: bool }
_reminder_flags: Dict[str, bool] = {}

_scheduler = BackgroundScheduler(timezone="UTC")

USERS_DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "users.json")
REMINDER_INTERVAL_MINUTES = 60
WAKING_HOUR_START = 8   # 08:00 UTC
WAKING_HOUR_END = 22    # 22:00 UTC


def _load_user_ids() -> list[str]:
    """Load all user IDs from the users.json mock database."""
    abs_path = os.path.abspath(USERS_DATA_FILE)
    if not os.path.exists(abs_path):
        return []
    try:
        with open(abs_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return [u["id"] for u in data.get("users", [])]
    except (json.JSONDecodeError, KeyError, OSError) as exc:
        logger.error("Failed to load user IDs for reminder check: %s", exc)
        return []


def _run_reminder_check() -> None:
    """
    Scheduled job: check every user and set a reminder flag if they
    haven't logged water in the last REMINDER_INTERVAL_MINUTES minutes.
    Only runs during waking hours (WAKING_HOUR_START–WAKING_HOUR_END UTC).
    """
    now_utc = datetime.now(timezone.utc)
    current_hour = now_utc.hour

    if not (WAKING_HOUR_START <= current_hour < WAKING_HOUR_END):
        logger.debug(
            "Reminder check skipped — outside waking hours (current UTC hour: %d)",
            current_hour,
        )
        return

    user_ids = _load_user_ids()
    threshold = now_utc - timedelta(minutes=REMINDER_INTERVAL_MINUTES)

    for user_id in user_ids:
        last_entry = get_last_entry_time(user_id)

        if last_entry is None or last_entry < threshold:
            _reminder_flags[user_id] = True
            logger.info(
                "Reminder set for user %s (last entry: %s)",
                user_id,
                last_entry,
            )
        else:
            logger.debug(
                "No reminder needed for user %s (last entry: %s)",
                user_id,
                last_entry,
            )


def check_reminder_for_user(user_id: str) -> bool:
    """Return True if there is a pending reminder for the given user."""
    return _reminder_flags.get(user_id, False)


def acknowledge_reminder(user_id: str) -> None:
    """Clear the pending reminder flag for the given user."""
    _reminder_flags[user_id] = False


def start_scheduler() -> None:
    """Start the APScheduler background scheduler with the reminder job."""
    _scheduler.add_job(
        _run_reminder_check,
        trigger="interval",
        minutes=REMINDER_INTERVAL_MINUTES,
        id="reminder_check",
        replace_existing=True,
        next_run_time=datetime.now(timezone.utc),  # run immediately on startup too
    )
    _scheduler.start()
    logger.info("Reminder scheduler started (interval: %d min).", REMINDER_INTERVAL_MINUTES)


def stop_scheduler() -> None:
    """Gracefully shut down the APScheduler instance."""
    if _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("Reminder scheduler stopped.")