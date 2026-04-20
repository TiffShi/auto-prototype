import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Double, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="SEARCHING_FOR_DRIVER",
    )
    pickup_lat: Mapped[float] = mapped_column(Double, nullable=False)
    pickup_lng: Mapped[float] = mapped_column(Double, nullable=False)
    dropoff_lat: Mapped[float] = mapped_column(Double, nullable=False)
    dropoff_lng: Mapped[float] = mapped_column(Double, nullable=False)
    driver_origin_lat: Mapped[float | None] = mapped_column(Double, nullable=True)
    driver_origin_lng: Mapped[float | None] = mapped_column(Double, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=_utcnow,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=_utcnow,
        onupdate=_utcnow,
    )