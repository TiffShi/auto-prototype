from sqlalchemy import (
    Column, Integer, String, Text, Numeric,
    Boolean, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Drink(Base):
    __tablename__ = "drinks"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    base_price = Column(Numeric(10, 2), nullable=False)
    image_url = Column(String(500), nullable=True)
    is_available = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    category = relationship("Category", back_populates="drinks")
    drink_modifiers = relationship("DrinkModifier", back_populates="drink", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="drink")


class DrinkModifier(Base):
    __tablename__ = "drink_modifiers"

    drink_id = Column(Integer, ForeignKey("drinks.id"), primary_key=True)
    modifier_id = Column(Integer, ForeignKey("modifiers.id"), primary_key=True)

    drink = relationship("Drink", back_populates="drink_modifiers")
    modifier = relationship("Modifier", back_populates="drink_modifiers")