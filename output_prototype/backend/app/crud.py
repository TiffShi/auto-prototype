from sqlalchemy.orm import Session
from app import models, schemas
from fastapi import HTTPException

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    fake_hashed_password = user.password + "notreallyhashed"
    db_user = models.User(email=user.email, hashed_password=fake_hashed_password, username=user.username)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_water_intakes(db: Session, user_id: int):
    return db.query(models.WaterIntake).filter(models.WaterIntake.user_id == user_id).all()

def create_water_intake(db: Session, water_intake: schemas.WaterIntakeCreate, user_id: int):
    db_water_intake = models.WaterIntake(**water_intake.dict(), user_id=user_id)
    db.add(db_water_intake)
    db.commit()
    db.refresh(db_water_intake)
    return db_water_intake

def get_reminders(db: Session, user_id: int):
    return db.query(models.Reminder).filter(models.Reminder.user_id == user_id).all()

def create_reminder(db: Session, reminder: schemas.ReminderCreate, user_id: int):
    db_reminder = models.Reminder(**reminder.dict(), user_id=user_id)
    db.add(db_reminder)
    db.commit()
    db.refresh(db_reminder)
    return db_reminder