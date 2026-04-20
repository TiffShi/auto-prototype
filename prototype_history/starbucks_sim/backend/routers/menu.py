from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models.category import Category
from models.drink import Drink, DrinkModifier
from models.modifier import Modifier
from schemas.drink import CategoryOut, DrinkOut, DrinkListOut, ModifierOut

router = APIRouter(prefix="/api", tags=["menu"])


@router.get("/categories", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return (
        db.query(Category)
        .order_by(Category.display_order, Category.name)
        .all()
    )


@router.get("/drinks", response_model=List[DrinkListOut])
def list_drinks(
    category_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Drink)
        .options(joinedload(Drink.category))
        .filter(Drink.is_available == True)
    )

    if category_id is not None:
        query = query.filter(Drink.category_id == category_id)

    if search:
        query = query.filter(Drink.name.ilike(f"%{search}%"))

    return query.order_by(Drink.name).all()


@router.get("/drinks/{drink_id}", response_model=DrinkOut)
def get_drink(drink_id: int, db: Session = Depends(get_db)):
    drink = (
        db.query(Drink)
        .options(
            joinedload(Drink.category),
            joinedload(Drink.drink_modifiers).joinedload(DrinkModifier.modifier),
        )
        .filter(Drink.id == drink_id)
        .first()
    )
    if not drink:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drink not found",
        )

    # Flatten modifiers for response
    drink_out = DrinkOut(
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
    return drink_out


@router.get("/modifiers", response_model=List[ModifierOut])
def list_modifiers(
    modifier_type: Optional[str] = Query(None, alias="type"),
    db: Session = Depends(get_db),
):
    query = db.query(Modifier)
    if modifier_type:
        query = query.filter(Modifier.type == modifier_type)
    return query.order_by(Modifier.type, Modifier.name).all()