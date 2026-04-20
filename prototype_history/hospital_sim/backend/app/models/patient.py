import uuid
from datetime import datetime

from sqlalchemy import String, Integer, Numeric, DateTime, ForeignKey, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base
from app.utils.enums import SeverityLevel, PatientStatus


class Patient(Base):
    __tablename__ = "patients"

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
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    condition: Mapped[str] = mapped_column(String(255), nullable=False)
    severity: Mapped[SeverityLevel] = mapped_column(
        SAEnum(SeverityLevel, name="severity_level"), nullable=False
    )
    status: Mapped[PatientStatus] = mapped_column(
        SAEnum(PatientStatus, name="patient_status"),
        nullable=False,
        default=PatientStatus.WAITING,
    )
    admitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    discharged_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    treatment_cost: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)
    ticks_in_treatment: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    required_ticks: Mapped[int] = mapped_column(Integer, nullable=False, default=3)

    # Relationships
    hospital: Mapped["Hospital"] = relationship("Hospital", back_populates="patients")
    department: Mapped["Department"] = relationship("Department", back_populates="patients")