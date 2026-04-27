import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_owner
from app.models.category import Category
from app.models.menu_item import MenuItem
from app.models.user import User
from app.schemas.menu_item import (
    MenuItemCreateRequest,
    MenuItemUpdateRequest,
    MenuItemResponse,
    ImageUploadResponse,
)
from app.services.storage_service import upload_image, delete_image, ensure_bucket_exists

router = APIRouter(prefix="/menu-items", tags=["Menu Items"])

# Allowed MIME types for image uploads
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


def _get_item_for_owner(
    item_id: uuid.UUID, current_user: User, db: Session
) -> MenuItem:
    """Fetch a MenuItem that belongs to the current owner, or raise 404."""
    item = (
        db.query(MenuItem)
        .join(Category, MenuItem.category_id == Category.id)
        .filter(MenuItem.id == item_id, Category.owner_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found.")
    return item


@router.get(
    "",
    response_model=list[MenuItemResponse],
    summary="List all menu items for the authenticated owner",
)
def list_menu_items(
    category_id: uuid.UUID | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_owner),
) -> list[MenuItem]:
    query = (
        db.query(MenuItem)
        .join(Category, MenuItem.category_id == Category.id)
        .filter(Category.owner_id == current_user.id)
    )
    if category_id:
        query = query.filter(MenuItem.category_id == category_id)

    return query.order_by(MenuItem.sort_order, MenuItem.name).all()


@router.post(
    "",
    response_model=MenuItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new menu item",
)
def create_menu_item(
    payload: MenuItemCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_owner),
) -> MenuItem:
    # Verify the category belongs to the current owner
    category = (
        db.query(Category)
        .filter(Category.id == payload.category_id, Category.owner_id == current_user.id)
        .first()
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found or does not belong to you.",
        )

    item = MenuItem(
        category_id=payload.category_id,
        name=payload.name,
        description=payload.description,
        price=payload.price,
        is_available=payload.is_available,
        sort_order=payload.sort_order,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put(
    "/{item_id}",
    response_model=MenuItemResponse,
    summary="Update an existing menu item",
)
def update_menu_item(
    item_id: uuid.UUID,
    payload: MenuItemUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_owner),
) -> MenuItem:
    item = _get_item_for_owner(item_id, current_user, db)

    # If changing category, verify the new category belongs to the owner
    if payload.category_id is not None:
        new_category = (
            db.query(Category)
            .filter(
                Category.id == payload.category_id,
                Category.owner_id == current_user.id,
            )
            .first()
        )
        if not new_category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target category not found or does not belong to you.",
            )
        item.category_id = payload.category_id

    if payload.name is not None:
        item.name = payload.name
    if payload.description is not None:
        item.description = payload.description
    if payload.price is not None:
        item.price = payload.price
    if payload.is_available is not None:
        item.is_available = payload.is_available
    if payload.sort_order is not None:
        item.sort_order = payload.sort_order

    db.commit()
    db.refresh(item)
    return item


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a menu item",
)
def delete_menu_item(
    item_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_owner),
) -> None:
    item = _get_item_for_owner(item_id, current_user, db)

    # Clean up image from MinIO if present
    if item.image_url:
        try:
            delete_image(item.image_url)
        except Exception:
            pass  # Non-fatal: log but don't block deletion

    db.delete(item)
    db.commit()


@router.post(
    "/{item_id}/upload-image",
    response_model=ImageUploadResponse,
    summary="Upload an image for a menu item",
)
async def upload_item_image(
    item_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_owner),
) -> ImageUploadResponse:
    item = _get_item_for_owner(item_id, current_user, db)

    # Validate content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{file.content_type}'. Allowed: {ALLOWED_CONTENT_TYPES}",
        )

    file_data = await file.read()

    # Validate file size
    if len(file_data) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum allowed size is {MAX_IMAGE_SIZE_BYTES // (1024 * 1024)} MB.",
        )

    # Ensure the MinIO bucket exists before uploading
    ensure_bucket_exists()

    # Delete old image if one exists
    if item.image_url:
        try:
            delete_image(item.image_url)
        except Exception:
            pass

    public_url = upload_image(
        file_data=file_data,
        content_type=file.content_type,
        original_filename=file.filename or "upload.jpg",
    )

    item.image_url = public_url
    db.commit()
    db.refresh(item)

    return ImageUploadResponse(image_url=public_url)