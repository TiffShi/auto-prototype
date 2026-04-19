from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from database import get_db
from models import ModConflict
from schemas import (
    ConflictCreate,
    ConflictListResponse,
    ConflictResponse,
    ConflictResolveToggle,
    ConflictUpdate,
    StatsResponse,
)

router = APIRouter()


# ── GET /api/conflicts/stats ───────────────────────────────────────────────────
# NOTE: This route MUST be declared before /{id} routes to avoid path conflicts.
@router.get("/stats", response_model=StatsResponse, summary="Get summary statistics")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(ModConflict.id)).scalar()
    resolved = (
        db.query(func.count(ModConflict.id))
        .filter(ModConflict.is_resolved == True)  # noqa: E712
        .scalar()
    )
    unresolved = total - resolved
    return StatsResponse(total=total, resolved=resolved, unresolved=unresolved)


# ── GET /api/conflicts ─────────────────────────────────────────────────────────
@router.get("", response_model=ConflictListResponse, summary="List all conflicts")
def list_conflicts(
    resolved: Optional[bool] = Query(default=None, description="Filter by resolution status"),
    search: Optional[str] = Query(default=None, description="Search by mod name"),
    db: Session = Depends(get_db),
):
    query = db.query(ModConflict)

    if resolved is not None:
        query = query.filter(ModConflict.is_resolved == resolved)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                ModConflict.primary_mod.ilike(search_term),
                ModConflict.conflicting_mod.ilike(search_term),
            )
        )

    query = query.order_by(ModConflict.created_at.desc())
    conflicts = query.all()

    return ConflictListResponse(
        conflicts=conflicts,
        total=len(conflicts),
    )


# ── POST /api/conflicts ────────────────────────────────────────────────────────
@router.post(
    "",
    response_model=ConflictResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new conflict",
)
def create_conflict(payload: ConflictCreate, db: Session = Depends(get_db)):
    conflict = ModConflict(
        primary_mod=payload.primary_mod.strip(),
        conflicting_mod=payload.conflicting_mod.strip(),
        crash_log_snippet=payload.crash_log_snippet,
        is_resolved=payload.is_resolved,
    )
    db.add(conflict)
    db.commit()
    db.refresh(conflict)
    return conflict


# ── PUT /api/conflicts/{id} ────────────────────────────────────────────────────
@router.put("/{conflict_id}", response_model=ConflictResponse, summary="Full update of a conflict")
def update_conflict(
    conflict_id: UUID,
    payload: ConflictUpdate,
    db: Session = Depends(get_db),
):
    conflict = db.query(ModConflict).filter(ModConflict.id == conflict_id).first()
    if not conflict:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conflict with id '{conflict_id}' not found.",
        )

    conflict.primary_mod = payload.primary_mod.strip()
    conflict.conflicting_mod = payload.conflicting_mod.strip()
    conflict.crash_log_snippet = payload.crash_log_snippet
    conflict.is_resolved = payload.is_resolved

    db.commit()
    db.refresh(conflict)
    return conflict


# ── PATCH /api/conflicts/{id}/resolve ─────────────────────────────────────────
@router.patch(
    "/{conflict_id}/resolve",
    response_model=ConflictResponse,
    summary="Toggle resolved status",
)
def toggle_resolve(
    conflict_id: UUID,
    payload: ConflictResolveToggle,
    db: Session = Depends(get_db),
):
    conflict = db.query(ModConflict).filter(ModConflict.id == conflict_id).first()
    if not conflict:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conflict with id '{conflict_id}' not found.",
        )

    conflict.is_resolved = payload.is_resolved

    db.commit()
    db.refresh(conflict)
    return conflict


# ── DELETE /api/conflicts/{id} ─────────────────────────────────────────────────
@router.delete(
    "/{conflict_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a conflict",
)
def delete_conflict(conflict_id: UUID, db: Session = Depends(get_db)):
    conflict = db.query(ModConflict).filter(ModConflict.id == conflict_id).first()
    if not conflict:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conflict with id '{conflict_id}' not found.",
        )

    db.delete(conflict)
    db.commit()
    return None