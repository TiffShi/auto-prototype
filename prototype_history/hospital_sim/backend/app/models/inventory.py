import uuid

from sqlalchemy import String, Integer, Numeric, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base
from app.utils.enums import InventoryCategory


class Inventory(Base):
    __tablename__ = "inventory"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    hospital_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False
    )
    item_name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[InventoryCategory] = mapped_column(
        SAEnum(InventoryCategory, name="inventory_category"), nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    unit_cost: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    reorder_threshold: Mapped[int] = mapped_column(Integer, nullable=False, default=10)

    # Relationships
    hospital: Mapped["Hospital"] = relationship("Hospital", back_populates="inventory")