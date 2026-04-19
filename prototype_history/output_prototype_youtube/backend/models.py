import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Float, DateTime
from database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Video(Base):
    __tablename__ = "videos"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True, default="")
    filename = Column(String(255), nullable=False, unique=True)
    thumbnail_filename = Column(String(255), nullable=True)
    file_size = Column(Integer, nullable=False, default=0)
    duration = Column(Float, nullable=True, default=0.0)
    views = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)