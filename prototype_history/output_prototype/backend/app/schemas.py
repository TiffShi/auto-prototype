from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        orm_mode = True

class WaterIntakeBase(BaseModel):
    amount: float
    date: datetime

class WaterIntakeCreate(WaterIntakeBase):
    pass

class WaterIntake(WaterIntakeBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True

class ReminderBase(BaseModel):
    time: datetime
    frequency: str

class ReminderCreate(ReminderBase):
    pass

class Reminder(ReminderBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True