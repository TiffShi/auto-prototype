import os
import logging
from typing import Optional, AsyncGenerator
from fastapi import UploadFile

logger = logging.getLogger(__name__)

VIDEOS_DIR = "uploads/videos"
THUMBNAILS_DIR = "uploads/thumbnails"
CHUNK_SIZE = 1024 * 1024  # 1 MB chunks for streaming


def get_video_file_path(filename: str) -> str:
    """Return the absolute path to a video file."""
    return os.path.join(VIDEOS_DIR, filename)


def get_thumbnail_file_path(filename: str) -> str:
    """Return the absolute path to a thumbnail file."""
    return os.path.join(THUMBNAILS_DIR, filename)


async def save_video_file(file: UploadFile, filename: str) -> int:
    """
    Save an uploaded video file to disk in chunks.
    Returns the total file size in bytes.
    """
    file_path = get_video_file_path(filename)
    total_size = 0

    with open(file_path, "wb") as f:
        while True:
            chunk = await file.read(CHUNK_SIZE)
            if not chunk:
                break
            f.write(chunk)
            total_size += len(chunk)

    logger.info(f"Saved video file: {filename} ({total_size} bytes)")
    return total_size


def get_video_duration(filename: str) -> float:
    """
    Extract video duration in seconds using OpenCV.
    Returns 0.0 if extraction fails.
    """
    try:
        import cv2
        video_path = get_video_file_path(filename)
        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            logger.warning(f"Could not open video for duration extraction: {filename}")
            return 0.0

        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
        cap.release()

        if fps and fps > 0 and frame_count > 0:
            duration = frame_count / fps
            logger.info(f"Video duration for {filename}: {duration:.2f}s")
            return round(duration, 2)

        return 0.0

    except Exception as e:
        logger.error(f"Failed to get duration for {filename}: {e}")
        return 0.0


def generate_thumbnail(video_filename: str, thumbnail_filename: str) -> bool:
    """
    Extract a frame at the 1-second mark (or first available frame) from the video
    and save it as a JPEG thumbnail.
    Returns True on success, False on failure.
    """
    try:
        import cv2

        video_path = get_video_file_path(video_filename)
        thumbnail_path = get_thumbnail_file_path(thumbnail_filename)

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            logger.warning(f"Could not open video for thumbnail: {video_filename}")
            return False

        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = cap.get(cv2.CAP_PROP_FRAME_COUNT)

        # Try to seek to 1 second mark; fall back to frame 0
        target_frame = int(fps * 1.0) if fps and fps > 0 else 0
        if target_frame >= total_frames:
            target_frame = 0

        cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame)
        ret, frame = cap.read()
        cap.release()

        if not ret or frame is None:
            logger.warning(f"Could not read frame from video: {video_filename}")
            return False

        # Resize thumbnail to 640x360 (16:9) maintaining aspect ratio
        height, width = frame.shape[:2]
        target_w, target_h = 640, 360

        # Calculate crop/resize to fill 640x360
        aspect = width / height
        target_aspect = target_w / target_h

        if aspect > target_aspect:
            # Wider than target — scale by height
            new_h = target_h
            new_w = int(aspect * new_h)
        else:
            # Taller than target — scale by width
            new_w = target_w
            new_h = int(new_w / aspect)

        resized = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_AREA)

        # Center crop
        x_start = (new_w - target_w) // 2
        y_start = (new_h - target_h) // 2
        cropped = resized[y_start:y_start + target_h, x_start:x_start + target_w]

        # Save as JPEG with quality 85
        success = cv2.imwrite(thumbnail_path, cropped, [cv2.IMWRITE_JPEG_QUALITY, 85])

        if success:
            logger.info(f"Generated thumbnail: {thumbnail_filename}")
        else:
            logger.error(f"Failed to write thumbnail: {thumbnail_filename}")

        return success

    except Exception as e:
        logger.error(f"Thumbnail generation failed for {video_filename}: {e}")
        return False


def delete_video_files(video_filename: Optional[str], thumbnail_filename: Optional[str]) -> None:
    """Remove video and thumbnail files from disk. Silently ignores missing files."""
    if video_filename:
        video_path = get_video_file_path(video_filename)
        try:
            if os.path.exists(video_path):
                os.remove(video_path)
                logger.info(f"Deleted video file: {video_filename}")
        except OSError as e:
            logger.error(f"Failed to delete video file {video_filename}: {e}")

    if thumbnail_filename:
        thumbnail_path = get_thumbnail_file_path(thumbnail_filename)
        try:
            if os.path.exists(thumbnail_path):
                os.remove(thumbnail_path)
                logger.info(f"Deleted thumbnail file: {thumbnail_filename}")
        except OSError as e:
            logger.error(f"Failed to delete thumbnail file {thumbnail_filename}: {e}")


def stream_video_file(file_path: str, start: int, end: int):
    """
    Generator that yields video file bytes in chunks for HTTP range streaming.
    Supports seeking by reading from the specified byte range.
    """
    with open(file_path, "rb") as f:
        f.seek(start)
        remaining = end - start + 1

        while remaining > 0:
            read_size = min(CHUNK_SIZE, remaining)
            data = f.read(read_size)
            if not data:
                break
            yield data
            remaining -= len(data)