---

# Architecture Plan: Ride-Sharing Simulator Dashboard

## Overview
A real-time ride-sharing simulator with a React frontend featuring a Leaflet map, a FastAPI backend managing trip state machines, and PostgreSQL for persistence. Live status updates will be delivered via **WebSockets** (no polling). The car's position on the map will animate smoothly between coordinates during each trip phase.

---

## Port Contract
| Service | Internal Port | Host Port |
|---|---|---|
| Frontend (React/Vite) | 5173 | **5173** |
| Backend (FastAPI/Uvicorn) | 8080 | **8080** |
| Database (PostgreSQL) | 5432 | 5432 |

---

## Functional Requirements

### FR-1: Trip Creation
- User inputs a **pickup coordinate** (lat/lng) and a **drop-off coordinate** (lat/lng) via a form panel.
- Submitting the form calls `POST /api/trips` and creates a new Trip record in the DB.
- The new trip immediately enters the `SEARCHING` state.

### FR-2: Trip State Machine
Each trip progresses through exactly four states in order, simulated by a background task on the backend:

```
SEARCHING_FOR_DRIVER → DRIVER_EN_ROUTE → TRIP_IN_PROGRESS → COMPLETED
```

- `SEARCHING_FOR_DRIVER`: Lasts ~3 seconds (simulates matching).
- `DRIVER_EN_ROUTE`: Lasts ~5 seconds; car animates from a random "driver origin" to the pickup point.
- `TRIP_IN_PROGRESS`: Lasts ~7 seconds; car animates from pickup to drop-off.
- `COMPLETED`: Terminal state; car stops at drop-off.

### FR-3: Live Map View
- A full-panel **Leaflet** map renders the car's current position as a custom marker.
- The car's position is interpolated/updated in real-time as WebSocket messages arrive.
- Pickup and drop-off points are shown as distinct markers (e.g., green pin = pickup, red pin = drop-off).
- A polyline draws the route between pickup and drop-off.

### FR-4: Live Status Tracker
- A sidebar/overlay component displays the current trip's status as a **step-progress indicator** (4 steps).
- The active step highlights in real-time as WebSocket events push state changes.
- Displays trip metadata: Trip ID, creation time, pickup/drop-off coords.

### FR-5: WebSocket Live Updates
- Frontend connects to `ws://localhost:8080/ws/trips/{trip_id}` upon trip creation.
- Backend pushes two event types:
  - `STATUS_UPDATE`: `{ event: "STATUS_UPDATE", status: "DRIVER_EN_ROUTE", trip_id: "..." }`
  - `POSITION_UPDATE`: `{ event: "POSITION_UPDATE", lat: 51.505, lng: -0.09, trip_id: "..." }`
- Position updates are emitted every ~500ms during moving phases.

### FR-6: Trip History Panel
- A collapsible list of all past trips fetched from `GET /api/trips`.
- Clicking a completed trip re-renders its pickup/drop-off markers on the map.

---

## API Contract

