import logging
from typing import List
from fastapi import APIRouter, HTTPException, status, Request

from models.stream import StreamCreate, StreamResponse, StreamInfo, StreamUpdate
from services.stream_registry import stream_registry
from services.chat_service import chat_service
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


def _build_stream_response(stream: StreamInfo, host: str = "localhost") -> StreamResponse:
    """Build a StreamResponse with WebSocket and HLS URLs."""
    ws_url = f"ws://{host}:{settings.PORT}/ws/watch/{stream.stream_id}"
    hls_url = f"http://{host}:{settings.PORT}/hls/{stream.stream_id}/playlist.m3u8"
    return StreamResponse(
        stream_id=stream.stream_id,
        title=stream.title,
        broadcaster_name=stream.broadcaster_name,
        description=stream.description,
        viewer_count=stream.viewer_count,
        started_at=stream.started_at,
        is_live=stream.is_live,
        ws_url=ws_url,
        hls_url=hls_url,
    )


@router.post(
    "/",
    response_model=StreamResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new stream",
)
async def create_stream(data: StreamCreate, request: Request):
    """
    Create a new stream entry. The broadcaster calls this before connecting
    their WebSocket for signaling.
    """
    active_streams = await stream_registry.list_streams()
    if len(active_streams) >= settings.MAX_STREAMS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Maximum number of concurrent streams ({settings.MAX_STREAMS}) reached.",
        )

    stream = await stream_registry.create_stream(data)
    logger.info(f"Stream created: {stream.stream_id} by {stream.broadcaster_name}")
    host = request.client.host
    return _build_stream_response(stream, host)


@router.get(
    "/",
    response_model=List[StreamResponse],
    summary="List all active streams",
)
async def list_streams(request: Request):
    """Return all currently live streams."""
    streams = await stream_registry.list_streams()
    host = request.headers.get("x-forwarded-for", request.client.host).split(",")[0].strip()
    return [_build_stream_response(s, host) for s in streams]


@router.get(
    "/{stream_id}",
    response_model=StreamResponse,
    summary="Get stream details",
)
async def get_stream(stream_id: str, request: Request):
    """Get details for a specific stream by ID."""
    stream = await stream_registry.get_stream(stream_id)
    if not stream:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Stream {stream_id} not found.")
    host = request.headers.get("x-forwarded-for", request.client.host).split(",")[0].strip()
    return _build_stream_response(stream, host)


@router.patch(
    "/{stream_id}",
    response_model=StreamResponse,
    summary="Update stream metadata",
)
async def update_stream(stream_id: str, data: StreamUpdate, request: Request):
    """Update stream title or description."""
    stream = await stream_registry.get_stream(stream_id)
    if not stream:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Stream {stream_id} not found.")
    if data.title is not None:
        stream.title = data.title
    if data.description is not None:
        stream.description = data.description
    host = request.headers.get("x-forwarded-for", request.client.host).split(",")[0].strip()
    return _build_stream_response(stream, host)


@router.delete(
    "/{stream_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete/end a stream",
)
async def delete_stream(stream_id: str):
    """End and remove a stream. Called by broadcaster when stopping."""
    deleted = await stream_registry.delete_stream(stream_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stream {stream_id} not found.",
        )
    # Clean up chat history
    chat_service.clear_stream(stream_id)
    logger.info(f"Stream deleted: {stream_id}")