from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime

from models.schemas import Playlist, PlaylistCreate, PlaylistUpdate, AddTrackRequest
from data.mock_data import (
    PLAYLISTS,
    get_playlist_by_id,
    get_track_by_id,
    get_tracks_for_playlist,
    generate_playlist_id,
)

router = APIRouter()


def _serialize_playlist(playlist: dict) -> dict:
    """Convert internal playlist dict (with track IDs) to full Playlist response."""
    tracks = get_tracks_for_playlist(playlist["tracks"])
    return {
        "id": playlist["id"],
        "name": playlist["name"],
        "description": playlist["description"],
        "cover_url": playlist["cover_url"],
        "tracks": tracks,
        "created_at": playlist["created_at"],
    }


@router.get("/playlists", response_model=List[Playlist])
def get_all_playlists():
    """Return all playlists with their tracks."""
    return [_serialize_playlist(p) for p in PLAYLISTS]


@router.post("/playlists", response_model=Playlist, status_code=201)
def create_playlist(payload: PlaylistCreate):
    """Create a new playlist."""
    new_playlist = {
        "id": generate_playlist_id(),
        "name": payload.name,
        "description": payload.description or "",
        "cover_url": payload.cover_url or "https://picsum.photos/seed/newplaylist/300/300",
        "tracks": [],
        "created_at": datetime.utcnow().isoformat(),
    }
    PLAYLISTS.append(new_playlist)
    return _serialize_playlist(new_playlist)


@router.put("/playlists/{playlist_id}", response_model=Playlist)
def update_playlist(playlist_id: str, payload: PlaylistUpdate):
    """Update playlist metadata (name, description, cover)."""
    playlist = get_playlist_by_id(playlist_id)
    if not playlist:
        raise HTTPException(status_code=404, detail=f"Playlist '{playlist_id}' not found")

    if payload.name is not None:
        playlist["name"] = payload.name
    if payload.description is not None:
        playlist["description"] = payload.description
    if payload.cover_url is not None:
        playlist["cover_url"] = payload.cover_url

    return _serialize_playlist(playlist)


@router.delete("/playlists/{playlist_id}", status_code=204)
def delete_playlist(playlist_id: str):
    """Delete a playlist by ID."""
    playlist = get_playlist_by_id(playlist_id)
    if not playlist:
        raise HTTPException(status_code=404, detail=f"Playlist '{playlist_id}' not found")

    PLAYLISTS.remove(playlist)
    return None


@router.post("/playlists/{playlist_id}/tracks", response_model=Playlist)
def add_track_to_playlist(playlist_id: str, payload: AddTrackRequest):
    """Add a track to a playlist. Prevents duplicates."""
    playlist = get_playlist_by_id(playlist_id)
    if not playlist:
        raise HTTPException(status_code=404, detail=f"Playlist '{playlist_id}' not found")

    track = get_track_by_id(payload.track_id)
    if not track:
        raise HTTPException(status_code=404, detail=f"Track '{payload.track_id}' not found")

    if payload.track_id in playlist["tracks"]:
        raise HTTPException(
            status_code=409,
            detail=f"Track '{payload.track_id}' is already in playlist '{playlist_id}'",
        )

    playlist["tracks"].append(payload.track_id)
    return _serialize_playlist(playlist)


@router.delete("/playlists/{playlist_id}/tracks/{track_id}", response_model=Playlist)
def remove_track_from_playlist(playlist_id: str, track_id: str):
    """Remove a track from a playlist."""
    playlist = get_playlist_by_id(playlist_id)
    if not playlist:
        raise HTTPException(status_code=404, detail=f"Playlist '{playlist_id}' not found")

    if track_id not in playlist["tracks"]:
        raise HTTPException(
            status_code=404,
            detail=f"Track '{track_id}' not found in playlist '{playlist_id}'",
        )

    playlist["tracks"].remove(track_id)
    return _serialize_playlist(playlist)