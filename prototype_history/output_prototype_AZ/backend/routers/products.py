import os
import uuid
from typing import List, Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from auth import get_current_admin
from database import get_db
from models import Product, User
from schemas import ProductResponse

router = APIRouter()

UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


def save_upload_file(upload_file: UploadFile) -> str:
    """
    Validate and save an uploaded image file to the uploads directory.
    Returns the generated filename.
    """
    if upload_file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image type '{upload_file.content_type}'. Allowed: JPEG, PNG, GIF, WEBP.",
        )

    # Determine file extension from content type
    ext_map = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "image/webp": ".webp",
    }
    extension = ext_map.get(upload_file.content_type, ".jpg")

    # Generate a unique filename
    unique_filename = f"{uuid.uuid4().hex}{extension}"
    file_path = os.path.join(UPLOADS_DIR, unique_filename)

    # Read and validate file size
    contents = upload_file.file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image file size exceeds the 10 MB limit.",
        )

    # Write to disk
    with open(file_path, "wb") as f:
        f.write(contents)

    return unique_filename


def delete_image_file(filename: Optional[str]) -> None:
    """Delete an image file from the uploads directory if it exists."""
    if not filename:
        return
    file_path = os.path.join(UPLOADS_DIR, filename)
    if os.path.isfile(file_path):
        try:
            os.remove(file_path)
        except OSError:
            pass  # Non-critical; log in production


# ─── Public Endpoints ─────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=List[ProductResponse],
    summary="List All Products",
    description="Retrieve all products available in the store.",
)
def list_products(db: Session = Depends(get_db)):
    products = db.query(Product).order_by(Product.created_at.desc()).all()
    return products


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Get Single Product",
    description="Retrieve a single product by its ID.",
)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found.",
        )
    return product


# ─── Admin-Protected Endpoints ────────────────────────────────────────────────

@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Product (Admin)",
    description="Create a new product with optional image upload. Requires admin JWT.",
)
def create_product(
    name: str = Form(..., min_length=1, max_length=255),
    description: Optional[str] = Form(None),
    price: float = Form(..., gt=0),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    image_filename = None
    if image and image.filename:
        image_filename = save_upload_file(image)

    product = Product(
        name=name,
        description=description,
        price=price,
        image_filename=image_filename,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Update Product (Admin)",
    description="Update an existing product's details and/or image. Requires admin JWT.",
)
def update_product(
    product_id: int,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found.",
        )

    # Validate price if provided
    if price is not None and price <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Price must be greater than 0.",
        )

    # Update fields if provided
    if name is not None and name.strip():
        product.name = name.strip()
    if description is not None:
        product.description = description
    if price is not None:
        product.price = price

    # Handle image replacement
    if image and image.filename:
        old_filename = product.image_filename
        product.image_filename = save_upload_file(image)
        delete_image_file(old_filename)

    db.commit()
    db.refresh(product)
    return product


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Product (Admin)",
    description="Delete a product and its associated image. Requires admin JWT.",
)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found.",
        )

    # Remove associated image file
    delete_image_file(product.image_filename)

    db.delete(product)
    db.commit()
    return None