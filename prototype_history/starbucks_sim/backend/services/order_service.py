from decimal import Decimal
from typing import List
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from models.order import Order, OrderItem, OrderItemModifier, OrderStatus
from models.drink import Drink
from models.modifier import Modifier
from schemas.order import OrderCreate


def create_order(db: Session, user_id: int, data: OrderCreate) -> Order:
    if not data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item",
        )

    total_price = Decimal("0.00")
    order_items_to_create = []

    for item_in in data.items:
        drink = db.query(Drink).filter(
            Drink.id == item_in.drink_id,
            Drink.is_available == True,
        ).first()
        if not drink:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Drink {item_in.drink_id} not found or unavailable",
            )

        if item_in.quantity < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity must be at least 1",
            )

        # Validate modifiers
        modifier_ids = item_in.modifier_ids or []
        modifiers = []
        if modifier_ids:
            modifiers = db.query(Modifier).filter(Modifier.id.in_(modifier_ids)).all()
            if len(modifiers) != len(set(modifier_ids)):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="One or more modifiers not found",
                )

        item_total = item_in.unit_price * item_in.quantity
        total_price += item_total

        order_items_to_create.append((item_in, modifiers))

    order = Order(
        user_id=user_id,
        status=OrderStatus.pending,
        total_price=total_price,
    )
    db.add(order)
    db.flush()

    for item_in, modifiers in order_items_to_create:
        order_item = OrderItem(
            order_id=order.id,
            drink_id=item_in.drink_id,
            quantity=item_in.quantity,
            unit_price=item_in.unit_price,
            customization_notes=item_in.customization_notes,
        )
        db.add(order_item)
        db.flush()

        for modifier in modifiers:
            oim = OrderItemModifier(
                order_item_id=order_item.id,
                modifier_id=modifier.id,
            )
            db.add(oim)

    db.commit()
    db.refresh(order)
    return order


def get_order_with_details(db: Session, order_id: int) -> Order:
    order = (
        db.query(Order)
        .options(
            joinedload(Order.items)
            .joinedload(OrderItem.modifiers)
            .joinedload(OrderItemModifier.modifier),
            joinedload(Order.items).joinedload(OrderItem.drink),
        )
        .filter(Order.id == order_id)
        .first()
    )
    return order


def get_user_orders(db: Session, user_id: int) -> List[Order]:
    return (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .all()
    )


def update_order_status(db: Session, order_id: int, new_status: OrderStatus) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    order.status = new_status
    db.commit()
    db.refresh(order)
    return order