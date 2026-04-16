# Architecture Plan: Simple Text Editor App

## Overview
A clean, functional text editor web application with core editing features, file management, and a modern UI.

---

## Port Contract
- **Backend API**: `http://localhost:8080`
- **Frontend**: `http://localhost:5173`

---

## Functional Requirements

### Core Features
1. **Text Editing Area** — Large, resizable textarea/editor with monospace font support
2. **File Management** — Create new documents, save, and load existing documents
3. **Toolbar** — Buttons for common actions (New, Save, Load, Clear)
4. **Word/Character Count** — Live display of word and character statistics
5. **Document Title** — Editable document title/filename field
6. **Auto-save Indicator** — Visual feedback showing saved/unsaved state
7. **Basic Formatting Info** — Line count, cursor position display

### Backend (FastAPI — Port 8080)
- `GET /documents` — List all saved documents
- `POST /documents` — Save a new document
- `GET /documents/{id}` — Load a specific document
- `PUT /documents/{id}` — Update an existing document
- `DELETE /documents/{id}` — Delete a document

### Frontend (React — Port 5173)
- Single-page application with toolbar + editor layout
- Real-time stats (word count, char count, line count)
- Document list sidebar
- Unsaved changes detection

---

## File Structure

```
project-root/
├── backend/
│   ├── main.py                  # FastAPI app entry point, CORS, routes
│   ├── models.py                # Pydantic models (Document schema)
│   ├── storage.py               # JSON file-based storage logic
│   ├── documents.json           # Persistent storage file (auto-created)
│   └── requirements.txt         # fastapi, uvicorn, pydantic
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── main.jsx             # React entry point
│   │   ├── App.jsx              # Root component, layout
│   │   ├── api/
│   │   │   └── documents.js     # Axios API calls to backend
│   │   ├── components/
│   │   │   ├── Toolbar.jsx      # New, Save, Delete action buttons
│   │   │   ├── Editor.jsx       # Main textarea editor component
│   │   │   ├── Sidebar.jsx      # Document list panel
│   │   │   ├── StatusBar.jsx    # Word count, char count, line/col info
│   │   │   └── TitleInput.jsx   # Editable document title field
│   │   ├── hooks/
│   │   │   └── useDocument.js   # Custom hook for document state/logic
│   │   └── styles/
│   │       └── App.css          # Global styles, editor theme
│   ├── package.json
│   └── vite.config.js           # Vite config, proxy to :8080
│
└── README.md
```

---

## Key Technical Decisions

| Concern | Decision |
|---|---|
| Storage | JSON flat-file (no DB needed for simple editor) |
| State Management | React `useState` + custom hook (no Redux needed) |
| HTTP Client | Axios in frontend |
| Styling | Plain CSS with CSS variables for theming |
| Editor Component | Native `<textarea>` with enhanced styling |
| CORS | FastAPI middleware allowing `http://localhost:5173` |
| IDs | UUID4 generated on backend for each document |

---

## Data Model

```json
{
  "id": "uuid4-string",
  "title": "My Document",
  "content": "Full text content here...",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```