### REST Endpoints
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/trips` | Create a new trip, starts simulation |
| `GET` | `/api/trips` | List all trips |
| `GET` | `/api/trips/{trip_id}` | Get single trip details |

### `POST /api/trips` Request Body
```json
{
  "pickup_lat": 51.505,
  "pickup_lng": -0.09,
  "dropoff_lat": 51.515,
  "dropoff_lng": -0.10
}
```

### `POST /api/trips` Response
```json
{
  "trip_id": "uuid-string",
  "status": "SEARCHING_FOR_DRIVER",
  "pickup_lat": 51.505,
  "pickup_lng": -0.09,
  "dropoff_lat": 51.515,
  "dropoff_lng": -0.10,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### WebSocket Message Schema
```json
// Status Update
{ "event": "STATUS_UPDATE", "trip_id": "uuid", "status": "DRIVER_EN_ROUTE" }

// Position Update
{ "event": "POSITION_UPDATE", "trip_id": "uuid", "lat": 51.507, "lng": -0.091 }

// Simulation Complete
{ "event": "SIMULATION_COMPLETE", "trip_id": "uuid" }
```

---

## Database Schema

### `trips` Table
```sql
CREATE TABLE trips (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status      VARCHAR(30) NOT NULL DEFAULT 'SEARCHING_FOR_DRIVER',
  pickup_lat  DOUBLE PRECISION NOT NULL,
  pickup_lng  DOUBLE PRECISION NOT NULL,
  dropoff_lat DOUBLE PRECISION NOT NULL,
  dropoff_lng DOUBLE PRECISION NOT NULL,
  driver_origin_lat DOUBLE PRECISION,
  driver_origin_lng DOUBLE PRECISION,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
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
│   ├── app/
│   │   ├── main.py                  # FastAPI app init, CORS, router registration
│   │   ├── config.py                # Settings (DB URL, env vars via pydantic-settings)
│   │   ├── database.py              # SQLAlchemy async engine & session factory
│   │   ├── models.py                # SQLAlchemy ORM model for Trip
│   │   ├── schemas.py               # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── trips.py             # POST /api/trips, GET /api/trips, GET /api/trips/{id}
│   │   │   └── websocket.py         # WS endpoint: /ws/trips/{trip_id}
│   │   ├── services/
│   │   │   ├── trip_service.py      # DB CRUD operations for trips
│   │   │   └── simulator.py         # Async background task: state machine + position interpolation
│   │   └── connection_manager.py    # WebSocket connection registry (broadcast by trip_id)
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js               # Proxy /api and /ws to backend:8080
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                  # Root layout: MapView + Sidebar
│       ├── api/
│       │   └── tripsApi.js          # Axios calls to REST endpoints
│       ├── hooks/
│       │   ├── useTripWebSocket.js  # Custom hook: manages WS connection, dispatches events
│       │   └── useTrips.js          # Custom hook: fetches trip list, exposes createTrip()
│       ├── components/
│       │   ├── MapView/
│       │   │   ├── MapView.jsx      # react-leaflet MapContainer, handles marker/polyline rendering
│       │   │   └── CarMarker.jsx    # Animated car icon marker, receives lat/lng props
│       │   ├── TripForm/
│       │   │   └── TripForm.jsx     # Coordinate input form, calls createTrip on submit
│       │   ├── StatusTracker/
│       │   │   └── StatusTracker.jsx # 4-step progress indicator, highlights active step
│       │   └── TripHistory/
│       │       └── TripHistory.jsx  # Collapsible list of past trips
│       └── store/
│           └── tripStore.js         # Zustand store: activeTripId, carPosition, currentStatus, tripList
│
└── database/
    ├── Dockerfile
    └── init.sql                     # CREATE TABLE trips; (schema above)
```

---

## Docker Compose Service Definitions

```yaml
# docker-compose.yml (structure summary)

services:

  database:
    build: ./database
    environment:
      POSTGRES_DB: rideshare
      POSTGRES_USER: rideshare_user
      POSTGRES_PASSWORD: rideshare_pass
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U rideshare_user -d rideshare"]
      interval: 5s
      retries: 5

  backend:
    build: ./backend
    ports:
      - "8080:8080"            # HOST:CONTAINER — backend MUST run on 8080
    environment:
      DATABASE_URL: postgresql+asyncpg://rideshare_user:rideshare_pass@database:5432/rideshare
    depends_on:
      database:
        condition: service_healthy

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"            # HOST:CONTAINER — frontend MUST run on 5173
    depends_on:
      - backend

volumes:
  pg_data:
```

---

## Key Implementation Notes for Downstream Agents

1. **Simulator as `asyncio` Background Task**: When `POST /api/trips` is called, use `asyncio.create_task(simulate_trip(trip_id))` inside the route handler. The `simulator.py` service uses `asyncio.sleep()` between state transitions and emits WebSocket messages via `ConnectionManager`.

2. **Position Interpolation**: Between two coordinates (e.g., driver origin → pickup), divide the path into N steps and emit a `POSITION_UPDATE` every 500ms. Use linear interpolation: `lat = start_lat + (end_lat - start_lat) * (step / N)`.

3. **WebSocket Connection Manager**: `connection_manager.py` must maintain a `dict[str, list[WebSocket]]` keyed by `trip_id` to support multiple browser tabs. Implement `connect`, `disconnect`, and `send_to_trip` methods.

4. **CORS**: FastAPI must allow origin `http://localhost:5173` for REST. WebSocket connections do not require CORS headers but must be on the same backend port (`8080`).

5. **Leaflet in React**: Use `react-leaflet` package. The `MapView.jsx` must import Leaflet CSS. `CarMarker.jsx` should use a `divIcon` with a car emoji or SVG for the animated vehicle.

6. **Vite Proxy**: `vite.config.js` must proxy `/api` → `http://backend:8080` and `/ws` → `ws://backend:8080` to avoid CORS issues in development and to allow the frontend container to reach the backend container by service name.

7. **Zustand Store**: `tripStore.js` centralizes `carPosition: {lat, lng}`, `currentStatus: string`, `activeTripId: string`, and `tripList: Trip[]`. Both `useTripWebSocket` and `useTrips` hooks write to this store; components read from it.