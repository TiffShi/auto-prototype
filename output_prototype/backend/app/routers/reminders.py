from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db
from app.auth import get_current_user

router = APIRouter()

@router.post("/reminders/", response_model=schemas.Reminder)
def create_reminder(reminder: schemas.ReminderCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    return crud.create_reminder(db=db, reminder=reminder, user_id=current_user.id)

@router.get("/reminders/", response_model=list[schemas.Reminder])
def read_reminders(skip: int = 0, limit: int = 10, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    reminders = crud.get_reminders(db, user_id=current_user.id)
    return reminders