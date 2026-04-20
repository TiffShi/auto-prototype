from sqlalchemy import Column, Integer, String, Numeric, Enum as SAEnum
from sqlalchemy.orm import relationship
import enum
from database import Base


class ModifierType(str, enum.Enum):
    size = "size"
    milk = "milk"
    extra = "extra"


class Modifier(Base):
    __tablename__ = "modifiers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(SAEnum(ModifierType), nullable=False)
    price_delta = Column(Numeric(10, 2), default=0.00, nullable=False)

    drink_modifiers = relationship("DrinkModifier", back_populates="modifier")
    order_item_modifiers = relationship("OrderItemModifier", back_populates="modifier")