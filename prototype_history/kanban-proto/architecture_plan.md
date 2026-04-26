---

# Architecture Plan: Kanban App

## Overview
A full-featured Kanban board application where users can create boards, manage columns (swim lanes), and drag-and-drop cards/tasks between columns. Pure text/data-driven — no file uploads required.

---

## Ports Contract
- **Backend API (FastAPI):** `http://localhost:8080`
- **Frontend (React):** `http://localhost:5173`
- **Database (PostgreSQL):** Internal only (port 5432, not exposed publicly)

---

## Functional Requirements

### 1. Authentication
- User registration (email + password)
- User login / logout
- JWT-based session management
- Password hashing using **`bcrypt`** directly (standalone library — do NOT use `passlib` or any legacy wrapper)

### 2. Boards
- Create, rename, delete a board
- List all boards belonging to the authenticated user
- Each board has a title and optional description

### 3. Columns
- Create, rename, delete columns within a board
- Reorder columns (drag-and-drop position tracking via `order` integer field)
- Each column belongs to exactly one board

### 4. Cards / Tasks
- Create, edit, delete cards within a column
- Card fields: `title`, `description`, `due_date`, `priority` (low/medium/high), `order`
- Move cards between columns (update `column_id` + `order`)
- Reorder cards within the same column

### 5. UI/UX
- Drag-and-drop via **`@dnd-kit`** library
- Responsive layout
- Board switcher sidebar
- Column + card CRUD via inline editing and modals

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Drag & Drop | @dnd-kit/core, @dnd-kit/sortable |
| State Management | Zustand |
| HTTP Client | Axios |
| Backend | FastAPI (Python 3.11) |
| Auth | JWT (`python-jose`) + `bcrypt` (standalone) |
| ORM | SQLAlchemy 2.x + Alembic |
| Database | PostgreSQL 15 |
| Containerization | Docker Compose |

---

## Data Models

### User
```
id (UUID, PK)
email (string, unique)
hashed_password (string)
created_at (timestamp)
```

### Board
```
id (UUID, PK)
owner_id (FK → User)
title (string)
description (string, nullable)
created_at (timestamp)
```

### Column
```
id (UUID, PK)
board_id (FK → Board)
title (string)
order (integer)
created_at (timestamp)
```

### Card
```
id (UUID, PK)
column_id (FK → Column)
title (string)
description (string, nullable)
due_date (date, nullable)
priority (enum: low | medium | high)
order (integer)
created_at (timestamp)
updated_at (timestamp)
```

---

## API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
```

### Boards
```
GET    /api/boards
POST   /api/boards
GET    /api/boards/{board_id}
PUT    /api/boards/{board_id}
DELETE /api/boards/{board_id}
```

### Columns
```
GET    /api/boards/{board_id}/columns
POST   /api/boards/{board_id}/columns
PUT    /api/columns/{column_id}
DELETE /api/columns/{column_id}
PATCH  /api/columns/{column_id}/reorder
```

### Cards
```
GET    /api/columns/{column_id}/cards
POST   /api/columns/{column_id}/cards
GET    /api/cards/{card_id}
PUT    /api/cards/{card_id}
DELETE /api/cards/{card_id}
PATCH  /api/cards/{card_id}/move
```

---

## File Structure

```
project-root/
├── docker-compose.yml
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   └── app/
│       ├── main.py                  # FastAPI app entry, CORS, router registration
│       ├── config.py                # Settings (env vars, DB URL, JWT secret)
│       ├── database.py              # SQLAlchemy engine + session
│       ├── dependencies.py          # get_db, get_current_user
│       ├── models/
│       │   ├── __init__.py
│       │   ├── user.py
│       │   ├── board.py
│       │   ├── column.py
│       │   └── card.py
│       ├── schemas/
│       │   ├── __init__.py
│       │   ├── user.py
│       │   ├── board.py
│       │   ├── column.py
│       │   └── card.py
│       ├── routers/
│       │   ├── __init__.py
│       │   ├── auth.py
│       │   ├── boards.py
│       │   ├── columns.py
│       │   └── cards.py
│       └── services/
│           ├── __init__.py
│           ├── auth_service.py      # bcrypt hashing, JWT creation/verification
│           ├── board_service.py
│           ├── column_service.py
│           └── card_service.py
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/
│       │   ├── axios.ts             # Axios instance with base URL + interceptors
│       │   ├── auth.ts
│       │   ├── boards.ts
│       │   ├── columns.ts
│       │   └── cards.ts
│       ├── store/
│       │   ├── authStore.ts         # Zustand auth state
│       │   ├── boardStore.ts
│       │   └── kanbanStore.ts       # Columns + cards state
│       ├── types/
│       │   └── index.ts             # TypeScript interfaces (Board, Column, Card, User)
│       ├── components/
│       │   ├── auth/
│       │   │   ├── LoginForm.tsx
│       │   │   └── RegisterForm.tsx
│       │   ├── board/
│       │   │   ├── BoardSidebar.tsx
│       │   │   ├── BoardHeader.tsx
│       │   │   └── BoardList.tsx
│       │   ├── kanban/
│       │   │   ├── KanbanBoard.tsx  # DnD context root
│       │   │   ├── KanbanColumn.tsx # Droppable column
│       │   │   ├── KanbanCard.tsx   # Draggable card
│       │   │   └── AddColumnBtn.tsx
│       │   ├── card/
│       │   │   ├── CardModal.tsx    # Edit card details
│       │   │   └── CardBadge.tsx    # Priority badge
│       │   └── ui/
│       │       ├── Button.tsx
│       │       ├── Input.tsx
│       │       ├── Modal.tsx
│       │       └── Spinner.tsx
│       └── pages/
│           ├── LoginPage.tsx
│           ├── RegisterPage.tsx
│           ├── DashboardPage.tsx    # Board list
│           └── BoardPage.tsx        # Full kanban view
│
└── database/
    └── Dockerfile                   # PostgreSQL 15 with init scripts
```

---

## Docker Compose Services

```yaml
services:
  db:         # PostgreSQL 15 — internal port 5432
  backend:    # FastAPI — host port 8080 → container 8080
  frontend:   # React/Vite — host port 5173 → container 5173
```

### Key Environment Variables
```
# Backend
DATABASE_URL=postgresql://kanban:kanban@db:5432/kanbandb
JWT_SECRET=supersecretkey
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# Frontend
VITE_API_BASE_URL=http://localhost:8080
```

---

## Critical Implementation Notes

1. **Auth library:** Use `bcrypt` Python package directly for password hashing. Do NOT use `passlib`. Use `python-jose[cryptography]` for JWT.
2. **CORS:** FastAPI must allow origin `http://localhost:5173` explicitly.
3. **Drag-and-drop:** On drop, immediately optimistically update UI state, then PATCH the server with new `order` + `column_id`.
4. **Order field:** Use sparse integer ordering (0, 1000, 2000…) to allow reordering without updating all sibling records.
5. **Alembic:** Migrations must run automatically on backend container startup via an entrypoint script before `uvicorn` starts.
6. **Vite proxy:** Configure Vite dev server proxy so `/api` calls forward to `http://backend:8080` inside Docker network.