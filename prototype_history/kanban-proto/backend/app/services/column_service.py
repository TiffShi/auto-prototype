import uuid
from sqlalchemy.orm import Session
from app.models.column import Column
from app.schemas.column import ColumnCreate, ColumnUpdate, ColumnReorder


def get_columns_for_board(db: Session, board_id: uuid.UUID) -> list[Column]:
    return (
        db.query(Column)
        .filter(Column.board_id == board_id)
        .order_by(Column.order.asc())
        .all()
    )


def get_column(db: Session, column_id: uuid.UUID) -> Column | None:
    return db.query(Column).filter(Column.id == column_id).first()


def create_column(db: Session, board_id: uuid.UUID, payload: ColumnCreate) -> Column:
    if payload.order is None:
        # Auto-assign order: max existing order + 1000
        existing = (
            db.query(Column)
            .filter(Column.board_id == board_id)
            .order_by(Column.order.desc())
            .first()
        )
        order = (existing.order + 1000) if existing else 0
    else:
        order = payload.order

    column = Column(board_id=board_id, title=payload.title, order=order)
    db.add(column)
    db.commit()
    db.refresh(column)
    return column


def update_column(db: Session, column: Column, payload: ColumnUpdate) -> Column:
    if payload.title is not None:
        column.title = payload.title
    if payload.order is not None:
        column.order = payload.order
    db.commit()
    db.refresh(column)
    return column


def reorder_column(db: Session, column: Column, payload: ColumnReorder) -> Column:
    column.order = payload.order
    db.commit()
    db.refresh(column)
    return column


def delete_column(db: Session, column: Column) -> None:
    db.delete(column)
    db.commit()