from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import Album, AlbumSummary
from data.mock_data import ALBUMS, get_album_by_id, get_tracks_for_album

router = APIRouter()


@router.get("/albums", response_model=List[AlbumSummary])
def get_all_albums():
    """Return all albums (without tracks for performance)."""
    return ALBUMS


@router.get("/albums/{album_id}", response_model=Album)
def get_album(album_id: str):
    """Return a single album with its full track list."""
    album = get_album_by_id(album_id)
    if not album:
        raise HTTPException(status_code=404, detail=f"Album '{album_id}' not found")

    tracks = get_tracks_for_album(album_id)
    return {**album, "tracks": tracks}