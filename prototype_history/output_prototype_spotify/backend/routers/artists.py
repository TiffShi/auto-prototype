from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import Artist, ArtistSummary
from data.mock_data import ARTISTS, get_artist_by_id, get_albums_for_artist

router = APIRouter()


@router.get("/artists", response_model=List[ArtistSummary])
def get_all_artists():
    """Return all artists (summary, no albums)."""
    return ARTISTS


@router.get("/artists/{artist_id}", response_model=Artist)
def get_artist(artist_id: str):
    """Return a single artist with their albums."""
    artist = get_artist_by_id(artist_id)
    if not artist:
        raise HTTPException(status_code=404, detail=f"Artist '{artist_id}' not found")

    albums = get_albums_for_artist(artist_id)
    return {**artist, "albums": albums}