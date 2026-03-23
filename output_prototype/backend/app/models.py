from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    email = Column(String, unique=True, index=True)
    water_intakes = relationship("WaterIntake", back_populates="owner")

class WaterIntake(Base):
    __tablename__ = "water_intakes"
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    date = Column(DateTime)
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="water_intakes")

class Reminder(Base):
    __tablename__ = "reminders"
    id = Column(Integer, primary_key=True, index=True)
    frequency = Column(Integer)
    time = Column(DateTime)
    user_id = Column(Integer, ForeignKey("users.id"))