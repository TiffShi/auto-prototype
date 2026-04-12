from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, Integer, String

from app.database import Base


class WaterEntry(Base):
    """Represents a single water-drinking event logged by the user."""

    __tablename__ = "water_entries"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    unit = Column(String(10), nullable=False, default="ml")  # "ml" or "oz"
    logged_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


class UserSettings(Base):
    """Singleton row (id=1) that stores the user's preferences."""

    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, default=1)
    daily_goal_ml = Column(Float, nullable=False, default=2000.0)
    reminder_interval_min = Column(Integer, nullable=False, default=60)
    preferred_unit = Column(String(10), nullable=False, default="ml")