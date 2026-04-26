import uuid
from sqlalchemy.orm import Session
from app.models.board import Board
from app.schemas.board import BoardCreate, BoardUpdate


def get_boards_for_user(db: Session, owner_id: uuid.UUID) -> list[Board]:
    return (
        db.query(Board)
        .filter(Board.owner_id == owner_id)
        .order_by(Board.created_at.asc())
        .all()
    )


def get_board(db: Session, board_id: uuid.UUID, owner_id: uuid.UUID) -> Board | None:
    return (
        db.query(Board)
        .filter(Board.id == board_id, Board.owner_id == owner_id)
        .first()
    )


def create_board(db: Session, payload: BoardCreate, owner_id: uuid.UUID) -> Board:
    board = Board(
        owner_id=owner_id,
        title=payload.title,
        description=payload.description,
    )
    db.add(board)
    db.commit()
    db.refresh(board)
    return board


def update_board(db: Session, board: Board, payload: BoardUpdate) -> Board:
    if payload.title is not None:
        board.title = payload.title
    if payload.description is not None:
        board.description = payload.description
    db.commit()
    db.refresh(board)
    return board


def delete_board(db: Session, board: Board) -> None:
    db.delete(board)
    db.commit()