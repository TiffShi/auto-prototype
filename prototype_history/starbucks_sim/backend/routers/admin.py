from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models.user import User
from models.drink import Drink, DrinkModifier
from models.modifier import Modifier
from models.category import Category
from models.order import Order, OrderItem
from schemas.drink import DrinkCreate, DrinkUpdate, DrinkOut, CategoryOut, ModifierOut
from schemas.modifier import ModifierCreate
from schemas.order import OrderOut
from services.minio_service import upload_drink_image, delete_object
from routers.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


# ─── Drinks ───────────────────────────────────────────────────────────────────

@router.post("/drinks", response_model=DrinkOut, status_code=status.HTTP_201_CREATED)
def create_drink(
    data: DrinkCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    category = db.query(Category).filter(Category.id == data.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    drink = Drink(
        name=data.name,
        description=data.description,
        base_price=data.base_price,
        category_id=data.category_id,
        is_available=data.is_available,
    )
    db.add(drink)
    db.flush()

    if data.modifier_ids:
        modifiers = db.query(Modifier).filter(Modifier.id.in_(data.modifier_ids)).all()
        for mod in modifiers:
            dm = DrinkModifier(drink_id=drink.id, modifier_id=mod.id)
            db.add(dm)

    db.commit()
    db.refresh(drink)
    return _load_drink_full(db, drink.id)


@router.put("/drinks/{drink_id}", response_model=DrinkOut)
def update_drink(
    drink_id: int,
    data: DrinkUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    drink = db.query(Drink).filter(Drink.id == drink_id).first()
    if not drink:
        raise HTTPException(status_code=404, detail="Drink not found")

    if data.name is not None:
        drink.name = data.name
    if data.description is not None:
        drink.description = data.description
    if data.base_price is not None:
        drink.base_price = data.base_price
    if data.category_id is not None:
        cat = db.query(Category).filter(Category.id == data.category_id).first()
        if not cat:
            raise HTTPException(status_code=404, detail="Category not found")
        drink.category_id = data.category_id
    if data.is_available is not None:
        drink.is_available = data.is_available

    if data.modifier_ids is not None:
        db.query(DrinkModifier).filter(DrinkModifier.drink_id == drink_id).delete()
        modifiers = db.query(Modifier).filter(Modifier.id.in_(data.modifier_ids)).all()
        for mod in modifiers:
            dm = DrinkModifier(drink_id=drink.id, modifier_id=mod.id)
            db.add(dm)

    db.commit()
    db.refresh(drink)
    return _load_drink_full(db, drink.id)


@router.delete("/drinks/{drink_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_drink(
    drink_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    drink = db.query(Drink).filter(Drink.id == drink_id).first()
    if not drink:
        raise HTTPException(status_code=404, detail="Drink not found")

    if drink.image_url:
        try:
            delete_object(drink.image_url)
        except Exception:
            pass

    db.delete(drink)
    db.commit()


@router.post("/drinks/{drink_id}/image", response_model=DrinkOut)
def upload_image(
    drink_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file.content_type} not allowed. Use JPEG, PNG, WebP, or GIF.",
        )

    drink = db.query(Drink).filter(Drink.id == drink_id).first()
    if not drink:
        raise HTTPException(status_code=404, detail="Drink not found")

    # Delete old image if exists
    if drink.image_url:
        try:
            delete_object(drink.image_url)
        except Exception:
            pass

    object_name = upload_drink_image(file)
    drink.image_url = object_name
    db.commit()
    db.refresh(drink)
    return _load_drink_full(db, drink.id)


# ─── Categories ───────────────────────────────────────────────────────────────

@router.get("/categories", response_model=List[CategoryOut])
def list_categories(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return db.query(Category).order_by(Category.display_order).all()


@router.post("/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    cat = Category(name=data["name"], display_order=data.get("display_order", 0))
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


# ─── Modifiers ────────────────────────────────────────────────────────────────

@router.post("/modifiers", response_model=ModifierOut, status_code=status.HTTP_201_CREATED)
def create_modifier(
    data: ModifierCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    mod = Modifier(name=data.name, type=data.type, price_delta=data.price_delta)
    db.add(mod)
    db.commit()
    db.refresh(mod)
    return mod


@router.delete("/modifiers/{modifier_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_modifier(
    modifier_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    mod = db.query(Modifier).filter(Modifier.id == modifier_id).first()
    if not mod:
        raise HTTPException(status_code=404, detail="Modifier not found")
    db.delete(mod)
    db.commit()


# ─── Orders (admin view) ──────────────────────────────────────────────────────

@router.get("/orders", response_model=List[OrderOut])
def list_all_orders(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    from services.order_service import get_order_with_details
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return [get_order_with_details(db, o.id) for o in orders]


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _load_drink_full(db: Session, drink_id: int) -> DrinkOut:
    from schemas.drink import CategoryOut, ModifierOut
    drink = (
        db.query(Drink)
        .options(
            joinedload(Drink.category),
            joinedload(Drink.drink_modifiers).joinedload(DrinkModifier.modifier),
        )
        .filter(Drink.id == drink_id)
        .first()
    )
    return DrinkOut(
        id=drink.id,
        name=drink.name,
        description=drink.description,
        base_price=drink.base_price,
        category_id=drink.category_id,
        is_available=drink.is_available,
        image_url=drink.image_url,
        created_at=drink.created_at,
        category=CategoryOut.model_validate(drink.category),
        modifiers=[
            ModifierOut.model_validate(dm.modifier)
            for dm in drink.drink_modifiers
        ],
    )