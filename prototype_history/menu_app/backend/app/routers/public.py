from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.dependencies import get_db
from app.models.category import Category
from app.models.menu_item import MenuItem
from app.schemas.category import CategoryWithItemsResponse

router = APIRouter(prefix="/public", tags=["Public Menu"])


@router.get(
    "/menu",
    response_model=list[CategoryWithItemsResponse],
    summary="Get the full public menu (no authentication required)",
)
def get_public_menu(db: Session = Depends(get_db)) -> list[Category]:
    """
    Returns all categories with their available menu items.
    Only items where is_available=True are included.
    This endpoint requires no authentication.
    """
    categories = (
        db.query(Category)
        .options(joinedload(Category.menu_items))
        .order_by(Category.sort_order, Category.name)
        .all()
    )

    # Filter each category's items to only available ones
    for category in categories:
        category.menu_items = sorted(
            [item for item in category.menu_items if item.is_available],
            key=lambda x: (x.sort_order, x.name),
        )

    return categories