# Architecture Plan: Spotify-Type Music Streaming App

## Port Contract
- **Backend API**: Port `8080`
- **Frontend**: Port `5173`

---

## Product Overview
A full-featured music streaming web application inspired by Spotify. Users can browse music, create playlists, play tracks, and manage their library with a sleek, dark-themed UI.

---

## Functional Requirements

### Core Features
1. **Music Player** — Persistent bottom player bar with play/pause, skip, previous, volume control, seek bar, and shuffle/repeat
2. **Browse & Discovery** — Home page with featured tracks, recently played, and genre categories
3. **Search** — Search tracks, albums, and artists in real-time
4. **Library Management** — Create, edit, delete playlists; add/remove tracks
5. **Track Listing** — View albums and artist pages with track lists
6. **Queue Management** — View and manage the current play queue
7. **Mock Authentication** — Simple login/signup UI (no real auth backend needed)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Routing | React Router v6 |
| Backend API | FastAPI (Python) |
| Data | In-memory mock data (JSON) |
| Audio | HTML5 Audio API |

---

## Backend Architecture (`/backend`)

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tracks` | Get all tracks |
| GET | `/api/tracks/{id}` | Get single track |
| GET | `/api/albums` | Get all albums |
| GET | `/api/albums/{id}` | Get album with tracks |
| GET | `/api/artists` | Get all artists |
| GET | `/api/artists/{id}` | Get artist with albums |
| GET | `/api/playlists` | Get all playlists |
| POST | `/api/playlists` | Create a playlist |
| PUT | `/api/playlists/{id}` | Update playlist |
| DELETE | `/api/playlists/{id}` | Delete playlist |
| POST | `/api/playlists/{id}/tracks` | Add track to playlist |
| DELETE | `/api/playlists/{id}/tracks/{track_id}` | Remove track from playlist |
| GET | `/api/search?q={query}` | Search tracks/albums/artists |
| GET | `/api/categories` | Get genre categories |
| GET | `/api/featured` | Get featured/home content |

### Data Models
- **Track**: id, title, artist_id, album_id, duration, audio_url, cover_url, genre
- **Album**: id, title, artist_id, cover_url, release_year, tracks[]
- **Artist**: id, name, bio, image_url, albums[]
- **Playlist**: id, name, description, cover_url, tracks[], created_at

---

## File Structure

```
root/
├── backend/
│   ├── main.py                  # FastAPI app, CORS, port 8080
│   ├── routers/
│   │   ├── tracks.py            # Track endpoints
│   │   ├── albums.py            # Album endpoints
│   │   ├── artists.py           # Artist endpoints
│   │   ├── playlists.py         # Playlist CRUD endpoints
│   │   ├── search.py            # Search endpoint
│   │   └── featured.py          # Home/featured content endpoint
│   ├── models/
│   │   └── schemas.py           # Pydantic models for all entities
│   ├── data/
│   │   └── mock_data.py         # In-memory mock dataset (tracks, albums, artists)
│   └── requirements.txt         # fastapi, uvicorn, pydantic
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js           # Vite config, port 5173, proxy /api -> 8080
│   ├── tailwind.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx              # Router setup, layout wrapper
│       ├── index.css            # Tailwind directives, dark theme base
│       │
│       ├── store/
│       │   ├── playerStore.js   # Zustand: current track, queue, play state
│       │   └── libraryStore.js  # Zustand: playlists, liked songs
│       │
│       ├── api/
│       │   └── client.js        # Axios instance pointing to localhost:8080
│       │
│       ├── hooks/
│       │   ├── usePlayer.js     # Audio element logic, seek, volume
│       │   └── useSearch.js     # Debounced search hook
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Sidebar.jsx          # Left nav: Home, Search, Library, Playlists
│       │   │   ├── TopBar.jsx           # Back/forward nav, user avatar
│       │   │   └── MainLayout.jsx       # Sidebar + TopBar + content area
│       │   │
│       │   ├── player/
│       │   │   ├── PlayerBar.jsx        # Bottom persistent player
│       │   │   ├── TrackInfo.jsx        # Album art, title, artist
│       │   │   ├── PlayerControls.jsx   # Play/pause, skip, shuffle, repeat
│       │   │   ├── ProgressBar.jsx      # Seek bar with time display
│       │   │   └── VolumeControl.jsx    # Volume slider + mute
│       │   │
│       │   ├── music/
│       │   │   ├── TrackRow.jsx         # Single track list item
│       │   │   ├── TrackList.jsx        # List of TrackRows
│       │   │   ├── AlbumCard.jsx        # Album grid card
│       │   │   ├── ArtistCard.jsx       # Artist grid card
│       │   │   └── PlaylistCard.jsx     # Playlist grid card
│       │   │
│       │   └── ui/
│       │       ├── SearchBar.jsx        # Search input component
│       │       ├── CategoryCard.jsx     # Genre category card
│       │       ├── SectionHeader.jsx    # "Featured", "Recently Played" headers
│       │       └── LoadingSpinner.jsx   # Loading state
│       │
│       └── pages/
│           ├── Home.jsx             # Featured content, recently played grid
│           ├── Search.jsx           # Search input + results grid
│           ├── Library.jsx          # User's playlists and liked songs
│           ├── PlaylistDetail.jsx   # Single playlist view with track list
│           ├── AlbumDetail.jsx      # Album view with track list
│           └── ArtistDetail.jsx     # Artist page with albums and top tracks
│
└── README.md
```

---

## UI/UX Design Guidelines
- **Theme**: Dark background (`#121212`), card surfaces (`#181818`), accent green (`#1DB954` — Spotify green)
- **Layout**: Fixed left sidebar (240px), fixed bottom player bar (90px), scrollable main content
- **Typography**: Clean sans-serif, white primary text, gray secondary text
- **Hover States**: Cards lift with brightness on hover, track rows highlight on hover
- **Player Bar**: Always visible, shows current track info on left, controls in center, volume on right

---

## Key Implementation Notes
1. Audio will use **free/royalty-free sample MP3 URLs** (e.g., from `https://www.soundhelix.com/`) in mock data
2. The Vite dev server proxies `/api/*` requests to `http://localhost:8080` to avoid CORS issues
3. Zustand player store holds the audio element reference and exposes `play`, `pause`, `next`, `prev` actions
4. All playlist mutations update both the Zustand store and call the backend API