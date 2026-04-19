# Paint App — Architecture Plan

## Stack
- **Frontend:** Vue 3 (Vite) — Port **5173**
- **Backend:** Express (Node.js) — Port **8080**

---

## Functional Requirements

### Core Features
1. **Canvas Drawing** — Freehand drawing using HTML5 Canvas API
2. **Brush Tools** — Pencil, brush, eraser
3. **Color Picker** — Full color palette + custom hex input
4. **Brush Size Control** — Slider to adjust stroke width
5. **Shape Tools** — Rectangle, circle, line drawing
6. **Fill Tool** — Flood-fill bucket tool
7. **Undo/Redo** — History stack (up to 20 states)
8. **Clear Canvas** — Reset to blank white canvas
9. **Save Drawing** — Export canvas as PNG (downloaded locally + optionally saved to server)
10. **Load/Gallery** — View previously saved drawings fetched from the backend

### Backend Features
1. **Save Artwork** — `POST /api/drawings` — Accepts base64 PNG, saves to disk
2. **List Artworks** — `GET /api/drawings` — Returns list of saved drawings metadata
3. **Serve Artwork** — `GET /api/drawings/:id` — Returns a specific saved image
4. **Delete Artwork** — `DELETE /api/drawings/:id` — Removes a saved drawing

---

## Precise File Structure

```
paint-app/
├── backend/
│   ├── package.json
│   ├── server.js                  # Express entry point (PORT 8080)
│   ├── routes/
│   │   └── drawings.js            # All /api/drawings routes
│   ├── controllers/
│   │   └── drawingsController.js  # Business logic for save/load/delete
│   ├── middleware/
│   │   └── errorHandler.js        # Global error handling middleware
│   └── uploads/
│       └── drawings/              # Saved PNG files stored here (gitignored)
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js             # Vite config — dev server on PORT 5173, proxy /api → 8080
│   ├── index.html
│   └── src/
│       ├── main.js                # Vue app entry point
│       ├── App.vue                # Root component, layout shell
│       ├── components/
│       │   ├── PaintCanvas.vue    # Core HTML5 Canvas drawing logic
│       │   ├── Toolbar.vue        # Tools: pencil, brush, eraser, shapes, fill
│       │   ├── ColorPicker.vue    # Color swatch grid + hex input
│       │   ├── BrushSettings.vue  # Size slider + opacity control
│       │   ├── ActionBar.vue      # Undo, Redo, Clear, Save, Load buttons
│       │   └── GalleryModal.vue   # Modal showing saved drawings from backend
│       ├── composables/
│       │   ├── useCanvas.js       # Canvas ref, context, draw event handlers
│       │   ├── useHistory.js      # Undo/redo state stack logic
│       │   ├── useTools.js        # Active tool state + tool-switching logic
│       │   └── useDrawings.js     # API calls: save, fetch, delete drawings
│       ├── stores/
│       │   └── paintStore.js      # Pinia store: color, brushSize, activeTool, history
│       ├── utils/
│       │   ├── canvasHelpers.js   # Flood fill algorithm, shape drawing helpers
│       │   └── imageUtils.js      # Base64 conversion, PNG export helpers
│       ├── assets/
│       │   └── styles/
│       │       ├── main.css       # Global resets and base styles
│       │       └── toolbar.css    # Toolbar-specific styles
│       └── api/
│           └── drawingsApi.js     # Axios instance + all API call functions
│
└── README.md
```

---

## Key Technical Decisions

| Concern | Decision |
|---|---|
| State Management | **Pinia** for global tool/color/brush state |
| HTTP Client | **Axios** with base URL pointing to `http://localhost:8080` |
| Canvas API | Native HTML5 Canvas (no third-party lib) |
| File Storage | Local disk (`/uploads/drawings/`) using `multer` |
| Undo/Redo | `ImageData` snapshots stored in a JS array (max 20) |
| Vite Proxy | `/api` proxied to `http://localhost:8080` to avoid CORS in dev |
| Image Format | PNG via `canvas.toDataURL('image/png')` |

---

## Port Contract
> ⚠️ **All agents must adhere to these exact ports:**
> - **Backend Express API:** `http://localhost:8080`
> - **Frontend Vue/Vite Dev Server:** `http://localhost:5173`
> - Vite proxy config must forward `/api/*` → `http://localhost:8080/api/*`