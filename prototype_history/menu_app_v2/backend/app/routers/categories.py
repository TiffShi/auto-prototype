from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryOut, CategoryReorder, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get(
    "",
    response_model=list[CategoryOut],
    summary="List all categories for the authenticated owner",
)
def list_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Category]:
    return (
        db.query(Category)
        .filter(Category.owner_id == current_user.id)
        .order_by(Category.sort_order.asc(), Category.id.asc())
        .all()
    )


@router.post(
    "",
    response_model=CategoryOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new menu category",
)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Category:
    category = Category(
        owner_id=current_user.id,
        name=payload.name,
        description=payload.description,
        sort_order=payload.sort_order,
        is_published=payload.is_published,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get(
    "/{category_id}",
    response_model=CategoryOut,
    summary="Get a single category by ID",
)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Category:
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.owner_id == current_user.id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")
    return category


@router.put(
    "/{category_id}",
    response_model=CategoryOut,
    summary="Update a category",
)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Category:
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.owner_id == current_user.id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)
    return category


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a category and all its items",
)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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


@router.post(
    "/reorder",
    response_model=list[CategoryOut],
    summary="Bulk-update sort_order for multiple categories",
)
def reorder_categories(
    payload: list[CategoryReorder],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Category]:
    ids = [item.id for item in payload]
    categories = (
        db.query(Category)
        .filter(Category.id.in_(ids), Category.owner_id == current_user.id)
        .all()
    )

    category_map = {c.id: c for c in categories}
    for reorder_item in payload:
        if reorder_item.id in category_map:
            category_map[reorder_item.id].sort_order = reorder_item.sort_order

    db.commit()
    for cat in categories:
        db.refresh(cat)

    return sorted(categories, key=lambda c: c.sort_order)