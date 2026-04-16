from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import Track, TrackSummary
from data.mock_data import TRACKS, get_track_by_id

router = APIRouter()


@router.get("/tracks", response_model=List[TrackSummary])
def get_all_tracks():
    """Return all available tracks."""
    return TRACKS


@router.get("/tracks/{track_id}", response_model=Track)
def get_track(track_id: str):
    """Return a single track by ID."""
    track = get_track_by_id(track_id)
    if not track:
        raise HTTPException(status_code=404, detail=f"Track '{track_id}' not found")
    return track