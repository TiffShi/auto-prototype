import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID

from database import Base


def utcnow():
    return datetime.now(timezone.utc)


class ModConflict(Base):
    __tablename__ = "mod_conflicts"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
        index=True,
    )
    primary_mod = Column(String(255), nullable=False)
    conflicting_mod = Column(String(255), nullable=False)
    crash_log_snippet = Column(Text, nullable=True)
    is_resolved = Column(Boolean, nullable=False, default=False)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=utcnow,
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=utcnow,
        onupdate=utcnow,
    )