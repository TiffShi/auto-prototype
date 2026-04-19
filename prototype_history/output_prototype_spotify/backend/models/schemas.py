from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class Track(BaseModel):
    id: str
    title: str
    artist_id: str
    artist_name: str
    album_id: str
    album_title: str
    duration: int  # in seconds
    audio_url: str
    cover_url: str
    genre: str
    track_number: Optional[int] = None


class TrackSummary(BaseModel):
    id: str
    title: str
    artist_id: str
    artist_name: str
    album_id: str
    album_title: str
    duration: int
    audio_url: str
    cover_url: str
    genre: str
    track_number: Optional[int] = None


class Album(BaseModel):
    id: str
    title: str
    artist_id: str
    artist_name: str
    cover_url: str
    release_year: int
    genre: str
    tracks: List[TrackSummary] = []


class AlbumSummary(BaseModel):
    id: str
    title: str
    artist_id: str
    artist_name: str
    cover_url: str
    release_year: int
    genre: str


class Artist(BaseModel):
    id: str
    name: str
    bio: str
    image_url: str
    genres: List[str] = []
    albums: List[AlbumSummary] = []


class ArtistSummary(BaseModel):
    id: str
    name: str
    bio: str
    image_url: str
    genres: List[str] = []


class Playlist(BaseModel):
    id: str
    name: str
    description: str
    cover_url: str
    tracks: List[TrackSummary] = []
    created_at: str


class PlaylistCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    cover_url: Optional[str] = "https://picsum.photos/seed/playlist/300/300"


class PlaylistUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cover_url: Optional[str] = None


class AddTrackRequest(BaseModel):
    track_id: str


class Category(BaseModel):
    id: str
    name: str
    color: str
    image_url: str


class FeaturedContent(BaseModel):
    featured_tracks: List[TrackSummary]
    new_releases: List[AlbumSummary]
    featured_artists: List[ArtistSummary]
    categories: List[Category]


class SearchResults(BaseModel):
    tracks: List[TrackSummary]
    albums: List[AlbumSummary]
    artists: List[ArtistSummary]
    playlists: List[Playlist]