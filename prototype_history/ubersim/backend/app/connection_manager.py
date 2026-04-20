import asyncio
import logging
from collections import defaultdict
from typing import Dict, List

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Maintains a registry of active WebSocket connections keyed by trip_id.
    Supports multiple simultaneous connections per trip (e.g., multiple browser tabs).
    """

    def __init__(self):
        self._connections: Dict[str, List[WebSocket]] = defaultdict(list)
        self._lock = asyncio.Lock()

    async def connect(self, trip_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._connections[trip_id].append(websocket)
        logger.info("WebSocket connected for trip %s. Total connections: %d", trip_id, len(self._connections[trip_id]))

    async def disconnect(self, trip_id: str, websocket: WebSocket) -> None:
        async with self._lock:
            connections = self._connections.get(trip_id, [])
            if websocket in connections:
                connections.remove(websocket)
            if not connections:
                self._connections.pop(trip_id, None)
        logger.info("WebSocket disconnected for trip %s.", trip_id)

    async def send_to_trip(self, trip_id: str, message: dict) -> None:
        """
        Broadcast a JSON message to all WebSocket connections for a given trip_id.
        Stale/closed connections are silently removed.
        """
        async with self._lock:
            connections = list(self._connections.get(trip_id, []))

        dead: List[WebSocket] = []
        for ws in connections:
            try:
                await ws.send_json(message)
            except Exception as exc:
                logger.warning("Failed to send to WebSocket for trip %s: %s", trip_id, exc)
                dead.append(ws)

        if dead:
            async with self._lock:
                for ws in dead:
                    try:
                        self._connections[trip_id].remove(ws)
                    except ValueError:
                        pass
                if not self._connections.get(trip_id):
                    self._connections.pop(trip_id, None)

    def has_connections(self, trip_id: str) -> bool:
        return bool(self._connections.get(trip_id))


# Singleton instance shared across the application
manager = ConnectionManager()