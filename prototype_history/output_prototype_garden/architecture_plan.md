# Architecture Plan: Blooming Flower Garden App

## Overview
A meditative web app where users select a flower type, then watch it bloom and multiply the longer they stay on a serene white canvas page.

---

## Port Contract
- **Backend API**: `http://localhost:8080`
- **Frontend**: `http://localhost:5173`

---

## Functional Requirements

### FR1 — Flower Selection Screen
- Display a selection of flower types (e.g., Rose, Sunflower, Tulip, Cherry Blossom, Daisy)
- Each flower option shown as a visual card with a preview icon/emoji and name
- A single "Begin" or "Enter the Garden" CTA button activates after selection
- Selected flower is highlighted with a subtle border/glow

### FR2 — Blooming Canvas Screen
- Navigates to a clean, blank white page upon flower selection
- A timer begins silently in the background the moment the page loads
- Flowers bloom progressively based on time milestones:
  - **0–10s**: 1 flower blooms at center
  - **10–30s**: 2–3 more flowers appear at random positions
  - **30–60s**: A cluster of 5–8 flowers spread across the canvas
  - **60s+**: Flowers continue to multiply and fill the page organically
- Each flower uses CSS keyframe animations to "bloom" (scale + opacity from bud to full bloom)
- Flowers appear at randomized positions, avoiding heavy overlap
- Flowers are rendered as SVG or CSS art matching the chosen type

### FR3 — Flower Bloom Animation
- Each flower starts as a small bud (scale 0, opacity 0)
- Blooms over ~2 seconds with easing (scale to 1, opacity to 1)
- Slight sway/breathing animation after blooming (subtle CSS loop)
- Each flower type has a distinct color palette and petal shape

### FR4 — Backend Session Tracking (Optional Enhancement)
- POST `/api/session/start` — records session start + flower type chosen
- GET `/api/session/{id}` — returns elapsed time and bloom count
- Primarily time logic lives on the frontend; backend stores session data

### FR5 — Navigation
- A subtle "← Choose Again" link in the corner of the bloom page
- Navigating away resets the session

---

## Tech Stack
- **Frontend**: React + Vite (port `5173`)
- **Backend**: FastAPI (port `8080`)
- **Styling**: Pure CSS (keyframe animations, no external animation libraries)
- **Routing**: React Router DOM

---

## File Structure

```
root/
├── backend/
│   ├── main.py                  # FastAPI app, CORS config, routes
│   ├── models.py                # Pydantic models (SessionStart, SessionData)
│   ├── session_store.py         # In-memory session storage dict
│   └── requirements.txt         # fastapi, uvicorn
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── main.jsx             # React entry point
│   │   ├── App.jsx              # Router setup (two routes)
│   │   ├── pages/
│   │   │   ├── SelectionPage.jsx   # Flower picker UI
│   │   │   └── GardenPage.jsx      # Blooming canvas + timer logic
│   │   ├── components/
│   │   │   ├── FlowerCard.jsx      # Individual selectable flower card
│   │   │   ├── FlowerBloom.jsx     # Single animated flower SVG component
│   │   │   └── Garden.jsx          # Canvas that manages all blooms + positions
│   │   ├── data/
│   │   │   └── flowers.js          # Flower definitions (name, colors, SVG paths)
│   │   ├── hooks/
│   │   │   └── useGardenTimer.js   # Custom hook: timer + bloom count logic
│   │   └── styles/
│   │       ├── SelectionPage.css
│   │       ├── GardenPage.css
│   │       └── FlowerBloom.css     # Keyframe bloom + sway animations
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Key Implementation Notes

1. **`useGardenTimer.js`** — Uses `setInterval` every second, increments elapsed time, and computes how many flowers should exist using a growth curve formula (e.g., `Math.floor(Math.log(elapsed + 1) * 3)`)
2. **`Garden.jsx`** — Maintains an array of flower objects `{id, x, y, delay}`, adds new ones when bloom count increases, renders `<FlowerBloom>` for each
3. **`FlowerBloom.jsx`** — Accepts `flowerType`, `x`, `y`, `animationDelay` props; renders SVG petals with CSS class triggering bloom keyframe
4. **`flowers.js`** — Defines 5 flower types with unique petal counts, colors, and SVG `d` path data
5. **Backend** is lightweight — primarily for session persistence; all real-time bloom logic is client-side for smooth animation performance