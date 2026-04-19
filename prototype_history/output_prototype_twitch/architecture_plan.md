# Architecture Plan: Local Network Live Streaming App

## Overview
A Twitch-like local network streaming application where a broadcaster can stream their screen/webcam from one computer, and viewers on the same network can watch the live stream in real-time through a web browser.

---

## Tech Stack
- **Frontend:** React (Vite) — Port **5173**
- **Backend API:** FastAPI (Python) — Port **8080**
- **Streaming Protocol:** WebRTC (peer-to-peer) + HLS fallback via FFmpeg
- **Real-time Signaling:** WebSockets (via FastAPI)
- **Media Server:** Built-in Python streaming relay

---

## Core Features

### 1. Broadcaster Side
- Select video source (webcam, screen capture, or both)
- Start/Stop stream button
- Live viewer count display
- Stream title/channel name setup
- Preview of own stream

### 2. Viewer Side
- Browse available live streams on the network
- Click to join and watch a stream
- Live chat (per stream)
- Viewer count display
- Full-screen mode
- Stream quality indicator

### 3. Backend Services
- WebSocket signaling server for WebRTC negotiation
- Stream registry (track active streams)
- Chat message relay
- Viewer count tracking
- HLS segment serving (fallback)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    LOCAL NETWORK                         │
│                                                         │
│  ┌──────────────┐         ┌──────────────────────────┐  │
│  │  BROADCASTER │         │       VIEWERS            │  │
│  │  (React App) │         │     (React App)          │  │
│  │  Port 5173   │         │     Port 5173            │  │
│  └──────┬───────┘         └────────────┬─────────────┘  │
│         │                              │                 │
│         │    WebRTC + WebSocket        │                 │
│         └──────────────┬───────────────┘                │
│                        │                                 │
│              ┌─────────▼──────────┐                     │
│              │   FastAPI Backend  │                     │
│              │   Port 8080        │                     │
│              │                    │                     │
│              │  - WS Signaling    │                     │
│              │  - Stream Registry │                     │
│              │  - Chat Relay      │                     │
│              │  - HLS Segments    │                     │
│              └────────────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

---

## File Structure

```
streaming-app/
├── backend/
│   ├── main.py                        # FastAPI app entry point, port 8080
│   ├── requirements.txt               # Python dependencies
│   ├── config.py                      # App configuration, CORS, network settings
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── streams.py                 # Stream CRUD endpoints (create, list, delete)
│   │   ├── websocket.py               # WebSocket signaling + chat endpoints
│   │   └── hls.py                     # HLS segment serving endpoints (fallback)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── stream_registry.py         # In-memory active stream tracking
│   │   ├── signaling_service.py       # WebRTC offer/answer/ICE relay logic
│   │   ├── chat_service.py            # Chat message broadcasting
│   │   └── hls_service.py             # FFmpeg HLS segment generation (fallback)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── stream.py                  # Stream Pydantic models
│   │   └── chat.py                    # Chat message Pydantic models
│   └── hls_output/                    # Temp HLS segment storage
│       └── .gitkeep
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js                 # Vite config, proxy to port 8080
│   ├── index.html
│   └── src/
│       ├── main.jsx                   # React entry point
│       ├── App.jsx                    # Router setup (Broadcaster vs Viewer routes)
│       ├── config.js                  # API base URL (port 8080), WS URL config
│       ├── pages/
│       │   ├── HomePage.jsx           # Landing: choose Broadcaster or Viewer
│       │   ├── BroadcasterPage.jsx    # Full broadcaster studio UI
│       │   ├── ViewerLobbyPage.jsx    # List of active streams to join
│       │   └── WatchPage.jsx          # Individual stream watch page
│       ├── components/
│       │   ├── broadcaster/
│       │   │   ├── StreamSetup.jsx    # Title, source selection form
│       │   │   ├── MediaPreview.jsx   # Local camera/screen preview
│       │   │   ├── StreamControls.jsx # Start/Stop stream buttons
│       │   │   └── ViewerCounter.jsx  # Live viewer count for broadcaster
│       │   ├── viewer/
│       │   │   ├── StreamCard.jsx     # Stream listing card with thumbnail
│       │   │   ├── VideoPlayer.jsx    # WebRTC video player component
│       │   │   ├── StreamInfo.jsx     # Stream title, broadcaster name, viewer count
│       │   │   └── FullscreenBtn.jsx  # Fullscreen toggle button
│       │   ├── chat/
│       │   │   ├── ChatBox.jsx        # Chat container component
│       │   │   ├── ChatMessage.jsx    # Individual message bubble
│       │   │   └── ChatInput.jsx      # Message input + send button
│       │   └── shared/
│       │       ├── Navbar.jsx         # Top navigation bar
│       │       ├── LiveBadge.jsx      # Animated "LIVE" indicator badge
│       │       └── NetworkStatus.jsx  # Connection quality indicator
│       ├── hooks/
│       │   ├── useWebRTC.js           # WebRTC peer connection logic (broadcaster)
│       │   ├── useWebRTCViewer.js     # WebRTC viewer receive logic
│       │   ├── useWebSocket.js        # WebSocket connection management
│       │   ├── useChat.js             # Chat send/receive logic
│       │   └── useMediaDevices.js     # Camera/screen capture media access
│       ├── context/
│       │   ├── StreamContext.jsx      # Global stream state provider
│       │   └── ChatContext.jsx        # Global chat state provider
│       └── styles/
│           ├── index.css              # Global styles, dark Twitch-like theme
│           ├── broadcaster.css        # Broadcaster page styles
│           ├── viewer.css             # Viewer/watch page styles
│           └── chat.css               # Chat component styles
│
├── docker-compose.yml                 # Optional: containerized deployment
└── README.md                          # Setup and network usage instructions
```

---

## Key Technical Decisions

### WebRTC Signaling Flow
1. **Broadcaster** creates a stream entry via `POST /streams`
2. **Broadcaster** connects to WebSocket at `ws://[host]:8080/ws/broadcast/{stream_id}`
3. **Viewer** connects to WebSocket at `ws://[host]:8080/ws/watch/{stream_id}`
4. Backend **relays** WebRTC offer/answer/ICE candidates between peers
5. Once connected, video flows **directly** broadcaster → viewer (P2P)

### Network Discovery
- Backend binds to `0.0.0.0:8080` to be accessible on the local network
- Frontend `config.js` uses `window.location.hostname` dynamically so viewers only need to navigate to `http://[broadcaster-ip]:5173`

### Chat System
- WebSocket-based real-time chat per stream room
- Messages relayed through FastAPI backend to all connected viewers

---

## Port Contract (STRICT)
| Service | Port |
|---|---|
| React Frontend (Vite) | **5173** |
| FastAPI Backend | **8080** |
| WebSocket Signaling | **8080** (same server, `/ws/*` routes) |