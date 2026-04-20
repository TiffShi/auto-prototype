from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.order import Order, OrderStatus
from schemas.order import OrderCreate, OrderOut, OrderStatusUpdate, OrderSummary
from services.order_service import (
    create_order,
    get_order_with_details,
    get_user_orders,
    update_order_status,
)
from routers.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def place_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = create_order(db, current_user.id, data)
    return get_order_with_details(db, order.id)


@router.get("", response_model=List[OrderOut])
def list_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    orders = get_user_orders(db, current_user.id)
    result = []
    for order in orders:
        detailed = get_order_with_details(db, order.id)
        result.append(detailed)
    return result


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = get_order_with_details(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    from models.user import UserRole
    if order.user_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    return order


@router.patch("/{order_id}/status", response_model=OrderOut)
def update_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    order = update_order_status(db, order_id, data.status)
    return get_order_with_details(db, order.id)