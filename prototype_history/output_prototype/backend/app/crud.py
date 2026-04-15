from sqlalchemy.orm import Session
from app import models, schemas
from fastapi import HTTPException

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    fake_hashed_password = user.password + "notreallyhashed"
    db_user = models.User(username=user.username, hashed_password=fake_hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_water_intake(db: Session, water_intake: schemas.WaterIntakeCreate, user_id: int):
    db_water_intake = models.WaterIntake(**water_intake.dict(), owner_id=user_id)
    db.add(db_water_intake)
    db.commit()
    db.refresh(db_water_intake)
    return db_water_intake

def create_reminder(db: Session, reminder: schemas.ReminderCreate, user_id: int):
    db_reminder = models.Reminder(**reminder.dict(), owner_id=user_id)
    db.add(db_reminder)
    db.commit()
    db.refresh(db_reminder)
    return db_reminder