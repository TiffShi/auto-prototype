import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.column import ColumnCreate, ColumnUpdate, ColumnOut, ColumnReorder
from app.services.board_service import get_board
from app.services.column_service import (
    get_columns_for_board,
    get_column,
    create_column,
    update_column,
    reorder_column,
    delete_column,
)

router = APIRouter(tags=["columns"])


@router.get("/api/boards/{board_id}/columns", response_model=list[ColumnOut])
def list_columns(
    board_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    board = get_board(db, board_id, current_user.id)
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    return get_columns_for_board(db, board_id)


@router.post(
    "/api/boards/{board_id}/columns",
    response_model=ColumnOut,
    status_code=status.HTTP_201_CREATED,
)
def create_new_column(
    board_id: uuid.UUID,
    payload: ColumnCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    board = get_board(db, board_id, current_user.id)
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    return create_column(db, board_id, payload)


@router.put("/api/columns/{column_id}", response_model=ColumnOut)
def update_existing_column(
    column_id: uuid.UUID,
    payload: ColumnUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    column = get_column(db, column_id)
    if not column:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Column not found")
    # Verify ownership via board
    board = get_board(db, column.board_id, current_user.id)
    if not board:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return update_column(db, column, payload)


@router.delete("/api/columns/{column_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_column(
    column_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    column = get_column(db, column_id)
    if not column:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Column not found")
    board = get_board(db, column.board_id, current_user.id)
    if not board:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    delete_column(db, column)


@router.patch("/api/columns/{column_id}/reorder", response_model=ColumnOut)
def reorder_existing_column(
    column_id: uuid.UUID,
    payload: ColumnReorder,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    column = get_column(db, column_id)
    if not column:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Column not found")
    board = get_board(db, column.board_id, current_user.id)
    if not board:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return reorder_column(db, column, payload)