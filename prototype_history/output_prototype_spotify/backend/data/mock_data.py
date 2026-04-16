from datetime import datetime
import copy

# ─────────────────────────────────────────────
# ARTISTS
# ─────────────────────────────────────────────
ARTISTS = [
    {
        "id": "artist-1",
        "name": "The Midnight",
        "bio": "The Midnight is an American synthwave duo consisting of Tyler Lyle and Tim McEwan. Known for their nostalgic 80s-inspired sound blending electronic music with emotional lyrics.",
        "image_url": "https://picsum.photos/seed/artist1/400/400",
        "genres": ["Synthwave", "Electronic", "Retrowave"],
    },
    {
        "id": "artist-2",
        "name": "Neon Pulse",
        "bio": "Neon Pulse is an electronic music producer known for high-energy beats and futuristic soundscapes that blend EDM with cinematic orchestration.",
        "image_url": "https://picsum.photos/seed/artist2/400/400",
        "genres": ["EDM", "Electronic", "Cinematic"],
    },
    {
        "id": "artist-3",
        "name": "Luna Waves",
        "bio": "Luna Waves is an indie pop artist whose dreamy vocals and lush production have earned her a devoted following worldwide.",
        "image_url": "https://picsum.photos/seed/artist3/400/400",
        "genres": ["Indie Pop", "Dream Pop", "Alternative"],
    },
    {
        "id": "artist-4",
        "name": "Crimson Echo",
        "bio": "Crimson Echo is a rock band from Austin, Texas, blending classic rock influences with modern production techniques.",
        "image_url": "https://picsum.photos/seed/artist4/400/400",
        "genres": ["Rock", "Alternative Rock", "Indie Rock"],
    },
    {
        "id": "artist-5",
        "name": "Jazz Collective",
        "bio": "Jazz Collective is a rotating ensemble of world-class jazz musicians dedicated to pushing the boundaries of contemporary jazz.",
        "image_url": "https://picsum.photos/seed/artist5/400/400",
        "genres": ["Jazz", "Contemporary Jazz", "Fusion"],
    },
    {
        "id": "artist-6",
        "name": "Stellar Drift",
        "bio": "Stellar Drift creates ambient electronic music inspired by space exploration and cosmic phenomena.",
        "image_url": "https://picsum.photos/seed/artist6/400/400",
        "genres": ["Ambient", "Electronic", "Space Music"],
    },
]

# ─────────────────────────────────────────────
# ALBUMS
# ─────────────────────────────────────────────
ALBUMS = [
    {
        "id": "album-1",
        "title": "Endless Summer",
        "artist_id": "artist-1",
        "artist_name": "The Midnight",
        "cover_url": "https://picsum.photos/seed/album1/300/300",
        "release_year": 2022,
        "genre": "Synthwave",
    },
    {
        "id": "album-2",
        "title": "Neon City Nights",
        "artist_id": "artist-1",
        "artist_name": "The Midnight",
        "cover_url": "https://picsum.photos/seed/album2/300/300",
        "release_year": 2021,
        "genre": "Synthwave",
    },
    {
        "id": "album-3",
        "title": "Pulse Protocol",
        "artist_id": "artist-2",
        "artist_name": "Neon Pulse",
        "cover_url": "https://picsum.photos/seed/album3/300/300",
        "release_year": 2023,
        "genre": "EDM",
    },
    {
        "id": "album-4",
        "title": "Moonlit Reverie",
        "artist_id": "artist-3",
        "artist_name": "Luna Waves",
        "cover_url": "https://picsum.photos/seed/album4/300/300",
        "release_year": 2023,
        "genre": "Indie Pop",
    },
    {
        "id": "album-5",
        "title": "Voltage",
        "artist_id": "artist-4",
        "artist_name": "Crimson Echo",
        "cover_url": "https://picsum.photos/seed/album5/300/300",
        "release_year": 2022,
        "genre": "Rock",
    },
    {
        "id": "album-6",
        "title": "Late Night Sessions",
        "artist_id": "artist-5",
        "artist_name": "Jazz Collective",
        "cover_url": "https://picsum.photos/seed/album6/300/300",
        "release_year": 2021,
        "genre": "Jazz",
    },
    {
        "id": "album-7",
        "title": "Cosmos",
        "artist_id": "artist-6",
        "artist_name": "Stellar Drift",
        "cover_url": "https://picsum.photos/seed/album7/300/300",
        "release_year": 2023,
        "genre": "Ambient",
    },
    {
        "id": "album-8",
        "title": "Electric Dreams",
        "artist_id": "artist-2",
        "artist_name": "Neon Pulse",
        "cover_url": "https://picsum.photos/seed/album8/300/300",
        "release_year": 2021,
        "genre": "EDM",
    },
]

