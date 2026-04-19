import os
import uuid
from pathlib import Path

import aiofiles
from fastapi import HTTPException, UploadFile, status

# Allowed MIME types
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
}

# Allowed file extensions (extra guard)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

# Maximum file size: 10 MB
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

# Uploads directory (relative to backend root)
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")


def validate_image_file(file: UploadFile) -> None:
    """
    Validate that the uploaded file is an accepted image type.

    Raises HTTPException 400 if validation fails.
    """
    # Check MIME type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported file type '{file.content_type}'. "
                f"Accepted types: {', '.join(sorted(ALLOWED_CONTENT_TYPES))}."
            ),
        )

    # Check file extension
    if file.filename:
        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Unsupported file extension '{ext}'. "
                    f"Accepted extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}."
                ),
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must have a filename.",
        )


def generate_unique_filename(original_filename: str) -> str:
    """
    Generate a unique filename by prepending a UUID4 to the original extension.

    Example: 'photo.jpg' → 'a3f2c1d4-...-b7e9.jpg'
    """
    ext = Path(original_filename).suffix.lower()
    unique_name = f"{uuid.uuid4()}{ext}"
    return unique_name


async def save_upload_file(file: UploadFile, filename: str) -> str:
    """
    Asynchronously save an UploadFile to the uploads directory.

    Returns the full path to the saved file.
    Raises HTTPException 500 on I/O errors.
    Raises HTTPException 400 if the file exceeds the size limit.
    """
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    destination = os.path.join(UPLOADS_DIR, filename)

    try:
        total_bytes = 0
        async with aiofiles.open(destination, "wb") as out_file:
            # Stream in 64 KB chunks to avoid loading entire file into memory
            chunk_size = 64 * 1024  # 64 KB
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                total_bytes += len(chunk)
                if total_bytes > MAX_FILE_SIZE_BYTES:
                    # Clean up partial file
                    await out_file.close()
                    if os.path.exists(destination):
                        os.remove(destination)
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            f"File size exceeds the maximum allowed size of "
                            f"{MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB."
                        ),
                    )
                await out_file.write(chunk)
    except HTTPException:
        raise
    except Exception as e:
        # Clean up on unexpected error
        if os.path.exists(destination):
            os.remove(destination)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save uploaded file: {str(e)}",
        )

    return destination


def delete_file(filename: str) -> bool:
    """
    Delete a file from the uploads directory by filename.

    Returns True if the file was deleted, False if it did not exist.
    Raises HTTPException 500 on unexpected I/O errors.
    """
    file_path = os.path.join(UPLOADS_DIR, filename)
    if not os.path.exists(file_path):
        return False

    try:
        os.remove(file_path)
        return True
    except OSError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete file '{filename}': {str(e)}",
        )


def get_file_path(filename: str) -> str:
    """Return the absolute path for a given filename in the uploads directory."""
    return os.path.join(UPLOADS_DIR, filename)


def file_exists(filename: str) -> bool:
    """Check whether a file exists in the uploads directory."""
    return os.path.isfile(os.path.join(UPLOADS_DIR, filename))