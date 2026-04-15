"""
APScheduler setup.

In v1 the server-side scheduler is intentionally lightweight — the actual
reminder *notifications* are fired from the browser via the Web Notifications
API.  The scheduler here is a hook for future server-side tasks (e.g. sending
a daily summary email, pruning old entries, etc.).

The midnight "reset" is not a real deletion; today's entries are always
filtered by DATE(logged_at) = today, so no data needs to be removed.
"""

import logging
from datetime import datetime, timezone

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)

_scheduler: BackgroundScheduler | None = None


# ---------------------------------------------------------------------------
# Jobs
# ---------------------------------------------------------------------------


def _midnight_task() -> None:
    """Placeholder that runs at 00:00 UTC every day."""
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    logger.info("💧 Midnight reset task fired at %s — new day started.", now)
    # Future: send daily summary, prune entries older than N days, etc.


# ---------------------------------------------------------------------------
# Lifecycle helpers (called from main.py lifespan)
# ---------------------------------------------------------------------------


def start_scheduler() -> None:
    global _scheduler
    _scheduler = BackgroundScheduler(timezone="UTC")
    _scheduler.add_job(
        _midnight_task,
        trigger=CronTrigger(hour=0, minute=0, second=0, timezone="UTC"),
        id="midnight_reset",
        replace_existing=True,
    )
    _scheduler.start()
    logger.info("APScheduler started — midnight task registered.")


def shutdown_scheduler() -> None:
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("APScheduler shut down.")