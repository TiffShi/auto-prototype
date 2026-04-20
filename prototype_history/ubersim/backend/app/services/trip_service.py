import uuid
import logging
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Trip
from app.schemas import TripCreateRequest

logger = logging.getLogger(__name__)


async def create_trip(db: AsyncSession, payload: TripCreateRequest, driver_origin_lat: float, driver_origin_lng: float) -> Trip:
    trip = Trip(
        pickup_lat=payload.pickup_lat,
        pickup_lng=payload.pickup_lng,
        dropoff_lat=payload.dropoff_lat,
        dropoff_lng=payload.dropoff_lng,
        driver_origin_lat=driver_origin_lat,
        driver_origin_lng=driver_origin_lng,
        status="SEARCHING_FOR_DRIVER",
    )
    db.add(trip)
    await db.commit()
    await db.refresh(trip)
    logger.info("Created trip %s", trip.id)
    return trip


async def get_trip(db: AsyncSession, trip_id: uuid.UUID) -> Optional[Trip]:
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    return result.scalar_one_or_none()


async def list_trips(db: AsyncSession) -> List[Trip]:
    result = await db.execute(select(Trip).order_by(Trip.created_at.desc()))
    return list(result.scalars().all())


async def update_trip_status(db: AsyncSession, trip_id: uuid.UUID, status: str) -> Optional[Trip]:
    trip = await get_trip(db, trip_id)
    if trip is None:
        logger.warning("update_trip_status: trip %s not found", trip_id)
        return None
    trip.status = status
    await db.commit()
    await db.refresh(trip)
    logger.info("Trip %s status → %s", trip_id, status)
    return trip