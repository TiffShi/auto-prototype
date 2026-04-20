import uuid

from sqlalchemy import String, Integer, Numeric, Boolean, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base
from app.utils.enums import StaffRole, ShiftType


class Staff(Base):
    __tablename__ = "staff"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    hospital_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False
    )
    department_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[StaffRole] = mapped_column(
        SAEnum(StaffRole, name="staff_role"), nullable=False
    )
    skill_level: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    fatigue: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    salary: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    shift: Mapped[ShiftType] = mapped_column(
        SAEnum(ShiftType, name="shift_type"), nullable=False, default=ShiftType.DAY
    )
    is_available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relationships
    hospital: Mapped["Hospital"] = relationship("Hospital", back_populates="staff")
    department: Mapped["Department"] = relationship("Department", back_populates="staff")