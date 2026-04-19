# Architecture Plan: YouTube-Style Video Platform

## Overview
A full-stack video sharing platform where users can upload, store, and stream videos with a clean YouTube-inspired UI.

---

## Tech Stack
- **Frontend:** React (Vite) — Port **5173**
- **Backend:** FastAPI (Python) — Port **8080**
- **Database:** SQLite (via SQLAlchemy)
- **Video Storage:** Local filesystem (`/backend/uploads/`)
- **Video Streaming:** FastAPI range-request streaming

---

## Functional Requirements

### Core Features
1. **Upload Video** — Upload MP4/WebM files with a title, description, and thumbnail auto-generation
2. **Video Feed (Home Page)** — Grid of all uploaded videos with thumbnail, title, and metadata
3. **Video Player Page** — Full video player with title, description, view count, and upload date
4. **Video Streaming** — Efficient byte-range streaming so videos load progressively
5. **View Count Tracking** — Increment view count each time a video is watched
6. **Delete Video** — Remove a video from the platform

---

## API Endpoints (Backend — Port 8080)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/videos` | List all videos (metadata) |
| `POST` | `/api/videos/upload` | Upload a new video + metadata |
| `GET` | `/api/videos/{id}` | Get single video metadata |
| `GET` | `/api/videos/{id}/stream` | Stream video file (range requests) |
| `GET` | `/api/videos/{id}/thumbnail` | Serve thumbnail image |
| `DELETE` | `/api/videos/{id}` | Delete a video |
| `PATCH` | `/api/videos/{id}/view` | Increment view count |

---

## Database Schema

### `videos` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `title` | String | Video title |
| `description` | Text | Video description |
| `filename` | String | Stored file name |
| `thumbnail_filename` | String | Thumbnail file name |
| `file_size` | Integer | File size in bytes |
| `duration` | Float | Duration in seconds |
| `views` | Integer | View count (default 0) |
| `created_at` | DateTime | Upload timestamp |

---

## File Structure

```
project-root/
├── backend/
│   ├── main.py                  # FastAPI app entry point, CORS, router registration
│   ├── database.py              # SQLAlchemy engine, session, Base setup
│   ├── models.py                # Video SQLAlchemy ORM model
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── routers/
│   │   └── videos.py            # All /api/videos/* route handlers
│   ├── services/
│   │   └── video_service.py     # File I/O, thumbnail extraction, streaming logic
│   ├── uploads/
│   │   ├── videos/              # Stored video files
│   │   └── thumbnails/          # Auto-extracted thumbnail images
│   └── requirements.txt         # fastapi, uvicorn, sqlalchemy, python-multipart, Pillow, opencv-python
│
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── main.jsx             # React entry point
│   │   ├── App.jsx              # Router setup (React Router)
│   │   ├── api/
│   │   │   └── videoApi.js      # Axios calls to backend (base URL: http://localhost:8080)
│   │   ├── pages/
│   │   │   ├── HomePage.jsx     # Video grid feed
│   │   │   ├── VideoPage.jsx    # Video player + metadata
│   │   │   └── UploadPage.jsx   # Upload form with drag-and-drop
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Top navigation bar
│   │   │   ├── VideoCard.jsx    # Thumbnail + title card for grid
│   │   │   ├── VideoPlayer.jsx  # HTML5 <video> player component
│   │   │   ├── VideoGrid.jsx    # Responsive grid layout
│   │   │   └── UploadModal.jsx  # Upload progress + form modal
│   │   └── styles/
│   │       └── index.css        # Global styles (YouTube-dark theme)
│   ├── index.html
│   ├── vite.config.js           # Vite config — dev server on port 5173
│   └── package.json             # react, react-dom, react-router-dom, axios
│
└── README.md
```

---

## Key Implementation Notes

1. **CORS:** Backend must allow `http://localhost:5173` as an allowed origin
2. **Video Streaming:** Use HTTP `Range` headers in `/stream` endpoint so the browser `<video>` tag can seek
3. **Thumbnail Generation:** Use OpenCV (`cv2`) to extract frame at 1 second mark as JPEG thumbnail on upload
4. **File Naming:** Store files as `{uuid}.mp4` and `{uuid}.jpg` to avoid collisions
5. **Upload Progress:** Use `axios` with `onUploadProgress` callback to show a progress bar
6. **Responsive Grid:** CSS Grid with `auto-fill` / `minmax(300px, 1fr)` for YouTube-like layout
7. **Dark Theme:** YouTube-inspired dark background (`#0f0f0f`), red accents (`#ff0000`)