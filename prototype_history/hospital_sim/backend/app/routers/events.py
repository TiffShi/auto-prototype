import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.event import Event
from app.models.hospital import Hospital
from app.schemas.event import EventResponse
from app.utils.enums import EventSeverity
from typing import Optional

router = APIRouter()


@router.get("/hospitals/{hospital_id}/events", response_model=list[EventResponse])
async def get_events(
    hospital_id: uuid.UUID,
    severity: Optional[EventSeverity] = Query(None),
    limit: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    hospital = await db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    query = select(Event).where(Event.hospital_id == hospital_id)
    if severity:
        query = query.where(Event.severity == severity)

    query = query.order_by(Event.created_at.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()