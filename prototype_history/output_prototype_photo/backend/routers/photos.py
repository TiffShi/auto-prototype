import os
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from database import (
    delete_photo,
    get_all_photos,
    get_photo_by_id,
    save_photo,
)
from models import MessageResponse, Photo, PhotoListResponse, PhotoResponse
from utils.file_handler import (
    delete_file,
    generate_unique_filename,
    save_upload_file,
    validate_image_file,
)

router = APIRouter()

# Base URL for constructing photo URLs — matches the static mount point
BASE_URL = "http://localhost:8080"


@router.get("", response_model=PhotoListResponse, summary="Get all photos")
async def get_photos():
    """
    Retrieve all uploaded photos, sorted by upload date (newest first).
    """
    photos = get_all_photos()
    photo_responses = [PhotoResponse.from_photo(p) for p in photos]
    return PhotoListResponse(photos=photo_responses, total=len(photo_responses))


@router.post(
    "/upload",
    response_model=PhotoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a new photo",
)
async def upload_photo(
    file: UploadFile = File(..., description="Image file to upload"),
    title: str = Form(..., min_length=1, max_length=200, description="Photo title"),
    description: str = Form(default="", max_length=1000, description="Photo description"),
):
    """
    Upload a new photo with a title and optional description.

    Accepted formats: JPEG, PNG, GIF, WebP.
    """
    # Validate the uploaded file
    validate_image_file(file)

    # Generate a safe, unique filename
    unique_filename = generate_unique_filename(file.filename)

    # Save the file to disk
    await save_upload_file(file, unique_filename)

    # Build the public URL
    photo_url = f"{BASE_URL}/uploads/{unique_filename}"

    # Create and persist the photo record
    photo = Photo(
        title=title.strip(),
        description=description.strip(),
        filename=unique_filename,
        url=photo_url,
    )
    saved_photo = save_photo(photo)

    return PhotoResponse.from_photo(saved_photo)


@router.get("/{photo_id}", response_model=PhotoResponse, summary="Get a single photo")
async def get_photo(photo_id: str):
    """
    Retrieve metadata for a single photo by its UUID.
    """
    photo = get_photo_by_id(photo_id)
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Photo with id '{photo_id}' not found.",
        )
    return PhotoResponse.from_photo(photo)


@router.delete(
    "/{photo_id}",
    response_model=MessageResponse,
    summary="Delete a photo",
)
async def remove_photo(photo_id: str):
    """
    Delete a photo by its UUID. Removes both the database record and the image file.
    """
    # Fetch the record first so we know the filename
    photo = get_photo_by_id(photo_id)
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Photo with id '{photo_id}' not found.",
        )

    # Remove from database
    deleted = delete_photo(photo_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete photo record from database.",
        )

    # Remove the physical file (best-effort; log but don't fail if missing)
    file_deleted = delete_file(photo.filename)
    if not file_deleted:
        print(f"[photos] Warning: file '{photo.filename}' was not found on disk during deletion.")

    return MessageResponse(
        message=f"Photo '{photo.title}' deleted successfully.",
        success=True,
    )