from fastapi import APIRouter, HTTPException, status, Depends

from app.auth import get_current_user
from app.models.water import (
    WaterEntryCreate,
    WaterEntry,
    WaterEntriesResponse,
    DeleteEntryResponse,
)
from app.services.water_service import (
    get_todays_entries,
    add_water_entry,
    delete_water_entry,
    DAILY_GOAL_ML,
)

router = APIRouter()


@router.get(
    "/entries",
    response_model=WaterEntriesResponse,
    status_code=status.HTTP_200_OK,
    summary="Get today's water intake entries",
)
async def get_entries(current_user: dict = Depends(get_current_user)):
    """
    Returns all water intake entries logged by the authenticated user today,
    along with the total intake and progress toward the daily goal.
    """
    user_id = current_user["user_id"]
    entries = get_todays_entries(user_id)
    total_ml = sum(e.amount_ml for e in entries)
    goal_percentage = min((total_ml / DAILY_GOAL_ML) * 100, 100.0)

    return WaterEntriesResponse(
        entries=entries,
        total_ml=total_ml,
        daily_goal_ml=DAILY_GOAL_ML,
        goal_percentage=round(goal_percentage, 2),
    )


@router.post(
    "/entries",
    response_model=WaterEntry,
    status_code=status.HTTP_201_CREATED,
    summary="Log a new water intake entry",
)
async def create_entry(
    entry_data: WaterEntryCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Adds a new water intake entry for the authenticated user.
    Timestamp defaults to the current UTC time if not provided.
    """
    user_id = current_user["user_id"]
    new_entry = add_water_entry(user_id, entry_data)
    return new_entry


@router.delete(
    "/entries/{entry_id}",
    response_model=DeleteEntryResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete a specific water intake entry",
)
async def delete_entry(
    entry_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Deletes a specific water intake entry by its ID.
    Only the owner of the entry can delete it.
    """
    user_id = current_user["user_id"]
    success = delete_water_entry(user_id, entry_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entry with id '{entry_id}' not found for this user.",
        )

    return DeleteEntryResponse(
        message="Entry deleted successfully.",
        deleted_id=entry_id,
    )