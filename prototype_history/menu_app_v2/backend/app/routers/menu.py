from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, selectinload
from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime

from app.dependencies import get_db
from app.models.category import Category
from app.models.item import Item

router = APIRouter(prefix="/menu", tags=["Public Menu"])


# ── Inline response schemas for the public menu ──────────────────────────────

class PublicItemOut(BaseModel):
    id: int
    name: str
    description: str | None
    price: Decimal
    image_url: str | None
    is_available: bool
    sort_order: int

    model_config = {"from_attributes": True}


class PublicCategoryOut(BaseModel):
    id: int
    name: str
    description: str | None
    sort_order: int
    items: list[PublicItemOut]

    model_config = {"from_attributes": True}


class PublicMenuOut(BaseModel):
    restaurant_name: str
    categories: list[PublicCategoryOut]


# ── Route ─────────────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=list[PublicMenuOut],
    summary="Get all published menus (public, no auth required)",
)
def get_public_menu(db: Session = Depends(get_db)) -> list[PublicMenuOut]:
    """
    Returns all published categories (with their available items) grouped by owner.
    This endpoint is public — no authentication required.
    """
    # Eagerly load items alongside categories
    categories = (
        db.query(Category)
        .options(selectinload(Category.items))
        .filter(Category.is_published == True)  # noqa: E712
        .order_by(Category.owner_id.asc(), Category.sort_order.asc(), Category.id.asc())
        .all()
    )

    # Group by owner
    owner_map: dict[int, dict] = {}
    for cat in categories:
        owner_id = cat.owner_id
        if owner_id not in owner_map:
            owner_map[owner_id] = {
                "restaurant_name": cat.owner.restaurant_name,
                "categories": [],
            }

        available_items = sorted(
            [item for item in cat.items if item.is_available],
            key=lambda i: (i.sort_order, i.id),
        )

        owner_map[owner_id]["categories"].append(
            PublicCategoryOut(
                id=cat.id,
                name=cat.name,
                description=cat.description,
                sort_order=cat.sort_order,
                items=[PublicItemOut.model_validate(i) for i in available_items],
            )
        )

    return [
        PublicMenuOut(
            restaurant_name=data["restaurant_name"],
            categories=data["categories"],
        )
        for data in owner_map.values()
    ]


@router.get(
    "/{owner_id}",
    response_model=PublicMenuOut,
    summary="Get the published menu for a specific restaurant owner",
)
def get_owner_public_menu(owner_id: int, db: Session = Depends(get_db)) -> PublicMenuOut:
    """
    Returns the published menu for a specific restaurant owner.
    Public endpoint — no authentication required.
    """
    from app.models.user import User

    owner = db.query(User).filter(User.id == owner_id).first()
    if not owner:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found.")

    categories = (
        db.query(Category)
        .options(selectinload(Category.items))
        .filter(Category.owner_id == owner_id, Category.is_published == True)  # noqa: E712
        .order_by(Category.sort_order.asc(), Category.id.asc())
        .all()
    )

    public_categories: list[PublicCategoryOut] = []
    for cat in categories:
        available_items = sorted(
            [item for item in cat.items if item.is_available],
            key=lambda i: (i.sort_order, i.id),
        )
        public_categories.append(
            PublicCategoryOut(
                id=cat.id,
                name=cat.name,
                description=cat.description,
                sort_order=cat.sort_order,
                items=[PublicItemOut.model_validate(i) for i in available_items],
            )
        )

    return PublicMenuOut(
        restaurant_name=owner.restaurant_name,
        categories=public_categories,
    )