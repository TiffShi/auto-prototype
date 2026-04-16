from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, timezone
from typing import List, Optional
import uuid

from database import get_db, NoteModel
from models import NoteCreate, NoteUpdate, NoteResponse

router = APIRouter()


def _note_to_response(note: NoteModel) -> NoteResponse:
    """Convert a SQLAlchemy NoteModel instance to a NoteResponse Pydantic model."""
    return NoteResponse(
        id=note.id,
        title=note.title,
        content=note.content,
        created_at=note.created_at,
        updated_at=note.updated_at,
    )


@router.get(
    "",
    response_model=List[NoteResponse],
    summary="Fetch all notes",
    description="Returns all notes, optionally filtered by a search query against title and content.",
)
def get_all_notes(
    search: Optional[str] = Query(
        None,
        description="Search term to filter notes by title or content",
    ),
    db: Session = Depends(get_db),
):
    query = db.query(NoteModel)

    if search and search.strip():
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                NoteModel.title.ilike(search_term),
                NoteModel.content.ilike(search_term),
            )
        )

    notes = query.order_by(NoteModel.updated_at.desc()).all()
    return [_note_to_response(note) for note in notes]


@router.get(
    "/{note_id}",
    response_model=NoteResponse,
    summary="Fetch a single note by ID",
    description="Returns a single note matching the provided UUID.",
)
def get_note(note_id: str, db: Session = Depends(get_db)):
    note = db.query(NoteModel).filter(NoteModel.id == note_id).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with id '{note_id}' was not found.",
        )

    return _note_to_response(note)


@router.post(
    "",
    response_model=NoteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new note",
    description="Creates a new note with a title and content. Returns the created note.",
)
def create_note(payload: NoteCreate, db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)

    new_note = NoteModel(
        id=str(uuid.uuid4()),
        title=payload.title.strip(),
        content=payload.content,
        created_at=now,
        updated_at=now,
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return _note_to_response(new_note)


@router.put(
    "/{note_id}",
    response_model=NoteResponse,
    summary="Update an existing note",
    description="Updates the title and/or content of an existing note. Only provided fields are updated.",
)
def update_note(note_id: str, payload: NoteUpdate, db: Session = Depends(get_db)):
    note = db.query(NoteModel).filter(NoteModel.id == note_id).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with id '{note_id}' was not found.",
        )

    # Only update fields that were explicitly provided in the request body
    update_data = payload.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update.",
        )

    if "title" in update_data:
        note.title = update_data["title"].strip()

    if "content" in update_data:
        note.content = update_data["content"]

    note.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(note)

    return _note_to_response(note)


@router.delete(
    "/{note_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a note",
    description="Permanently deletes the note matching the provided UUID.",
)
def delete_note(note_id: str, db: Session = Depends(get_db)):
    note = db.query(NoteModel).filter(NoteModel.id == note_id).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with id '{note_id}' was not found.",
        )

    db.delete(note)
    db.commit()

    # 204 No Content — return nothing
    return None