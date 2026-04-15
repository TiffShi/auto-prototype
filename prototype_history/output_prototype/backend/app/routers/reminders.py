from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db

router = APIRouter(
    prefix="/reminders",
    tags=["reminders"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.Reminder)
def set_reminder(reminder: schemas.ReminderCreate, db: Session = Depends(get_db)):
    return crud.create_reminder(db=db, reminder=reminder, user_id=1)  # Replace with actual user_id