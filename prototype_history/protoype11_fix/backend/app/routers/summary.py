from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import DailyHistoryItem, HistorySummaryResponse, TodaySummaryResponse

router = APIRouter()


def _clamp_percentage(value: float) -> float:
    """Return percentage rounded to 2 dp, capped at 100."""
    return round(min(value, 100.0), 2)


# ---------------------------------------------------------------------------
# GET /api/summary/today
# ---------------------------------------------------------------------------


@router.get(
    "/today",
    response_model=TodaySummaryResponse,
    summary="Today's intake summary",
)
def today_summary(db: Session = Depends(get_db)):
    """
    Returns:
    - **total_ml**: sum of today's entries converted to ml
    - **goal_ml**: the user's daily goal
    - **percentage**: progress toward goal (0–100)
    - **entries**: list of today's raw entries
    """
    settings = crud.get_or_create_settings(db)
    today = datetime.now(timezone.utc).date()

    entries = crud.get_entries_for_date(db, today)
    total_ml = crud.get_total_ml_for_date(db, today)
    goal_ml = settings.daily_goal_ml
    percentage = _clamp_percentage((total_ml / goal_ml) * 100) if goal_ml > 0 else 0.0

    return TodaySummaryResponse(
        total_ml=round(total_ml, 2),
        goal_ml=goal_ml,
        percentage=percentage,
        entries=entries,
    )


# ---------------------------------------------------------------------------
# GET /api/summary/history
# ---------------------------------------------------------------------------


@router.get(
    "/history",
    response_model=HistorySummaryResponse,
    summary="Last 7 days of daily totals",
)
def history_summary(db: Session = Depends(get_db)):
    """
    Returns an array of the last 7 days (including today), each with:
    - **date**: ISO date string
    - **total_ml**: total intake for that day in ml
    - **goal_ml**: the user's current daily goal
    - **percentage**: progress toward goal (0–100)
    """
    settings = crud.get_or_create_settings(db)
    goal_ml = settings.daily_goal_ml
    today = datetime.now(timezone.utc).date()

    history: list[DailyHistoryItem] = []
    for offset in range(6, -1, -1):  # 6 days ago → today
        target = today - timedelta(days=offset)
        total_ml = crud.get_total_ml_for_date(db, target)
        percentage = (
            _clamp_percentage((total_ml / goal_ml) * 100) if goal_ml > 0 else 0.0
        )
        history.append(
            DailyHistoryItem(
                date=target.isoformat(),
                total_ml=round(total_ml, 2),
                goal_ml=goal_ml,
                percentage=percentage,
            )
        )

    return HistorySummaryResponse(history=history)