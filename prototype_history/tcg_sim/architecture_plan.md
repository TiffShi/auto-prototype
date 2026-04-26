---

# Architecture Plan: Online Trading Card Game (Local 2-Player)

## Overview
A browser-based trading card game where two players can play on the same local network. The game features real-time gameplay via WebSockets, card collections, deck building, and a match system.

---

## Functional Requirements

### Core Features
1. **Player Management** – Two players can register/login with usernames
2. **Card Collection** – A predefined set of cards stored in the database with artwork images
3. **Deck Builder** – Players can build decks from their card collection (min 20 cards per deck)
4. **Match Lobby** – Player 1 creates a game room; Player 2 joins via room code
5. **Game Engine** – Turn-based game loop with:
   - Draw phase
   - Play cards to the field
   - Attack phase
   - End turn
   - Win condition (reduce opponent HP to 0)
6. **Real-Time Sync** – WebSocket connection keeps both players in sync
7. **Card Artwork** – Card images stored in MinIO object storage

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite (port **5173**) |
| Backend API | FastAPI (port **8080**) |
| WebSockets | FastAPI WebSocket endpoints |
| Database | PostgreSQL |
| Object Storage | MinIO (ports **9000 / 9001**) |
| Containerization | Docker Compose |

---

## Game Rules (MVP)
- Each player starts with **20 HP**
- Each player draws **5 cards** at game start
- Draw **1 card** per turn
- Each card has: `name`, `attack`, `defense`, `cost`, `type (creature/spell)`, `image`
- Players have **3 mana** per turn (resets each turn)
- Creatures can attack opponent's creatures or directly
- Spells have one-time effects (damage, heal, draw)

---

## Docker Compose Services

```yaml
# docker-compose.yml
services:
  backend:       # FastAPI — host port 8080
  frontend:      # React/Vite — host port 5173
  database:      # PostgreSQL
  minio:         # MinIO — host ports 9000 (API) / 9001 (Console)
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
│   ├── main.py                        # FastAPI app entry point (port 8080)
│   ├── core/
│   │   ├── config.py                  # Env vars, DB URL, MinIO config
│   │   ├── database.py                # SQLAlchemy engine & session
│   │   └── security.py                # Password hashing, JWT tokens
│   ├── models/
│   │   ├── user.py                    # User ORM model
│   │   ├── card.py                    # Card ORM model
│   │   ├── deck.py                    # Deck & DeckCard ORM models
│   │   └── game.py                    # GameRoom, GameState ORM models
│   ├── schemas/
│   │   ├── user.py                    # Pydantic schemas for User
│   │   ├── card.py                    # Pydantic schemas for Card
│   │   ├── deck.py                    # Pydantic schemas for Deck
│   │   └── game.py                    # Pydantic schemas for GameState
│   ├── routers/
│   │   ├── auth.py                    # POST /auth/register, /auth/login
│   │   ├── cards.py                   # GET /cards, GET /cards/{id}
│   │   ├── decks.py                   # CRUD /decks
│   │   └── games.py                   # POST /games/create, POST /games/join
│   ├── websockets/
│   │   └── game_ws.py                 # WS /ws/game/{room_code} — real-time game loop
│   ├── game_engine/
│   │   ├── state.py                   # In-memory GameState manager (dict of rooms)
│   │   ├── actions.py                 # play_card(), attack(), end_turn(), draw_card()
│   │   └── rules.py                   # Win condition checks, mana validation
│   ├── services/
│   │   ├── minio_service.py           # Upload/fetch card images from MinIO
│   │   └── card_seeder.py             # Seed DB with default cards + upload images
│   └── alembic/                       # DB migrations
│       ├── env.py
│       └── versions/
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js                 # Dev server port 5173, proxy /api → :8080
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                    # Router setup
│       ├── api/
│       │   ├── authApi.js             # Login/register calls
│       │   ├── cardApi.js             # Fetch cards
│       │   ├── deckApi.js             # Deck CRUD
│       │   └── gameApi.js             # Create/join room
│       ├── hooks/
│       │   ├── useAuth.js             # Auth context/hook
│       │   └── useGameSocket.js       # WebSocket hook for game state
│       ├── store/
│       │   └── gameStore.js           # Zustand store for live game state
│       ├── pages/
│       │   ├── LoginPage.jsx          # Register / Login
│       │   ├── LobbyPage.jsx          # Create room / Join room by code
│       │   ├── DeckBuilderPage.jsx    # Browse cards, build/save decks
│       │   ├── GamePage.jsx           # Main game board
│       │   └── CollectionPage.jsx     # View all owned cards
│       └── components/
│           ├── Card.jsx               # Single card component (image, stats)
│           ├── Hand.jsx               # Player's hand of cards
│           ├── Battlefield.jsx        # Active creatures on field
│           ├── PlayerStats.jsx        # HP, mana display
│           ├── GameLog.jsx            # Action history log
│           ├── DeckList.jsx           # Deck management list
│           └── RoomCodeModal.jsx      # Display/enter room code
│
├── database/
│   └── Dockerfile                     # PostgreSQL with init scripts
│
└── assets/
    └── cards/                         # Default card artwork (seeded to MinIO)
        ├── fireball.png
        ├── shield_guardian.png
        └── ...
```

---

## API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create new player account |
| POST | `/auth/login` | Login, returns JWT |

### Cards
| Method | Path | Description |
|---|---|---|
| GET | `/cards` | List all cards |
| GET | `/cards/{id}` | Get single card + image URL |

### Decks
| Method | Path | Description |
|---|---|---|
| GET | `/decks` | Get current user's decks |
| POST | `/decks` | Create new deck |
| PUT | `/decks/{id}` | Update deck cards |
| DELETE | `/decks/{id}` | Delete deck |

### Games
| Method | Path | Description |
|---|---|---|
| POST | `/games/create` | Create room, returns room code |
| POST | `/games/join` | Join room by code |
| GET | `/games/{room_code}` | Get current game state |

### WebSocket
| Path | Description |
|---|---|
| `WS /ws/game/{room_code}` | Real-time bidirectional game events |

---

## WebSocket Message Protocol

```json
// Client → Server (actions)
{ "action": "play_card",  "card_id": 12, "target_id": null }
{ "action": "attack",     "attacker_id": 5, "target_id": 3 }
{ "action": "end_turn" }

// Server → Client (state broadcast)
{
  "event": "state_update",
  "game_state": {
    "turn": "player1",
    "player1": { "hp": 18, "mana": 1, "hand_count": 4, "field": [...] },
    "player2": { "hp": 20, "mana": 3, "hand_count": 5, "field": [...] },
    "last_action": "play_card"
  }
}
{ "event": "game_over", "winner": "player1" }
```

---

## Database Schema (Key Tables)

```
users          — id, username, password_hash, created_at
cards          — id, name, attack, defense, cost, type, effect_text, image_key, rarity
decks          — id, user_id, name, created_at
deck_cards     — id, deck_id, card_id, quantity
game_rooms     — id, room_code, player1_id, player2_id, status, created_at
game_history   — id, room_id, winner_id, turns_played, ended_at
```

---

## Environment Variables

```env
# Backend
DATABASE_URL=postgresql://user:pass@database:5432/tcgdb
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=card-images
JWT_SECRET=supersecretkey

# Frontend
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080
```

---

## Port Summary

| Service | Internal Port | Host Port |
|---|---|---|
| Frontend (Vite/React) | 5173 | **5173** |
| Backend (FastAPI) | 8080 | **8080** |
| PostgreSQL | 5432 | 5432 |
| MinIO API | 9000 | **9000** |
| MinIO Console | 9001 | **9001** |