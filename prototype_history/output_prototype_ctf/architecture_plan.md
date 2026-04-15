# CTF Leaderboard — Architecture Plan

## Stack Decision
User explicitly requested **React** (frontend) and **Express** (backend). Adhering to this exact stack.

---

## Port Contract (MANDATORY)
| Service | Port |
|---|---|
| **Backend API (Express)** | **8080** |
| **Frontend (React/Vite)** | **5173** |

All agents must use these exact ports. No deviations permitted.

---

## Functional Requirements

### Core Features
1. **Submit a Team Score** — User enters a team name + point value and submits a form.
2. **In-Memory Storage** — Backend holds all submissions in a simple JavaScript array (no database).
3. **Live Leaderboard** — Frontend polls or fetches the leaderboard and displays teams sorted highest → lowest score.
4. **Dynamic Re-ranking** — Every submission immediately re-sorts the displayed leaderboard.
5. **Duplicate Team Handling** — If a team name already exists, update their score (replace, don't duplicate).

### API Endpoints (Express — Port 8080)
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/leaderboard` | Returns all teams sorted by score descending |
| `POST` | `/api/submit` | Accepts `{ teamName: string, points: number }`, stores/updates in memory |

### Request/Response Contracts

**POST `/api/submit`**
```json
// Request Body
{ "teamName": "Team Alpha", "points": 500 }

// Response (200 OK)
{ "success": true, "message": "Score submitted for Team Alpha" }

// Response (400 Bad Request)
{ "success": false, "message": "teamName and points are required" }
```

**GET `/api/leaderboard`**
```json
// Response (200 OK)
{
  "leaderboard": [
    { "teamName": "Team Alpha", "points": 500, "rank": 1 },
    { "teamName": "Team Beta",  "points": 350, "rank": 2 }
  ]
}
```

---

## Architecture Overview

```
┌─────────────────────────────────┐       ┌──────────────────────────────────┐
│   React Frontend (Port 5173)    │       │   Express Backend (Port 8080)    │
│                                 │       │                                  │
│  ┌─────────────┐                │       │  In-Memory Store (JS Array)      │
│  │SubmitForm   │──POST /submit──┼──────▶│  [{ teamName, points }, ...]     │
│  │Component    │                │       │                                  │
│  └─────────────┘                │       │  GET /api/leaderboard            │
│                                 │       │  → sorts & returns ranked list   │
│  ┌─────────────┐                │       │                                  │
│  │Leaderboard  │◀─GET /leader───┼───────│  POST /api/submit                │
│  │Component    │   board        │       │  → upsert team score             │
│  └─────────────┘                │       │                                  │
│   (polls every 5 seconds)       │       └──────────────────────────────────┘
└─────────────────────────────────┘
```

---

## File Structure

```
project-root/
│
├── backend/
│   ├── package.json          # Express dependencies
│   ├── server.js             # Entry point: Express app, routes, in-memory store
│   └── .env                  # PORT=8080
│
├── frontend/
│   ├── package.json          # React + Vite dependencies
│   ├── vite.config.js        # Dev server port 5173, proxy /api → localhost:8080
│   ├── index.html            # Vite HTML entry
│   └── src/
│       ├── main.jsx          # React root mount
│       ├── App.jsx           # Root component, holds leaderboard state, polling logic
│       ├── components/
│       │   ├── SubmitForm.jsx      # Team name + points form, calls POST /api/submit
│       │   └── Leaderboard.jsx     # Renders sorted ranked table from state
│       └── styles/
│           └── App.css            # Clean, minimal styling for table + form
│
└── README.md
```

---

## Key Implementation Notes for Downstream Agents

### Backend (`server.js`)
- Use `express.json()` middleware for body parsing.
- Enable **CORS** (`cors` npm package) to allow requests from `http://localhost:5173`.
- In-memory store is a plain `let leaderboard = []` array at module scope.
- On `POST /api/submit`: find existing team by `teamName` (case-insensitive match), update points if found, push new entry if not.
- On `GET /api/leaderboard`: return a sorted copy (do not mutate store), inject `rank` field (1-indexed).
- Validate that `teamName` is a non-empty string and `points` is a finite number.

### Frontend (`App.jsx`)
- Use `useState` for leaderboard data and `useEffect` to set up a **polling interval every 5 seconds** calling `GET /api/leaderboard`.
- Also re-fetch immediately after a successful form submission for instant feedback.
- Pass leaderboard data as props to `<Leaderboard />`.
- `<SubmitForm />` manages its own local input state and calls a submit handler passed from `App.jsx`.

### Vite Proxy (`vite.config.js`)
- Configure proxy so `/api` requests from the frontend are forwarded to `http://localhost:8080` — avoids CORS issues in development.

### Styling Goals
- Leaderboard rendered as an HTML `<table>` with columns: **Rank | Team Name | Points**.
- Top 3 rows visually highlighted (gold/silver/bronze).
- Form is clean with basic validation feedback.