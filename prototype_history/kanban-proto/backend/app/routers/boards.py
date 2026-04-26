import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.board import BoardCreate, BoardUpdate, BoardOut
from app.services.board_service import (
    get_boards_for_user,
    get_board,
    create_board,
    update_board,
    delete_board,
)

router = APIRouter(prefix="/api/boards", tags=["boards"])


@router.get("", response_model=list[BoardOut])
def list_boards(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_boards_for_user(db, current_user.id)


@router.post("", response_model=BoardOut, status_code=status.HTTP_201_CREATED)
def create_new_board(
    payload: BoardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_board(db, payload, current_user.id)


@router.get("/{board_id}", response_model=BoardOut)
def get_single_board(
    board_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    board = get_board(db, board_id, current_user.id)
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    return board


@router.put("/{board_id}", response_model=BoardOut)
def update_existing_board(
    board_id: uuid.UUID,
    payload: BoardUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    board = get_board(db, board_id, current_user.id)
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    return update_board(db, board, payload)


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_board(
    board_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    board = get_board(db, board_id, current_user.id)
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    delete_board(db, board)