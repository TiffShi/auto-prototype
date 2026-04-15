from fastapi import APIRouter, status, Depends

from app.auth import get_current_user
from app.services.reminder_service import (
    check_reminder_for_user,
    acknowledge_reminder,
)
from pydantic import BaseModel

router = APIRouter()


class ReminderResponse(BaseModel):
    """Response body for GET /reminders/check."""
    has_reminder: bool
    message: str | None = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "has_reminder": True,
                "message": "Don't forget to drink water! You haven't logged any intake in the last hour.",
            }
        }
    }


class AcknowledgeResponse(BaseModel):
    """Response body for POST /reminders/acknowledge."""
    message: str


@router.get(
    "/check",
    response_model=ReminderResponse,
    status_code=status.HTTP_200_OK,
    summary="Check if a water intake reminder is pending",
)
async def check_reminder(current_user: dict = Depends(get_current_user)):
    """
    Checks whether the authenticated user has a pending reminder.
    The frontend polls this endpoint every 60 seconds.
    Once a reminder is returned, it is automatically cleared.
    """
    user_id = current_user["user_id"]
    has_reminder = check_reminder_for_user(user_id)

    if has_reminder:
        acknowledge_reminder(user_id)
        return ReminderResponse(
            has_reminder=True,
            message=(
                "Don't forget to drink water! "
                "You haven't logged any intake in the last hour."
            ),
        )

    return ReminderResponse(has_reminder=False, message=None)


@router.post(
    "/acknowledge",
    response_model=AcknowledgeResponse,
    status_code=status.HTTP_200_OK,
    summary="Manually acknowledge and clear a pending reminder",
)
async def acknowledge(current_user: dict = Depends(get_current_user)):
    """
    Manually clears a pending reminder for the authenticated user.
    Useful if the frontend wants to dismiss the banner explicitly.
    """
    user_id = current_user["user_id"]
    acknowledge_reminder(user_id)
    return AcknowledgeResponse(message="Reminder acknowledged.")