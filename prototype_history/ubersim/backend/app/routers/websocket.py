import logging
import uuid

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.connection_manager import manager
from app.database import AsyncSessionLocal
from app.services.trip_service import get_trip

logger = logging.getLogger(__name__)

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/trips/{trip_id}")
async def websocket_trip_endpoint(websocket: WebSocket, trip_id: uuid.UUID):
    trip_id_str = str(trip_id)

    # Validate trip exists before accepting the connection
    async with AsyncSessionLocal() as db:
        trip = await get_trip(db, trip_id)

    if trip is None:
        logger.warning("WebSocket rejected: trip %s not found", trip_id_str)
        await websocket.close(code=4004)
        return

    await manager.connect(trip_id_str, websocket)

    # Send current trip state immediately upon connection
    try:
        await websocket.send_json({
            "event": "STATUS_UPDATE",
            "trip_id": trip_id_str,
            "status": trip.status,
        })
    except Exception as exc:
        logger.warning("Failed to send initial status for trip %s: %s", trip_id_str, exc)

    try:
        # Keep the connection alive; the simulator pushes messages proactively.
        # We still need to receive frames to detect client disconnection.
        while True:
            data = await websocket.receive_text()
            logger.debug("Received from client for trip %s: %s", trip_id_str, data)
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected for trip %s", trip_id_str)
    except Exception as exc:
        logger.warning("WebSocket error for trip %s: %s", trip_id_str, exc)
    finally:
        await manager.disconnect(trip_id_str, websocket)