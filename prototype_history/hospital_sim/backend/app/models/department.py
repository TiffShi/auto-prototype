import uuid

from sqlalchemy import String, Integer, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base
from app.utils.enums import DepartmentType


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    hospital_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[DepartmentType] = mapped_column(
        SAEnum(DepartmentType, name="department_type"), nullable=False
    )
    bed_capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    current_occupancy: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    upgrade_level: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    # Relationships
    hospital: Mapped["Hospital"] = relationship("Hospital", back_populates="departments")
    patients: Mapped[list["Patient"]] = relationship(
        "Patient", back_populates="department"
    )
    staff: Mapped[list["Staff"]] = relationship(
        "Staff", back_populates="department"
    )