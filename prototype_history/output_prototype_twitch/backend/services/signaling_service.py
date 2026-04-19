import json
import logging
from typing import Optional
from fastapi import WebSocket, WebSocketDisconnect

from services.stream_registry import stream_registry

logger = logging.getLogger(__name__)


class SignalingService:
    """
    Handles WebRTC signaling relay between broadcaster and viewers.
    Relays SDP offers/answers and ICE candidates.
    """

    async def relay_to_broadcaster(self, stream_id: str, message: dict) -> bool:
        """Send a signaling message to the broadcaster of a stream."""
        broadcaster_ws = stream_registry.get_broadcaster_socket(stream_id)
        if not broadcaster_ws:
            logger.warning(f"No broadcaster found for stream {stream_id}")
            return False
        try:
            await broadcaster_ws.send_text(json.dumps(message))
            return True
        except Exception as e:
            logger.error(f"Failed to relay to broadcaster {stream_id}: {e}")
            return False

    async def relay_to_viewer(
        self, stream_id: str, viewer_id: str, message: dict
    ) -> bool:
        """Send a signaling message to a specific viewer."""
        viewer_ws = stream_registry.get_viewer_socket(stream_id, viewer_id)
        if not viewer_ws:
            logger.warning(f"No viewer {viewer_id} found for stream {stream_id}")
            return False
        try:
            await viewer_ws.send_text(json.dumps(message))
            return True
        except Exception as e:
            logger.error(f"Failed to relay to viewer {viewer_id}: {e}")
            return False

    async def broadcast_to_all_viewers(self, stream_id: str, message: dict):
        """Broadcast a message to all viewers of a stream."""
        viewer_sockets = stream_registry.get_all_viewer_sockets(stream_id)
        disconnected = []
        for ws in viewer_sockets:
            try:
                await ws.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Failed to send to viewer: {e}")
                disconnected.append(ws)

    async def notify_viewer_count(self, stream_id: str):
        """Notify broadcaster and all viewers of updated viewer count."""
        count = stream_registry.get_viewer_count(stream_id)
        message = {
            "type": "viewer_count",
            "payload": {"count": count, "stream_id": stream_id},
        }
        # Notify broadcaster
        await self.relay_to_broadcaster(stream_id, message)
        # Notify all viewers
        await self.broadcast_to_all_viewers(stream_id, message)

    async def handle_broadcaster_message(
        self, stream_id: str, raw_message: str
    ):
        """
        Process a message from the broadcaster and relay to appropriate viewer(s).
        Expected message types:
          - answer: SDP answer for a specific viewer
          - ice-candidate: ICE candidate for a specific viewer
          - stream-ended: notify all viewers
        """
        try:
            message = json.loads(raw_message)
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON from broadcaster: {raw_message}")
            return

        msg_type = message.get("type")
        target_id = message.get("target_id")

        if msg_type in ("answer", "ice-candidate-to-viewer"):
            if target_id:
                await self.relay_to_viewer(stream_id, target_id, message)
            else:
                logger.warning(f"No target_id for {msg_type} message")

        elif msg_type == "stream-ended":
            await self.broadcast_to_all_viewers(
                stream_id,
                {"type": "stream-ended", "payload": {"stream_id": stream_id}},
            )

        elif msg_type == "offer-to-viewer":
            # Broadcaster proactively sends offer to a viewer
            if target_id:
                await self.relay_to_viewer(stream_id, target_id, message)

        else:
            logger.debug(f"Unknown broadcaster message type: {msg_type}")

    async def handle_viewer_message(
        self, stream_id: str, viewer_id: str, raw_message: str
    ):
        """
        Process a message from a viewer and relay to the broadcaster.
        Expected message types:
          - offer: SDP offer from viewer to broadcaster
          - ice-candidate: ICE candidate from viewer
          - request-offer: viewer requests broadcaster to send an offer
        """
        try:
            message = json.loads(raw_message)
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON from viewer {viewer_id}: {raw_message}")
            return

        msg_type = message.get("type")

        # Attach viewer_id so broadcaster knows who to respond to
        message["sender_id"] = viewer_id

        if msg_type in ("offer", "ice-candidate", "request-offer"):
            await self.relay_to_broadcaster(stream_id, message)
        else:
            logger.debug(f"Unknown viewer message type: {msg_type}")


# Singleton instance
signaling_service = SignalingService()