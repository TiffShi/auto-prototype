import uuid
from pathlib import PurePosixPath

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.category import Category
from app.models.item import Item
from app.models.user import User
from app.schemas.item import ItemCreate, ItemOut, ItemReorder, ItemUpdate
from app.services import storage_service

router = APIRouter(prefix="/items", tags=["Items"])

# Allowed image MIME types
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


def _assert_category_owned(category_id: int, owner_id: int, db: Session) -> Category:
    """Raise 404 if the category doesn't exist or doesn't belong to the owner."""
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.owner_id == owner_id)
        .first()
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found or does not belong to you.",
        )
    return category


def _assert_item_owned(item_id: int, owner_id: int, db: Session) -> Item:
    """Raise 404 if the item doesn't exist or its category doesn't belong to the owner."""
    item = (
        db.query(Item)
        .join(Category, Item.category_id == Category.id)
        .filter(Item.id == item_id, Category.owner_id == owner_id)
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found or does not belong to you.",
        )
    return item


@router.get(
    "",
    response_model=list[ItemOut],
    summary="List all items for the authenticated owner",
)
def list_items(
    category_id: int | None = Query(None, description="Filter by category ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Item]:
    query = (
        db.query(Item)
        .join(Category, Item.category_id == Category.id)
        .filter(Category.owner_id == current_user.id)
    )
    if category_id is not None:
        query = query.filter(Item.category_id == category_id)

    return query.order_by(Item.sort_order.asc(), Item.id.asc()).all()


@router.post(
    "",
    response_model=ItemOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new menu item",
)
def create_item(
    payload: ItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Item:
    _assert_category_owned(payload.category_id, current_user.id, db)

    item = Item(
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


@router.get(
    "/{item_id}",
    response_model=ItemOut,
    summary="Get a single item by ID",
)
def get_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Item:
    return _assert_item_owned(item_id, current_user.id, db)


@router.put(
    "/{item_id}",
    response_model=ItemOut,
    summary="Update a menu item",
)
def update_item(
    item_id: int,
    payload: ItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Item:
    item = _assert_item_owned(item_id, current_user.id, db)

    # If category_id is being changed, verify the new category is also owned
    update_data = payload.model_dump(exclude_unset=True)
    if "category_id" in update_data:
        _assert_category_owned(update_data["category_id"], current_user.id, db)

    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a menu item",
)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    item = _assert_item_owned(item_id, current_user.id, db)

    # Clean up image from MinIO if present
    if item.image_url:
        object_name = storage_service.extract_object_name_from_url(item.image_url)
        if object_name:
            storage_service.delete_file(object_name)

    db.delete(item)
    db.commit()


@router.post(
    "/{item_id}/image",
    response_model=ItemOut,
    summary="Upload or replace the image for a menu item",
)
async def upload_item_image(
    item_id: int,
    file: UploadFile = File(..., description="Image file (JPEG, PNG, WebP, GIF)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Item:
    item = _assert_item_owned(item_id, current_user.id, db)

    # Validate content type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type '{file.content_type}'. "
                   f"Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}",
        )

    file_data = await file.read()

    # Validate file size
    if len(file_data) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image exceeds maximum allowed size of {MAX_IMAGE_SIZE_BYTES // (1024 * 1024)} MB.",
        )

    # Delete old image if it exists
    if item.image_url:
        old_object_name = storage_service.extract_object_name_from_url(item.image_url)
        if old_object_name:
            storage_service.delete_file(old_object_name)

    # Build a unique object name
    extension = PurePosixPath(file.filename or "image").suffix or ".jpg"
    object_name = f"items/{item_id}/{uuid.uuid4().hex}{extension}"

    public_url = storage_service.upload_file(
        object_name=object_name,
        file_data=file_data,
        content_type=file.content_type,
    )

    item.image_url = public_url
    db.commit()
    db.refresh(item)
    return item


@router.post(
    "/reorder",
    response_model=list[ItemOut],
    summary="Bulk-update sort_order for multiple items",
)
def reorder_items(
    payload: list[ItemReorder],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Item]:
    ids = [entry.id for entry in payload]
    items = (
        db.query(Item)
        .join(Category, Item.category_id == Category.id)
        .filter(Item.id.in_(ids), Category.owner_id == current_user.id)
        .all()
    )

    item_map = {i.id: i for i in items}
    for reorder_entry in payload:
        if reorder_entry.id in item_map:
            item_map[reorder_entry.id].sort_order = reorder_entry.sort_order

    db.commit()
    for itm in items:
        db.refresh(itm)

    return sorted(items, key=lambda i: i.sort_order)