# ─────────────────────────────────────────────
# TRACKS
# Free/royalty-free audio from soundhelix.com
# ─────────────────────────────────────────────
TRACKS = [
    # Album 1 — Endless Summer (The Midnight)
    {
        "id": "track-1",
        "title": "Golden Hour",
        "artist_id": "artist-1",
        "artist_name": "The Midnight",
        "album_id": "album-1",
        "album_title": "Endless Summer",
        "duration": 245,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "cover_url": "https://picsum.photos/seed/album1/300/300",
        "genre": "Synthwave",
        "track_number": 1,
    },
    {
        "id": "track-2",
        "title": "Sunset Drive",
        "artist_id": "artist-1",
        "artist_name": "The Midnight",
        "album_id": "album-1",
        "album_title": "Endless Summer",
        "duration": 198,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "cover_url": "https://picsum.photos/seed/album1/300/300",
        "genre": "Synthwave",
        "track_number": 2,
    },
    {
        "id": "track-3",
        "title": "Ocean Breeze",
        "artist_id": "artist-1",
        "artist_name": "The Midnight",
        "album_id": "album-1",
        "album_title": "Endless Summer",
        "duration": 312,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        "cover_url": "https://picsum.photos/seed/album1/300/300",
        "genre": "Synthwave",
        "track_number": 3,
    },
    {
        "id": "track-4",
        "title": "Palm Trees",
        "artist_id": "artist-1",
        "artist_name": "The Midnight",
        "album_id": "album-1",
        "album_title": "Endless Summer",
        "duration": 267,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        "cover_url": "https://picsum.photos/seed/album1/300/300",
        "genre": "Synthwave",
        "track_number": 4,
    },
    # Album 2 — Neon City Nights (The Midnight)
    {
        "id": "track-5",
        "title": "City Lights",
        "artist_id": "artist-1",
        "artist_name": "The Midnight",
        "album_id": "album-2",
        "album_title": "Neon City Nights",
        "duration": 223,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        "cover_url": "https://picsum.photos/seed/album2/300/300",
        "genre": "Synthwave",
        "track_number": 1,
    },
    {
        "id": "track-6",
        "title": "Midnight Run",
        "artist_id": "artist-1",
        "artist_name": "The Midnight",
        "album_id": "album-2",
        "album_title": "Neon City Nights",
        "duration": 289,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        "cover_url": "https://picsum.photos/seed/album2/300/300",
        "genre": "Synthwave",
        "track_number": 2,
    },
    {
        "id": "track-7",
        "title": "Neon Rain",
        "artist_id": "artist-1",
        "artist_name": "The Midnight",
        "album_id": "album-2",
        "album_title": "Neon City Nights",
        "duration": 334,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        "cover_url": "https://picsum.photos/seed/album2/300/300",
        "genre": "Synthwave",
        "track_number": 3,
    },
    # Album 3 — Pulse Protocol (Neon Pulse)
    {
        "id": "track-8",
        "title": "Overdrive",
        "artist_id": "artist-2",
        "artist_name": "Neon Pulse",
        "album_id": "album-3",
        "album_title": "Pulse Protocol",
        "duration": 201,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        "cover_url": "https://picsum.photos/seed/album3/300/300",
        "genre": "EDM",
        "track_number": 1,
    },
    {
        "id": "track-9",
        "title": "Frequency",
        "artist_id": "artist-2",
        "artist_name": "Neon Pulse",
        "album_id": "album-3",
        "album_title": "Pulse Protocol",
        "duration": 178,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
        "cover_url": "https://picsum.photos/seed/album3/300/300",
        "genre": "EDM",
        "track_number": 2,
    },
    {
        "id": "track-10",
        "title": "Bass Drop",
        "artist_id": "artist-2",
        "artist_name": "Neon Pulse",
        "album_id": "album-3",
        "album_title": "Pulse Protocol",
        "duration": 215,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
        "cover_url": "https://picsum.photos/seed/album3/300/300",
        "genre": "EDM",
        "track_number": 3,
    },
    # Album 4 — Moonlit Reverie (Luna Waves)
    {
        "id": "track-11",
        "title": "Stargazer",
        "artist_id": "artist-3",
        "artist_name": "Luna Waves",
        "album_id": "album-4",
        "album_title": "Moonlit Reverie",
        "duration": 256,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
        "cover_url": "https://picsum.photos/seed/album4/300/300",
        "genre": "Indie Pop",
        "track_number": 1,
    },
    {
        "id": "track-12",
        "title": "Lunar Lullaby",
        "artist_id": "artist-3",
        "artist_name": "Luna Waves",
        "album_id": "album-4",
        "album_title": "Moonlit Reverie",
        "duration": 303,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
        "cover_url": "https://picsum.photos/seed/album4/300/300",
        "genre": "Indie Pop",
        "track_number": 2,
    },
    {
        "id": "track-13",
        "title": "Tidal Dream",
        "artist_id": "artist-3",
        "artist_name": "Luna Waves",
        "album_id": "album-4",
        "album_title": "Moonlit Reverie",
        "duration": 228,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
        "cover_url": "https://picsum.photos/seed/album4/300/300",
        "genre": "Indie Pop",
        "track_number": 3,
    },
    # Album 5 — Voltage (Crimson Echo)
    {
        "id": "track-14",
        "title": "Thunder Road",
        "artist_id": "artist-4",
        "artist_name": "Crimson Echo",
        "album_id": "album-5",
        "album_title": "Voltage",
        "duration": 274,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
        "cover_url": "https://picsum.photos/seed/album5/300/300",
        "genre": "Rock",
        "track_number": 1,
    },
    {
        "id": "track-15",
        "title": "Electric Storm",
        "artist_id": "artist-4",
        "artist_name": "Crimson Echo",
        "album_id": "album-5",
        "album_title": "Voltage",
        "duration": 241,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
        "cover_url": "https://picsum.photos/seed/album5/300/300",
        "genre": "Rock",
        "track_number": 2,
    },
    {
        "id": "track-16",
        "title": "Shockwave",
        "artist_id": "artist-4",
        "artist_name": "Crimson Echo",
        "album_id": "album-5",
        "album_title": "Voltage",
        "duration": 198,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
        "cover_url": "https://picsum.photos/seed/album5/300/300",
        "genre": "Rock",
        "track_number": 3,
    },
    # Album 6 — Late Night Sessions (Jazz Collective)
    {
        "id": "track-17",
        "title": "Blue Note",
        "artist_id": "artist-5",
        "artist_name": "Jazz Collective",
        "album_id": "album-6",
        "album_title": "Late Night Sessions",
        "duration": 387,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "cover_url": "https://picsum.photos/seed/album6/300/300",
        "genre": "Jazz",
        "track_number": 1,
    },
    {
        "id": "track-18",
        "title": "Smoky Room",
        "artist_id": "artist-5",
        "artist_name": "Jazz Collective",
        "album_id": "album-6",
        "album_title": "Late Night Sessions",
        "duration": 342,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "cover_url": "https://picsum.photos/seed/album6/300/300",
        "genre": "Jazz",
        "track_number": 2,
    },
    {
        "id": "track-19",
        "title": "Velvet Underground",
        "artist_id": "artist-5",
        "artist_name": "Jazz Collective",
        "album_id": "album-6",
        "album_title": "Late Night Sessions",
        "duration": 415,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        "cover_url": "https://picsum.photos/seed/album6/300/300",
        "genre": "Jazz",
        "track_number": 3,
    },
    # Album 7 — Cosmos (Stellar Drift)
    {
        "id": "track-20",
        "title": "Nebula",
        "artist_id": "artist-6",
        "artist_name": "Stellar Drift",
        "album_id": "album-7",
        "album_title": "Cosmos",
        "duration": 498,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        "cover_url": "https://picsum.photos/seed/album7/300/300",
        "genre": "Ambient",
        "track_number": 1,
    },
    {
        "id": "track-21",
        "title": "Event Horizon",
        "artist_id": "artist-6",
        "artist_name": "Stellar Drift",
        "album_id": "album-7",
        "album_title": "Cosmos",
        "duration": 523,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        "cover_url": "https://picsum.photos/seed/album7/300/300",
        "genre": "Ambient",
        "track_number": 2,
    },
    {
        "id": "track-22",
        "title": "Pulsar",
        "artist_id": "artist-6",
        "artist_name": "Stellar Drift",
        "album_id": "album-7",
        "album_title": "Cosmos",
        "duration": 445,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        "cover_url": "https://picsum.photos/seed/album7/300/300",
        "genre": "Ambient",
        "track_number": 3,
    },
    # Album 8 — Electric Dreams (Neon Pulse)
    {
        "id": "track-23",
        "title": "Digital Love",
        "artist_id": "artist-2",
        "artist_name": "Neon Pulse",
        "album_id": "album-8",
        "album_title": "Electric Dreams",
        "duration": 234,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        "cover_url": "https://picsum.photos/seed/album8/300/300",
        "genre": "EDM",
        "track_number": 1,
    },
    {
        "id": "track-24",
        "title": "Synthetic Heart",
        "artist_id": "artist-2",
        "artist_name": "Neon Pulse",
        "album_id": "album-8",
        "album_title": "Electric Dreams",
        "duration": 267,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        "cover_url": "https://picsum.photos/seed/album8/300/300",
        "genre": "EDM",
        "track_number": 2,
    },
    {
        "id": "track-25",
        "title": "Circuit Breaker",
        "artist_id": "artist-2",
        "artist_name": "Neon Pulse",
        "album_id": "album-8",
        "album_title": "Electric Dreams",
        "duration": 189,
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
        "cover_url": "https://picsum.photos/seed/album8/300/300",
        "genre": "EDM",
        "track_number": 3,
    },
]

