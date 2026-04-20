---

# Architecture Plan: Browser Pac-Man-Like Game

## Overview
A browser-based Pac-Man-inspired game built with React (frontend canvas game engine) and FastAPI (backend for leaderboard/scores). PostgreSQL stores high scores. No file uploads needed.

---

## Functional Requirements

### Core Game Features
1. **Game Canvas** — Rendered via HTML5 Canvas inside React; 28×31 tile grid (classic Pac-Man dimensions)
2. **Player Character** — Moves in 4 directions (WASD / Arrow Keys), animated mouth open/close
3. **Maze** — Static tile map with walls, pellets, and power pellets
4. **Enemies (Ghosts)** — At least 4 ghosts with basic AI (chase, scatter, frightened states)
5. **Pellets** — Small dots (10 pts) and power pellets (50 pts) that ghosts become vulnerable
6. **Scoring** — Points for pellets, power pellets, eating frightened ghosts (200/400/800/1600)
7. **Lives System** — Player starts with 3 lives; loses one on ghost collision
8. **Win/Lose Conditions** — Win: all pellets eaten; Lose: 0 lives remaining
9. **Level Progression** — Speed and ghost aggression increase each level
10. **Game States** — Start screen, Playing, Paused, Game Over, Victory

### Leaderboard Features
11. **Submit Score** — Player enters name + score on Game Over screen; POST to backend
12. **View Leaderboard** — Top 10 scores fetched from backend; displayed on start screen
13. **Persistent Storage** — Scores saved in PostgreSQL via FastAPI

---

## Port Contract
- **Backend API**: `http://localhost:8080` (FastAPI)
- **Frontend**: `http://localhost:5173` (React + Vite)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, HTML5 Canvas, plain CSS |
| Backend | FastAPI (Python 3.11) + Uvicorn |
| Database | PostgreSQL 15 |
| ORM | SQLAlchemy + Alembic |
| Container | Docker Compose |

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
│   │   └── versions/
│   │       └── 001_create_scores.py
│   └── app/
│       ├── main.py               # FastAPI app entry, CORS, router registration
│       ├── database.py           # SQLAlchemy engine + session
│       ├── models.py             # Score ORM model
│       ├── schemas.py            # Pydantic request/response schemas
│       └── routers/
│           └── scores.py         # GET /scores, POST /scores endpoints
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx              # React entry point
│       ├── App.jsx               # Root component, game state router
│       ├── api/
│       │   └── scores.js         # Axios calls to backend :8080
│       ├── components/
│       │   ├── StartScreen.jsx   # Title + leaderboard display
│       │   ├── GameCanvas.jsx    # Canvas mount + game loop trigger
│       │   ├── HUD.jsx           # Score, lives, level overlay
│       │   ├── GameOver.jsx      # Score submit form
│       │   └── Leaderboard.jsx   # Top 10 scores table
│       ├── game/
│       │   ├── engine.js         # Main game loop (requestAnimationFrame)
│       │   ├── constants.js      # Tile size, speeds, colors, point values
│       │   ├── map.js            # Tile map definition (2D array), pellet state
│       │   ├── renderer.js       # All canvas draw calls (maze, entities, UI)
│       │   ├── player.js         # Pac-Man position, direction, animation, collision
│       │   ├── ghost.js          # Ghost class: AI state machine (chase/scatter/frightened)
│       │   ├── collision.js      # Wall collision, pellet pickup, ghost collision
│       │   └── input.js          # Keyboard event listeners, buffered direction input
│       └── styles/
│           ├── App.css
│           └── game.css
│
└── database/
    └── Dockerfile                # PostgreSQL 15 base image + init config
```

---

## API Endpoints

| Method | Path | Description | Request Body | Response |
|---|---|---|---|---|
| `GET` | `/scores` | Fetch top 10 scores | — | `[{id, name, score, level, created_at}]` |
| `POST` | `/scores` | Submit a new score | `{name: str, score: int, level: int}` | `{id, name, score, level, created_at}` |
| `GET` | `/health` | Health check | — | `{status: "ok"}` |

---

## Database Schema

### `scores` table
| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | PRIMARY KEY |
| `name` | VARCHAR(32) | NOT NULL |
| `score` | INTEGER | NOT NULL, DEFAULT 0 |
| `level` | INTEGER | NOT NULL, DEFAULT 1 |
| `created_at` | TIMESTAMP | DEFAULT now() |

---

## Docker Compose Service Map

```yaml
services:
  db:          # PostgreSQL 15 — internal port 5432
  backend:     # FastAPI/Uvicorn — host port 8080 → container 8080
  frontend:    # React/Vite — host port 5173 → container 5173
```

- `backend` depends on `db`
- `frontend` communicates with `backend` via `http://localhost:8080`
- `db` data persisted via named volume `postgres_data`
- No MinIO (no file storage needed)

---

## Game Loop Architecture (Frontend)

```
engine.js (requestAnimationFrame loop)
  │
  ├── input.js        → reads buffered player direction
  ├── player.js       → update position, animate, check wall collision
  ├── ghost.js ×4     → update AI state, move, check frightened timer
  ├── collision.js    → pellet pickup, power pellet, ghost hit detection
  ├── map.js          → update pellet grid state
  └── renderer.js     → clear canvas → draw maze → draw pellets → draw ghosts → draw player → draw HUD
```

**Game State Machine (App.jsx)**
```
START → PLAYING → PAUSED → PLAYING
                         → GAME_OVER → START
                         → VICTORY   → START (next level)
```