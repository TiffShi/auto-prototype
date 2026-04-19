import os
import uuid
import shutil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from sqlalchemy.orm import Session

from database import get_db
from models import Video
from schemas import VideoResponse, VideoListResponse, ViewCountResponse, DeleteResponse
from services.video_service import (
    save_video_file,
    generate_thumbnail,
    get_video_duration,
    get_video_file_path,
    get_thumbnail_file_path,
    delete_video_files,
    stream_video_file,
)

router = APIRouter()

ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/ogg", "video/quicktime"}
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500 MB


@router.get("", response_model=VideoListResponse)
def list_videos(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Return all videos ordered by most recently uploaded."""
    videos = (
        db.query(Video)
        .order_by(Video.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    total = db.query(Video).count()
    return VideoListResponse(videos=videos, total=total)


@router.post("/upload", response_model=VideoResponse, status_code=201)
async def upload_video(
    title: str = Form(...),
    description: Optional[str] = Form(""),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a new video with metadata. Generates a thumbnail automatically."""
    # Validate content type
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Allowed: mp4, webm, ogg, quicktime"
        )

    # Validate title
    if not title or not title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty")

    video_id = str(uuid.uuid4())

    # Determine file extension
    ext_map = {
        "video/mp4": ".mp4",
        "video/webm": ".webm",
        "video/ogg": ".ogv",
        "video/quicktime": ".mov",
    }
    extension = ext_map.get(file.content_type, ".mp4")
    video_filename = f"{video_id}{extension}"
    thumbnail_filename = f"{video_id}.jpg"

    try:
        # Save video file to disk
        file_size = await save_video_file(file, video_filename)

        # Get video duration
        duration = get_video_duration(video_filename)

        # Generate thumbnail
        thumb_success = generate_thumbnail(video_filename, thumbnail_filename)
        if not thumb_success:
            thumbnail_filename = None

        # Persist metadata to database
        video = Video(
            id=video_id,
            title=title.strip(),
            description=description.strip() if description else "",
            filename=video_filename,
            thumbnail_filename=thumbnail_filename,
            file_size=file_size,
            duration=duration,
            views=0,
        )
        db.add(video)
        db.commit()
        db.refresh(video)

        return video

    except Exception as e:
        # Clean up any partially saved files on failure
        delete_video_files(video_filename, thumbnail_filename)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/{video_id}", response_model=VideoResponse)
def get_video(video_id: str, db: Session = Depends(get_db)):
    """Get metadata for a single video by ID."""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video


@router.get("/{video_id}/stream")
def stream_video(video_id: str, request: Request, db: Session = Depends(get_db)):
    """Stream video file with HTTP Range request support for seeking."""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    video_path = get_video_file_path(video.filename)
    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video file not found on disk")

    file_size = os.path.getsize(video_path)
    range_header = request.headers.get("Range")

    # Determine MIME type
    mime_map = {
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".ogv": "video/ogg",
        ".mov": "video/mp4",
    }
    _, ext = os.path.splitext(video.filename)
    content_type = mime_map.get(ext.lower(), "video/mp4")

    if range_header:
        # Parse Range header: "bytes=start-end"
        try:
            range_value = range_header.strip().replace("bytes=", "")
            parts = range_value.split("-")
            start = int(parts[0]) if parts[0] else 0
            end = int(parts[1]) if parts[1] else file_size - 1
        except (ValueError, IndexError):
            raise HTTPException(status_code=416, detail="Invalid Range header")

        if start >= file_size or end >= file_size or start > end:
            raise HTTPException(
                status_code=416,
                detail="Requested range not satisfiable"
            )

        chunk_size = end - start + 1
        headers = {
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(chunk_size),
            "Content-Type": content_type,
        }

        return StreamingResponse(
            stream_video_file(video_path, start, end),
            status_code=206,
            headers=headers,
            media_type=content_type,
        )
    else:
        # No range header — serve entire file
        headers = {
            "Accept-Ranges": "bytes",
            "Content-Length": str(file_size),
            "Content-Type": content_type,
        }
        return StreamingResponse(
            stream_video_file(video_path, 0, file_size - 1),
            status_code=200,
            headers=headers,
            media_type=content_type,
        )


@router.get("/{video_id}/thumbnail")
def get_thumbnail(video_id: str, db: Session = Depends(get_db)):
    """Serve the thumbnail image for a video."""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    if not video.thumbnail_filename:
        raise HTTPException(status_code=404, detail="No thumbnail available for this video")

    thumbnail_path = get_thumbnail_file_path(video.thumbnail_filename)
    if not os.path.exists(thumbnail_path):
        raise HTTPException(status_code=404, detail="Thumbnail file not found on disk")

    return FileResponse(
        thumbnail_path,
        media_type="image/jpeg",
        headers={"Cache-Control": "public, max-age=86400"},
    )


@router.patch("/{video_id}/view", response_model=ViewCountResponse)
def increment_view(video_id: str, db: Session = Depends(get_db)):
    """Increment the view count for a video."""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    video.views += 1
    db.commit()
    db.refresh(video)

    return ViewCountResponse(id=video.id, views=video.views)


@router.delete("/{video_id}", response_model=DeleteResponse)
def delete_video(video_id: str, db: Session = Depends(get_db)):
    """Delete a video and its associated files from disk and database."""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    video_filename = video.filename
    thumbnail_filename = video.thumbnail_filename

    # Remove from database first
    db.delete(video)
    db.commit()

    # Remove files from disk
    delete_video_files(video_filename, thumbnail_filename)

    return DeleteResponse(message="Video deleted successfully", id=video_id)