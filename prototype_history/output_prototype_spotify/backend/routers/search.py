from fastapi import APIRouter, Query
from models.schemas import SearchResults
from data.mock_data import TRACKS, ALBUMS, ARTISTS, PLAYLISTS, get_tracks_for_playlist

router = APIRouter()


def _serialize_playlist(playlist: dict) -> dict:
    tracks = get_tracks_for_playlist(playlist["tracks"])
    return {
        "id": playlist["id"],
        "name": playlist["name"],
        "description": playlist["description"],
        "cover_url": playlist["cover_url"],
        "tracks": tracks,
        "created_at": playlist["created_at"],
    }


@router.get("/search", response_model=SearchResults)
def search(q: str = Query(..., min_length=1, description="Search query string")):
    """
    Search across tracks, albums, artists, and playlists.
    Case-insensitive substring match on relevant fields.
    """
    query = q.strip().lower()

    matched_tracks = [
        t for t in TRACKS
        if query in t["title"].lower()
        or query in t["artist_name"].lower()
        or query in t["album_title"].lower()
        or query in t["genre"].lower()
    ]

    matched_albums = [
        a for a in ALBUMS
        if query in a["title"].lower()
        or query in a["artist_name"].lower()
        or query in a["genre"].lower()
    ]

    matched_artists = [
        a for a in ARTISTS
        if query in a["name"].lower()
        or any(query in g.lower() for g in a["genres"])
        or query in a["bio"].lower()
    ]

    matched_playlists = [
        _serialize_playlist(p) for p in PLAYLISTS
        if query in p["name"].lower()
        or query in p["description"].lower()
    ]

    return SearchResults(
        tracks=matched_tracks,
        albums=matched_albums,
        artists=matched_artists,
        playlists=matched_playlists,
    )