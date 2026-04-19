# Photo Sharing App — Architecture Plan

## Overview
A full-stack photo sharing application where users can upload, view, and interact with photos. Built with React (frontend) on port **5173** and FastAPI (backend) on port **8080**.

---

## Port Contract
| Service | Port |
|---|---|
| **Frontend (React/Vite)** | `5173` |
| **Backend (FastAPI)** | `8080` |

---

## Functional Requirements

### Core Features
1. **Photo Upload** — Users can upload photos with a title and description
2. **Photo Feed** — Browse all uploaded photos in a responsive grid gallery
3. **Photo Detail View** — Click a photo to see full size with metadata
4. **Delete Photo** — Remove a photo from the gallery
5. **Static File Serving** — FastAPI serves uploaded images as static files

---

## Backend Architecture (FastAPI — Port 8080)

### API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/photos` | Fetch all photos |
| `POST` | `/api/photos/upload` | Upload a new photo |
| `GET` | `/api/photos/{photo_id}` | Get single photo metadata |
| `DELETE` | `/api/photos/{photo_id}` | Delete a photo |
| `GET` | `/uploads/{filename}` | Serve static image files |

### Data Model
```python
Photo {
  id: str (UUID)
  title: str
  description: str
  filename: str
  url: str
  uploaded_at: datetime
}
```

### File Structure
```
backend/
├── main.py                  # FastAPI app entry point, CORS, static files, port 8080
├── models.py                # Pydantic models for Photo
├── database.py              # In-memory or JSON-based storage (photos_db)
├── routers/
│   └── photos.py            # All photo-related route handlers
├── utils/
│   └── file_handler.py      # File saving, validation, deletion logic
├── uploads/                 # Directory where uploaded images are stored
└── requirements.txt         # fastapi, uvicorn, python-multipart, pillow
```

### Key Backend Details
- **CORS** configured to allow `http://localhost:5173`
- **Static files** mounted at `/uploads` pointing to `./uploads` directory
- **File validation**: Accept only `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- **Storage**: JSON flat-file (`photos_db.json`) for persistence across restarts
- **Uvicorn** runs on `host=0.0.0.0`, `port=8080`

---

## Frontend Architecture (React/Vite — Port 5173)

### Pages & Components
```
src/
├── main.jsx                        # React entry point
├── App.jsx                         # Router setup (React Router)
├── api/
│   └── photosApi.js                # Axios calls to http://localhost:8080/api
├── pages/
│   ├── HomePage.jsx                # Photo feed/gallery grid
│   └── PhotoDetailPage.jsx         # Single photo full view
├── components/
│   ├── Navbar.jsx                  # Top navigation bar
│   ├── PhotoGrid.jsx               # Responsive photo grid layout
│   ├── PhotoCard.jsx               # Individual photo thumbnail card
│   ├── UploadModal.jsx             # Modal form for uploading photos
│   └── DeleteButton.jsx            # Confirm & delete a photo
├── hooks/
│   └── usePhotos.js                # Custom hook for fetch/upload/delete logic
├── assets/
│   └── placeholder.png             # Fallback image
└── index.css                       # Global styles
```

### Key Frontend Details
- **React Router v6** for navigation between feed and detail views
- **Axios** base URL set to `http://localhost:8080`
- **Upload flow**: `FormData` POST with file + title + description fields
- **Image display**: `<img src="http://localhost:8080/uploads/{filename}" />`
- **State management**: Local component state + custom `usePhotos` hook
- **Responsive grid**: CSS Grid with `auto-fill` columns for all screen sizes

---

## Data Flow

```
User selects file → UploadModal (FormData)
        ↓
POST /api/photos/upload (port 8080)
        ↓
file_handler saves to /uploads/
        ↓
Photo record saved to photos_db.json
        ↓
Response returns Photo object with URL
        ↓
React re-fetches GET /api/photos
        ↓
PhotoGrid renders updated gallery
```

---

## Dependencies

### Backend (`requirements.txt`)
```
fastapi
uvicorn
python-multipart
pillow
aiofiles
```

### Frontend (`package.json`)
```
react
react-dom
react-router-dom
axios
vite
```

---

## Development Startup
```bash
# Backend
cd backend && uvicorn main:app --reload --port 8080

# Frontend
cd frontend && npm run dev  # Vite defaults to port 5173
```