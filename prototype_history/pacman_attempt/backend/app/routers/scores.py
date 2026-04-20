from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Score
from app.schemas import ScoreCreate, ScoreResponse

router = APIRouter(prefix="/scores", tags=["scores"])


@router.get(
    "",
    response_model=List[ScoreResponse],
    summary="Fetch top 10 scores",
    description="Returns the top 10 all-time high scores ordered by score descending.",
)
def get_scores(db: Session = Depends(get_db)) -> List[Score]:
    scores = (
        db.query(Score)
        .order_by(desc(Score.score), desc(Score.created_at))
        .limit(10)
        .all()
    )
    return scores


@router.post(
    "",
    response_model=ScoreResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new score",
    description="Persists a player's score entry and returns the created record.",
)
def create_score(
    payload: ScoreCreate,
    db: Session = Depends(get_db),
) -> Score:
    entry = Score(
        name=payload.name,
        score=payload.score,
        level=payload.level,
    )
    try:
        db.add(entry)
        db.commit()
        db.refresh(entry)
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist score. Please try again.",
        ) from exc
    return entry