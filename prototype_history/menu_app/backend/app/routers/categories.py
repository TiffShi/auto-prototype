from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_owner
from app.models.category import Category
from app.models.user import User
from app.schemas.category import (
    CategoryCreateRequest,
    CategoryUpdateRequest,
    CategoryResponse,
)
import uuid

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get(
    "",
    response_model=list[CategoryResponse],
    summary="List all categories for the authenticated owner",
)
def list_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_owner),
) -> list[Category]:
    return (
        db.query(Category)
        .filter(Category.owner_id == current_user.id)
        .order_by(Category.sort_order, Category.name)
        .all()
    )


@router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new menu category",
)
def create_category(
    payload: CategoryCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_owner),
) -> Category:
    category = Category(
        name=payload.name,
        sort_order=payload.sort_order,
        owner_id=current_user.id,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put(
    "/{category_id}",
    response_model=CategoryResponse,
    summary="Update an existing category",
)
def update_category(
    category_id: uuid.UUID,
    payload: CategoryUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_owner),
) -> Category:
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.owner_id == current_user.id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    if payload.name is not None:
        category.name = payload.name
    if payload.sort_order is not None:
        category.sort_order = payload.sort_order

    db.commit()
    db.refresh(category)
    return category


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a category and all its items",
)
def delete_category(
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_owner),
) -> None:
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.owner_id == current_user.id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    db.delete(category)
    db.commit()