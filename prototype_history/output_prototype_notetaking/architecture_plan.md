# Architecture Plan: Notes Taking App

## Stack
- **Frontend:** React (Vite) — Port **5173**
- **Backend:** FastAPI (Python) — Port **8080**

---

## Functional Requirements

### Core Features
1. **Create Notes** — Add a new note with a title and body content
2. **Read Notes** — View a list of all notes and open individual notes
3. **Update Notes** — Edit the title and/or body of an existing note
4. **Delete Notes** — Remove a note permanently
5. **Search Notes** — Filter notes by title or content in real-time

---

## API Endpoints (Backend — Port 8080)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notes` | Fetch all notes |
| GET | `/notes/{id}` | Fetch a single note by ID |
| POST | `/notes` | Create a new note |
| PUT | `/notes/{id}` | Update an existing note |
| DELETE | `/notes/{id}` | Delete a note |

### Data Model
```json
{
  "id": "uuid",
  "title": "string",
  "content": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

## File Structure

### Backend
```
backend/
├── main.py               # FastAPI app entry point, CORS config, runs on port 8080
├── models.py             # Pydantic models (NoteCreate, NoteUpdate, NoteResponse)
├── database.py           # In-memory storage (dict) or SQLite via SQLAlchemy
├── routes/
│   └── notes.py          # All /notes route handlers
└── requirements.txt      # fastapi, uvicorn, pydantic
```

### Frontend
```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── main.jsx                  # React entry point
│   ├── App.jsx                   # Root component, routing setup
│   ├── api/
│   │   └── notesApi.js           # Axios calls to backend (http://localhost:8080)
│   ├── components/
│   │   ├── NoteList.jsx          # Displays all notes as cards
│   │   ├── NoteCard.jsx          # Individual note preview card
│   │   ├── NoteEditor.jsx        # Create/Edit form (title + content textarea)
│   │   ├── NoteDetail.jsx        # Full note view
│   │   ├── SearchBar.jsx         # Real-time search input
│   │   └── ConfirmDelete.jsx     # Delete confirmation modal
│   ├── hooks/
│   │   └── useNotes.js           # Custom hook for CRUD state & API calls
│   └── styles/
│       └── App.css               # Global styles
├── package.json
└── vite.config.js                # Dev server on port 5173, proxy to 8080
```

---

## Key Technical Decisions

1. **Storage:** SQLite with SQLAlchemy for persistence (simple, no external DB needed)
2. **CORS:** FastAPI middleware configured to allow requests from `http://localhost:5173`
3. **State Management:** React `useState` + custom `useNotes` hook (no Redux needed for this scope)
4. **IDs:** UUID4 generated server-side for each note
5. **Vite Proxy:** Frontend proxies `/notes` API calls to `http://localhost:8080` to avoid CORS issues in dev