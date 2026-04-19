import asyncio
import uuid
from datetime import datetime, timezone
from typing import Dict, Optional, Set
from fastapi import WebSocket

from models.stream import StreamCreate, StreamInfo


class StreamRegistry:
    """
    In-memory registry for tracking active streams, their broadcasters,
    and connected viewers.
    """

    def __init__(self):
        # stream_id -> StreamInfo
        self._streams: Dict[str, StreamInfo] = {}

        # stream_id -> broadcaster WebSocket
        self._broadcaster_sockets: Dict[str, WebSocket] = {}

        # stream_id -> set of viewer WebSockets
        self._viewer_sockets: Dict[str, Set[WebSocket]] = {}

        # stream_id -> viewer_id -> WebSocket (for targeted signaling)
        self._viewer_map: Dict[str, Dict[str, WebSocket]] = {}

        # viewer_id -> stream_id (reverse lookup)
        self._viewer_stream: Dict[str, str] = {}

        self._lock = asyncio.Lock()

    async def create_stream(self, data: StreamCreate) -> StreamInfo:
        async with self._lock:
            stream_id = str(uuid.uuid4())
            stream = StreamInfo(
                stream_id=stream_id,
                title=data.title,
                broadcaster_name=data.broadcaster_name,
                description=data.description,
                viewer_count=0,
                started_at=datetime.now(timezone.utc),
                is_live=False,  # becomes live when broadcaster connects WS
            )
            self._streams[stream_id] = stream
            self._viewer_sockets[stream_id] = set()
            self._viewer_map[stream_id] = {}
            return stream

    async def get_stream(self, stream_id: str) -> Optional[StreamInfo]:
        return self._streams.get(stream_id)

    async def list_streams(self) -> list[StreamInfo]:
        return [s for s in self._streams.values() if s.is_live]

    async def delete_stream(self, stream_id: str) -> bool:
        async with self._lock:
            if stream_id not in self._streams:
                return False
            del self._streams[stream_id]
            self._broadcaster_sockets.pop(stream_id, None)
            self._viewer_sockets.pop(stream_id, set())
            self._viewer_map.pop(stream_id, {})
            return True

    async def register_broadcaster(self, stream_id: str, ws: WebSocket) -> bool:
        async with self._lock:
            if stream_id not in self._streams:
                return False
            self._broadcaster_sockets[stream_id] = ws
            self._streams[stream_id].is_live = True
            return True

    async def unregister_broadcaster(self, stream_id: str):
        async with self._lock:
            self._broadcaster_sockets.pop(stream_id, None)
            if stream_id in self._streams:
                self._streams[stream_id].is_live = False

    async def register_viewer(self, stream_id: str, viewer_id: str, ws: WebSocket) -> bool:
        async with self._lock:
            if stream_id not in self._streams:
                return False
            self._viewer_sockets[stream_id].add(ws)
            self._viewer_map[stream_id][viewer_id] = ws
            self._viewer_stream[viewer_id] = stream_id
            self._streams[stream_id].viewer_count = len(self._viewer_map[stream_id])
            return True

    async def unregister_viewer(self, stream_id: str, viewer_id: str):
        async with self._lock:
            if stream_id in self._viewer_sockets:
                ws = self._viewer_map[stream_id].pop(viewer_id, None)
                if ws:
                    self._viewer_sockets[stream_id].discard(ws)
            self._viewer_stream.pop(viewer_id, None)
            if stream_id in self._streams:
                self._streams[stream_id].viewer_count = len(
                    self._viewer_map.get(stream_id, {})
                )

    def get_broadcaster_socket(self, stream_id: str) -> Optional[WebSocket]:
        return self._broadcaster_sockets.get(stream_id)

    def get_viewer_socket(self, stream_id: str, viewer_id: str) -> Optional[WebSocket]:
        return self._viewer_map.get(stream_id, {}).get(viewer_id)

    def get_all_viewer_sockets(self, stream_id: str) -> Set[WebSocket]:
        return self._viewer_sockets.get(stream_id, set()).copy()

    def get_viewer_count(self, stream_id: str) -> int:
        return len(self._viewer_map.get(stream_id, {}))

    def get_all_viewer_ids(self, stream_id: str) -> list[str]:
        return list(self._viewer_map.get(stream_id, {}).keys())


# Singleton instance
stream_registry = StreamRegistry()