import asyncio
import logging
import random
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import TripCreateRequest, TripResponse
from app.services.simulator import simulate_trip
from app.services.trip_service import create_trip, get_trip, list_trips

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/trips", tags=["trips"])


def _random_driver_origin(pickup_lat: float, pickup_lng: float) -> tuple[float, float]:
    """
    Generate a random driver origin within ~1–3 km of the pickup point.
    Offset range: ±0.01 to ±0.03 degrees (~1–3 km).
    """
    lat_offset = random.uniform(0.01, 0.03) * random.choice([-1, 1])
    lng_offset = random.uniform(0.01, 0.03) * random.choice([-1, 1])
    return pickup_lat + lat_offset, pickup_lng + lng_offset


@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def create_trip_endpoint(
    payload: TripCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    driver_lat, driver_lng = _random_driver_origin(payload.pickup_lat, payload.pickup_lng)

    trip = await create_trip(db, payload, driver_lat, driver_lng)

    # Fire-and-forget background simulation task
    asyncio.create_task(simulate_trip(trip.id))
    logger.info("Simulation task created for trip %s", trip.id)

    return TripResponse(
        trip_id=trip.id,
        status=trip.status,
        pickup_lat=trip.pickup_lat,
        pickup_lng=trip.pickup_lng,
        dropoff_lat=trip.dropoff_lat,
        dropoff_lng=trip.dropoff_lng,
        driver_origin_lat=trip.driver_origin_lat,
        driver_origin_lng=trip.driver_origin_lng,
        created_at=trip.created_at,
        updated_at=trip.updated_at,
    )


@router.get("", response_model=list[TripResponse])
async def list_trips_endpoint(db: AsyncSession = Depends(get_db)):
    trips = await list_trips(db)
    return [
        TripResponse(
            trip_id=t.id,
            status=t.status,
            pickup_lat=t.pickup_lat,
            pickup_lng=t.pickup_lng,
            dropoff_lat=t.dropoff_lat,
            dropoff_lng=t.dropoff_lng,
            driver_origin_lat=t.driver_origin_lat,
            driver_origin_lng=t.driver_origin_lng,
            created_at=t.created_at,
            updated_at=t.updated_at,
        )
        for t in trips
    ]


@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip_endpoint(trip_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    trip = await get_trip(db, trip_id)
    if trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    return TripResponse(
        trip_id=trip.id,
        status=trip.status,
        pickup_lat=trip.pickup_lat,
        pickup_lng=trip.pickup_lng,
        dropoff_lat=trip.dropoff_lat,
        dropoff_lng=trip.dropoff_lng,
        driver_origin_lat=trip.driver_origin_lat,
        driver_origin_lng=trip.driver_origin_lng,
        created_at=trip.created_at,
        updated_at=trip.updated_at,
    )