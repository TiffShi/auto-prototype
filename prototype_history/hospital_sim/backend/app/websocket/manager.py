import json
import logging
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

websocket_router = APIRouter()


class WebSocketManager:
    """Manages WebSocket connections grouped by hospital_id."""

    def __init__(self):
        # hospital_id -> list of active WebSocket connections
        self._connections: dict[str, list[WebSocket]] = {}

    async def connect(self, hospital_id: str, websocket: WebSocket):
        await websocket.accept()
        if hospital_id not in self._connections:
            self._connections[hospital_id] = []
        self._connections[hospital_id].append(websocket)
        logger.info(
            f"WebSocket connected for hospital {hospital_id}. "
            f"Total connections: {len(self._connections[hospital_id])}"
        )

    def disconnect(self, hospital_id: str, websocket: WebSocket):
        if hospital_id in self._connections:
            try:
                self._connections[hospital_id].remove(websocket)
            except ValueError:
                pass
            if not self._connections[hospital_id]:
                del self._connections[hospital_id]
        logger.info(f"WebSocket disconnected for hospital {hospital_id}")

    async def broadcast_to_hospital(self, hospital_id: str, message: dict[str, Any]):
        """Send a message to all connected clients for a hospital."""
        if hospital_id not in self._connections:
            return

        dead_connections = []
        payload = json.dumps(message, default=str)

        for websocket in self._connections[hospital_id]:
            try:
                await websocket.send_text(payload)
            except Exception as e:
                logger.warning(f"Failed to send to WebSocket: {e}")
                dead_connections.append(websocket)

        # Clean up dead connections
        for ws in dead_connections:
            self.disconnect(hospital_id, ws)

    async def send_personal_message(self, websocket: WebSocket, message: dict[str, Any]):
        """Send a message to a specific WebSocket connection."""
        try:
            await websocket.send_text(json.dumps(message, default=str))
        except Exception as e:
            logger.warning(f"Failed to send personal message: {e}")

    def get_connection_count(self, hospital_id: str) -> int:
        return len(self._connections.get(hospital_id, []))


ws_manager = WebSocketManager()


@websocket_router.websocket("/ws/{hospital_id}")
async def websocket_endpoint(websocket: WebSocket, hospital_id: str):
    await ws_manager.connect(hospital_id, websocket)
    try:
        # Send initial connection confirmation
        await ws_manager.send_personal_message(
            websocket,
            {
                "type": "CONNECTED",
                "data": {
                    "hospital_id": hospital_id,
                    "message": "Connected to Hospital Simulator",
                },
            },
        )

        # Keep connection alive and handle incoming messages
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)

                # Handle ping/pong
                if message.get("type") == "PING":
                    await ws_manager.send_personal_message(
                        websocket, {"type": "PONG"}
                    )

            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                logger.warning("Received invalid JSON from WebSocket client")
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                break

    finally:
        ws_manager.disconnect(hospital_id, websocket)