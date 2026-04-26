import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.card import Card
from app.schemas.card import CardCreate, CardUpdate, CardMove


def get_cards_for_column(db: Session, column_id: uuid.UUID) -> list[Card]:
    return (
        db.query(Card)
        .filter(Card.column_id == column_id)
        .order_by(Card.order.asc())
        .all()
    )


def get_card(db: Session, card_id: uuid.UUID) -> Card | None:
    return db.query(Card).filter(Card.id == card_id).first()


def create_card(db: Session, column_id: uuid.UUID, payload: CardCreate) -> Card:
    if payload.order is None:
        existing = (
            db.query(Card)
            .filter(Card.column_id == column_id)
            .order_by(Card.order.desc())
            .first()
        )
        order = (existing.order + 1000) if existing else 0
    else:
        order = payload.order

    card = Card(
        column_id=column_id,
        title=payload.title,
        description=payload.description,
        due_date=payload.due_date,
        priority=payload.priority,
        order=order,
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


def update_card(db: Session, card: Card, payload: CardUpdate) -> Card:
    if payload.title is not None:
        card.title = payload.title
    if payload.description is not None:
        card.description = payload.description
    if payload.due_date is not None:
        card.due_date = payload.due_date
    if payload.priority is not None:
        card.priority = payload.priority
    if payload.order is not None:
        card.order = payload.order
    card.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(card)
    return card


def move_card(db: Session, card: Card, payload: CardMove) -> Card:
    card.column_id = payload.column_id
    card.order = payload.order
    card.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(card)
    return card


def delete_card(db: Session, card: Card) -> None:
    db.delete(card)
    db.commit()