# ─────────────────────────────────────────────
# PLAYLISTS (mutable in-memory store)
# ─────────────────────────────────────────────
PLAYLISTS = [
    {
        "id": "playlist-1",
        "name": "Chill Vibes",
        "description": "Perfect tracks for relaxing and unwinding",
        "cover_url": "https://picsum.photos/seed/playlist1/300/300",
        "tracks": ["track-1", "track-11", "track-12", "track-20", "track-21"],
        "created_at": "2024-01-15T10:30:00",
    },
    {
        "id": "playlist-2",
        "name": "Workout Bangers",
        "description": "High-energy tracks to fuel your workout",
        "cover_url": "https://picsum.photos/seed/playlist2/300/300",
        "tracks": ["track-8", "track-9", "track-10", "track-14", "track-15", "track-23"],
        "created_at": "2024-01-20T08:00:00",
    },
    {
        "id": "playlist-3",
        "name": "Late Night Drive",
        "description": "Synthwave and electronic for night drives",
        "cover_url": "https://picsum.photos/seed/playlist3/300/300",
        "tracks": ["track-5", "track-6", "track-7", "track-1", "track-2", "track-24"],
        "created_at": "2024-02-01T22:00:00",
    },
]

# ─────────────────────────────────────────────
# CATEGORIES
# ─────────────────────────────────────────────
CATEGORIES = [
    {
        "id": "cat-1",
        "name": "Synthwave",
        "color": "#7B2FBE",
        "image_url": "https://picsum.photos/seed/cat1/200/200",
    },
    {
        "id": "cat-2",
        "name": "EDM",
        "color": "#E91E63",
        "image_url": "https://picsum.photos/seed/cat2/200/200",
    },
    {
        "id": "cat-3",
        "name": "Indie Pop",
        "color": "#FF6B35",
        "image_url": "https://picsum.photos/seed/cat3/200/200",
    },
    {
        "id": "cat-4",
        "name": "Rock",
        "color": "#C62828",
        "image_url": "https://picsum.photos/seed/cat4/200/200",
    },
    {
        "id": "cat-5",
        "name": "Jazz",
        "color": "#1565C0",
        "image_url": "https://picsum.photos/seed/cat5/200/200",
    },
    {
        "id": "cat-6",
        "name": "Ambient",
        "color": "#00695C",
        "image_url": "https://picsum.photos/seed/cat6/200/200",
    },
    {
        "id": "cat-7",
        "name": "Electronic",
        "color": "#F57F17",
        "image_url": "https://picsum.photos/seed/cat7/200/200",
    },
    {
        "id": "cat-8",
        "name": "Chill",
        "color": "#2E7D32",
        "image_url": "https://picsum.photos/seed/cat8/200/200",
    },
]


# ─────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────

def get_track_by_id(track_id: str):
    return next((t for t in TRACKS if t["id"] == track_id), None)


def get_album_by_id(album_id: str):
    return next((a for a in ALBUMS if a["id"] == album_id), None)


def get_artist_by_id(artist_id: str):
    return next((a for a in ARTISTS if a["id"] == artist_id), None)


def get_playlist_by_id(playlist_id: str):
    return next((p for p in PLAYLISTS if p["id"] == playlist_id), None)


def get_tracks_for_album(album_id: str):
    return [t for t in TRACKS if t["album_id"] == album_id]


def get_albums_for_artist(artist_id: str):
    return [a for a in ALBUMS if a["artist_id"] == artist_id]


def get_tracks_for_playlist(track_ids: list):
    result = []
    for tid in track_ids:
        track = get_track_by_id(tid)
        if track:
            result.append(track)
    return result


def generate_playlist_id():
    import uuid
    return f"playlist-{uuid.uuid4().hex[:8]}"