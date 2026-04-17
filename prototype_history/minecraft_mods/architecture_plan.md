---

# Architecture Plan: Minecraft Mod Conflict Tracker

## Overview
A clean, focused web application for tracking mod conflicts in large Minecraft modpacks. Users can log conflicts between mods, attach crash log snippets, and toggle resolution status.

---

## Port Contract
- **Backend API:** `http://localhost:8080`
- **Frontend:** `http://localhost:5173`

---

## Functional Requirements

### Core Features
1. **Create Conflict Entry** — Input form with:
   - Primary mod name (text)
   - Conflicting mod name (text)
   - Crash log error snippet (multiline textarea)
   - Resolved/Unresolved toggle (boolean)
2. **View All Conflicts** — Paginated/scrollable list of all logged conflicts
3. **Filter/Search** — Filter by mod name or resolution status
4. **Update Conflict** — Edit any field or toggle resolved status inline
5. **Delete Conflict** — Remove a conflict entry permanently
6. **Status Summary** — Dashboard header showing total conflicts, resolved count, and unresolved count

---

## Data Model

### `mod_conflicts` Table
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `primary_mod` | VARCHAR(255) | Required |
| `conflicting_mod` | VARCHAR(255) | Required |
| `crash_log_snippet` | TEXT | Optional |
| `is_resolved` | BOOLEAN | Default: `false` |
| `created_at` | TIMESTAMP | Auto-set on insert |
| `updated_at` | TIMESTAMP | Auto-updated on edit |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/conflicts` | List all conflicts (supports `?resolved=true/false` and `?search=modname`) |
| `POST` | `/api/conflicts` | Create a new conflict |
| `PUT` | `/api/conflicts/{id}` | Update a conflict (full update) |
| `PATCH` | `/api/conflicts/{id}/resolve` | Toggle resolved status only |
| `DELETE` | `/api/conflicts/{id}` | Delete a conflict |
| `GET` | `/api/conflicts/stats` | Return summary counts |

---

## File Structure

```
project-root/
├── docker-compose.yml
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                  # FastAPI app entry point, CORS, port 8080
│   ├── database.py              # SQLAlchemy engine + session setup
│   ├── models.py                # SQLAlchemy ORM model for mod_conflicts
│   ├── schemas.py               # Pydantic request/response schemas
│   └── routers/
│       └── conflicts.py         # All /api/conflicts route handlers
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js           # Dev server on port 5173, proxy /api → 8080
    ├── index.html
    └── src/
        ├── main.jsx             # React entry point
        ├── App.jsx              # Root component, routing
        ├── api/
        │   └── conflicts.js     # Axios/fetch wrapper for all API calls
        ├── components/
        │   ├── ConflictForm.jsx      # Add/Edit form modal
        │   ├── ConflictCard.jsx      # Single conflict display card
        │   ├── ConflictList.jsx      # Scrollable list of ConflictCards
        │   ├── FilterBar.jsx         # Search input + resolved filter toggle
        │   ├── StatsHeader.jsx       # Summary counts banner
        │   └── StatusBadge.jsx       # Resolved/Unresolved pill badge
        └── styles/
            └── index.css            # Global styles (dark Minecraft-inspired theme)
```

---

## UI/UX Notes
- **Theme:** Dark background (`#1a1a2e` or similar), green/red accent colors for resolved/unresolved status — evoking a Minecraft terminal aesthetic
- **ConflictCard** displays: mod names prominently, crash snippet in a collapsible `<code>` block, and a large toggle button for resolution status
- **StatsHeader** is always visible at the top: `Total: 47 | ✅ Resolved: 30 | ❌ Unresolved: 17`
- **FilterBar** provides real-time client-side search by mod name and a one-click filter for unresolved-only view
- **No authentication required** — single-user local tool

---

## Docker Compose Services
| Service | Image | Port |
|---|---|---|
| `db` | `postgres:15` | `5432` (internal) |
| `backend` | Custom (Python 3.11) | `8080:8080` |
| `frontend` | Custom (Node 20) | `5173:5173` |