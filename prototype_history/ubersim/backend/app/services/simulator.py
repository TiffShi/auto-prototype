import asyncio
import logging
import uuid
from typing import Tuple

from app.connection_manager import manager
from app.database import AsyncSessionLocal
from app.services.trip_service import get_trip, update_trip_status

logger = logging.getLogger(__name__)

# Simulation timing constants (seconds)
SEARCHING_DURATION = 3.0
DRIVER_EN_ROUTE_DURATION = 5.0
TRIP_IN_PROGRESS_DURATION = 7.0

# Position update interval (seconds)
POSITION_INTERVAL = 0.5


def _interpolate(start: Tuple[float, float], end: Tuple[float, float], step: int, total: int) -> Tuple[float, float]:
    """Linear interpolation between two (lat, lng) points."""
    t = step / total
    lat = start[0] + (end[0] - start[0]) * t
    lng = start[1] + (end[1] - start[1]) * t
    return lat, lng


async def _emit_status(trip_id: str, status: str) -> None:
    await manager.send_to_trip(trip_id, {
        "event": "STATUS_UPDATE",
        "trip_id": trip_id,
        "status": status,
    })


async def _emit_position(trip_id: str, lat: float, lng: float) -> None:
    await manager.send_to_trip(trip_id, {
        "event": "POSITION_UPDATE",
        "trip_id": trip_id,
        "lat": lat,
        "lng": lng,
    })


async def _animate_movement(
    trip_id: str,
    start: Tuple[float, float],
    end: Tuple[float, float],
    total_duration: float,
) -> None:
    """
    Emit POSITION_UPDATE messages every POSITION_INTERVAL seconds,
    interpolating from start to end over total_duration seconds.
    """
    steps = max(1, int(total_duration / POSITION_INTERVAL))
    for step in range(1, steps + 1):
        lat, lng = _interpolate(start, end, step, steps)
        await _emit_position(trip_id, lat, lng)
        await asyncio.sleep(POSITION_INTERVAL)


async def simulate_trip(trip_id: uuid.UUID) -> None:
    """
    Background task that drives a trip through its full state machine:
      SEARCHING_FOR_DRIVER → DRIVER_EN_ROUTE → TRIP_IN_PROGRESS → COMPLETED
    """
    trip_id_str = str(trip_id)
    logger.info("Simulator started for trip %s", trip_id_str)

    try:
        # ── Phase 1: SEARCHING_FOR_DRIVER ──────────────────────────────────
        # Status was already set to SEARCHING_FOR_DRIVER on creation.
        # Emit the initial status so the frontend receives it on WS connect.
        await asyncio.sleep(0.2)  # brief delay to allow WS client to connect
        await _emit_status(trip_id_str, "SEARCHING_FOR_DRIVER")
        await asyncio.sleep(SEARCHING_DURATION)

        # Fetch trip data from DB
        async with AsyncSessionLocal() as db:
            trip = await get_trip(db, trip_id)
            if trip is None:
                logger.error("Simulator: trip %s not found in DB", trip_id_str)
                return

            driver_origin = (trip.driver_origin_lat, trip.driver_origin_lng)
            pickup = (trip.pickup_lat, trip.pickup_lng)
            dropoff = (trip.dropoff_lat, trip.dropoff_lng)

        # ── Phase 2: DRIVER_EN_ROUTE ───────────────────────────────────────
        async with AsyncSessionLocal() as db:
            await update_trip_status(db, trip_id, "DRIVER_EN_ROUTE")

        await _emit_status(trip_id_str, "DRIVER_EN_ROUTE")
        await _animate_movement(trip_id_str, driver_origin, pickup, DRIVER_EN_ROUTE_DURATION)

        # ── Phase 3: TRIP_IN_PROGRESS ──────────────────────────────────────
        async with AsyncSessionLocal() as db:
            await update_trip_status(db, trip_id, "TRIP_IN_PROGRESS")

        await _emit_status(trip_id_str, "TRIP_IN_PROGRESS")
        await _animate_movement(trip_id_str, pickup, dropoff, TRIP_IN_PROGRESS_DURATION)

        # ── Phase 4: COMPLETED ─────────────────────────────────────────────
        async with AsyncSessionLocal() as db:
            await update_trip_status(db, trip_id, "COMPLETED")

        await _emit_status(trip_id_str, "COMPLETED")

        # Emit final position at drop-off
        await _emit_position(trip_id_str, dropoff[0], dropoff[1])

        # Signal simulation end
        await manager.send_to_trip(trip_id_str, {
            "event": "SIMULATION_COMPLETE",
            "trip_id": trip_id_str,
        })

        logger.info("Simulator completed for trip %s", trip_id_str)

    except asyncio.CancelledError:
        logger.warning("Simulator task cancelled for trip %s", trip_id_str)
    except Exception as exc:
        logger.exception("Simulator error for trip %s: %s", trip_id_str, exc)