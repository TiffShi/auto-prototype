from datetime import date, datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import WaterEntryCreate, WaterEntryResponse

router = APIRouter()


# ---------------------------------------------------------------------------
# POST /api/entries
# ---------------------------------------------------------------------------


@router.post(
    "/",
    response_model=WaterEntryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Log a new water entry",
)
def log_entry(payload: WaterEntryCreate, db: Session = Depends(get_db)):
    """
    Log a new water-drinking event.

    - **amount**: positive number (e.g. 250)
    - **unit**: `"ml"` or `"oz"` (default `"ml"`)
    - **logged_at**: optional UTC datetime; defaults to *now*
    """
    return crud.create_entry(db, payload)


# ---------------------------------------------------------------------------
# GET /api/entries/today
# ---------------------------------------------------------------------------


@router.get(
    "/today",
    response_model=List[WaterEntryResponse],
    summary="Get all entries for today (UTC)",
)
def get_today_entries(db: Session = Depends(get_db)):
    today = datetime.now(timezone.utc).date()
    return crud.get_entries_for_date(db, today)


# ---------------------------------------------------------------------------
# GET /api/entries?date=YYYY-MM-DD
# ---------------------------------------------------------------------------


@router.get(
    "/",
    response_model=List[WaterEntryResponse],
    summary="Get entries for a specific date",
)
def get_entries_by_date(
    date: Optional[str] = Query(
        None,
        description="ISO date string YYYY-MM-DD; defaults to today if omitted",
        example="2024-06-15",
    ),
    db: Session = Depends(get_db),
):
    if date is None:
        target = datetime.now(timezone.utc).date()
    else:
        try:
            target = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="date must be in YYYY-MM-DD format",
            )
    return crud.get_entries_for_date(db, target)


# ---------------------------------------------------------------------------
# DELETE /api/entries/{id}
# ---------------------------------------------------------------------------


@router.delete(
    "/{entry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a water entry by ID",
)
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_entry(db, entry_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entry with id={entry_id} not found",
        )