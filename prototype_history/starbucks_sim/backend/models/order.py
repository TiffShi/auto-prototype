from sqlalchemy import (
    Column, Integer, ForeignKey, Numeric,
    DateTime, Enum as SAEnum, JSON, String
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base


class OrderStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    ready = "ready"
    completed = "completed"
    cancelled = "cancelled"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(SAEnum(OrderStatus), default=OrderStatus.pending, nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    drink_id = Column(Integer, ForeignKey("drinks.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)
    customization_notes = Column(JSON, nullable=True)

    order = relationship("Order", back_populates="items")
    drink = relationship("Drink", back_populates="order_items")
    modifiers = relationship("OrderItemModifier", back_populates="order_item", cascade="all, delete-orphan")


class OrderItemModifier(Base):
    __tablename__ = "order_item_modifiers"

    id = Column(Integer, primary_key=True, index=True)
    order_item_id = Column(Integer, ForeignKey("order_items.id"), nullable=False)
    modifier_id = Column(Integer, ForeignKey("modifiers.id"), nullable=False)

    order_item = relationship("OrderItem", back_populates="modifiers")
    modifier = relationship("Modifier", back_populates="order_item_modifiers")