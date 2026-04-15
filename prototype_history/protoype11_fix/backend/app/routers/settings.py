from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import UserSettingsResponse, UserSettingsUpdate

router = APIRouter()


# ---------------------------------------------------------------------------
# GET /api/settings
# ---------------------------------------------------------------------------


@router.get(
    "/",
    response_model=UserSettingsResponse,
    summary="Fetch current user settings",
)
def get_settings(db: Session = Depends(get_db)):
    """
    Returns the singleton settings row.
    Creates it with sensible defaults on first call.
    """
    return crud.get_or_create_settings(db)


# ---------------------------------------------------------------------------
# PUT /api/settings
# ---------------------------------------------------------------------------


@router.put(
    "/",
    response_model=UserSettingsResponse,
    summary="Update user settings (partial update supported)",
)
def update_settings(payload: UserSettingsUpdate, db: Session = Depends(get_db)):
    """
    Update one or more settings fields.  Only the fields present in the
    request body are modified; omitted fields keep their current values.

    - **daily_goal_ml**: target daily intake in millilitres (> 0)
    - **reminder_interval_min**: minutes between browser reminders (≥ 1)
    - **preferred_unit**: `"ml"` or `"oz"`
    """
    return crud.update_settings(db, payload)