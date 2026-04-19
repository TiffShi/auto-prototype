import json
import uuid
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException

from services.stream_registry import stream_registry
from services.signaling_service import signaling_service
from services.chat_service import chat_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/broadcast/{stream_id}")
async def broadcaster_websocket(websocket: WebSocket, stream_id: str):
    """
    WebSocket endpoint for the broadcaster.
    Handles:
      - WebRTC signaling relay (answer/ICE to viewers)
      - Receiving viewer count updates
      - Stream lifecycle management
    """
    stream = await stream_registry.get_stream(stream_id)
    if not stream:
        await websocket.close(code=4004, reason="Stream not found")
        return

    await websocket.accept()
    registered = await stream_registry.register_broadcaster(stream_id, websocket)
    if not registered:
        await websocket.close(code=4004, reason="Failed to register broadcaster")
        return

    logger.info(f"Broadcaster connected to stream {stream_id}")

    # Notify broadcaster of current viewer count
    await websocket.send_text(json.dumps({
        "type": "connected",
        "payload": {
            "stream_id": stream_id,
            "viewer_count": stream_registry.get_viewer_count(stream_id),
        }
    }))

    try:
        while True:
            raw = await websocket.receive_text()
            await signaling_service.handle_broadcaster_message(stream_id, raw)

    except WebSocketDisconnect:
        logger.info(f"Broadcaster disconnected from stream {stream_id}")
    except Exception as e:
        logger.error(f"Broadcaster WS error on stream {stream_id}: {e}")
    finally:
        await stream_registry.unregister_broadcaster(stream_id)
        # Notify all viewers that stream ended
        await signaling_service.broadcast_to_all_viewers(
            stream_id,
            {
                "type": "stream-ended",
                "payload": {"stream_id": stream_id},
            },
        )
        logger.info(f"Broadcaster cleanup complete for stream {stream_id}")


@router.websocket("/watch/{stream_id}")
async def viewer_websocket(websocket: WebSocket, stream_id: str):
    """
    WebSocket endpoint for viewers.
    Handles:
      - WebRTC signaling relay (offer/ICE to broadcaster)
      - Chat messages
      - Viewer count tracking
    """
    stream = await stream_registry.get_stream(stream_id)
    if not stream:
        await websocket.close(code=4004, reason="Stream not found")
        return

    viewer_id = str(uuid.uuid4())
    await websocket.accept()

    registered = await stream_registry.register_viewer(stream_id, viewer_id, websocket)
    if not registered:
        await websocket.close(code=4004, reason="Failed to register viewer")
        return

    logger.info(f"Viewer {viewer_id} connected to stream {stream_id}")

    # Send viewer their ID and chat history
    chat_history = chat_service.get_history(stream_id)
    await websocket.send_text(json.dumps({
        "type": "connected",
        "payload": {
            "viewer_id": viewer_id,
            "stream_id": stream_id,
            "chat_history": [
                {
                    "message_id": m.message_id,
                    "username": m.username,
                    "content": m.content,
                    "timestamp": m.timestamp.isoformat(),
                    "color": m.color,
                }
                for m in chat_history
            ],
        },
    }))

    # Notify broadcaster and all viewers of updated count
    await signaling_service.notify_viewer_count(stream_id)

    # Notify broadcaster that a new viewer joined (so it can send an offer)
    await signaling_service.relay_to_broadcaster(
        stream_id,
        {
            "type": "viewer-joined",
            "payload": {
                "viewer_id": viewer_id,
                "stream_id": stream_id,
            },
        },
    )

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                message = json.loads(raw)
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON from viewer {viewer_id}")
                continue

            msg_type = message.get("type")

            if msg_type == "chat":
                # Handle chat message
                username = message.get("payload", {}).get("username", "Anonymous")
                content = message.get("payload", {}).get("content", "")
                if content.strip():
                    chat_msg = chat_service.create_message(stream_id, username, content)
                    broadcast_payload = json.dumps({
                        "type": "chat",
                        "payload": {
                            "message_id": chat_msg.message_id,
                            "username": chat_msg.username,
                            "content": chat_msg.content,
                            "timestamp": chat_msg.timestamp.isoformat(),
                            "color": chat_msg.color,
                        },
                    })
                    # Broadcast to all viewers
                    viewer_sockets = stream_registry.get_all_viewer_sockets(stream_id)
                    for vs in viewer_sockets:
                        try:
                            await vs.send_text(broadcast_payload)
                        except Exception:
                            pass
                    # Also send to broadcaster
                    await signaling_service.relay_to_broadcaster(
                        stream_id,
                        json.loads(broadcast_payload),
                    )

            elif msg_type in ("offer", "ice-candidate", "request-offer"):
                # WebRTC signaling — relay to broadcaster
                await signaling_service.handle_viewer_message(stream_id, viewer_id, raw)

            else:
                logger.debug(f"Unknown viewer message type: {msg_type}")

    except WebSocketDisconnect:
        logger.info(f"Viewer {viewer_id} disconnected from stream {stream_id}")
    except Exception as e:
        logger.error(f"Viewer WS error {viewer_id} on stream {stream_id}: {e}")
    finally:
        await stream_registry.unregister_viewer(stream_id, viewer_id)
        # Notify broadcaster viewer left
        await signaling_service.relay_to_broadcaster(
            stream_id,
            {
                "type": "viewer-left",
                "payload": {
                    "viewer_id": viewer_id,
                    "stream_id": stream_id,
                },
            },
        )
        # Update viewer count for everyone
        await signaling_service.notify_viewer_count(stream_id)
        logger.info(f"Viewer {viewer_id} cleanup complete for stream {stream_id}")