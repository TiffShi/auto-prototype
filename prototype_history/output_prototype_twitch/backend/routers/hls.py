import os
import logging
from config import settings
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from services.hls_service import hls_service
from services.stream_registry import stream_registry
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/{stream_id}/playlist.m3u8",
    summary="Get HLS playlist for a stream",
    response_class=FileResponse,
)
async def get_hls_playlist(stream_id: str):
    """
    Serve the HLS playlist (.m3u8) file for a stream.
    This is the fallback for viewers that cannot use WebRTC.
    """
    stream = await stream_registry.get_stream(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")

    playlist_path = hls_service.get_playlist_path(stream_id)
    if not playlist_path:
        raise HTTPException(
            status_code=404,
            detail="HLS playlist not available for this stream. "
                   "The stream may not have HLS enabled.",
        )

    return FileResponse(
        path=playlist_path,
        media_type="application/vnd.apple.mpegurl",
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Access-Control-Allow-Origin": settings.ALLOWED_ORIGINS[0],
        },
    )


@router.get(
    "/{stream_id}/{segment_name}",
    summary="Get HLS segment",
    response_class=FileResponse,
)
async def get_hls_segment(stream_id: str, segment_name: str):
    """
    Serve individual HLS transport stream (.ts) segments.
    """
    # Validate segment name to prevent path traversal
    if ".." in segment_name or "/" in segment_name or "\\" in segment_name:
        raise HTTPException(status_code=400, detail="Invalid segment name")

    if not segment_name.endswith(".ts"):
        raise HTTPException(status_code=400, detail="Invalid segment format")

    stream = await stream_registry.get_stream(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")

    segment_path = hls_service.get_segment_path(stream_id, segment_name)
    if not segment_path:
        raise HTTPException(status_code=404, detail="Segment not found")

    return FileResponse(
        path=segment_path,
        media_type="video/mp2t",
        headers={
            "Cache-Control": "no-cache",
            "Access-Control-Allow-Origin": settings.ALLOWED_ORIGINS[0],
        },
    )


@router.get(
    "/{stream_id}/status",
    summary="Get HLS stream status",
)
async def get_hls_status(stream_id: str):
    """Check if HLS is running for a given stream."""
    stream = await stream_registry.get_stream(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")

    is_running = hls_service.is_running(stream_id)
    playlist_available = hls_service.get_playlist_path(stream_id) is not None

    return {
        "stream_id": stream_id,
        "hls_running": is_running,
        "playlist_available": playlist_available,
        "playlist_url": f"/hls/{stream_id}/playlist.m3u8" if playlist_available else None,
    }