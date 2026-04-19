# Architecture Plan: Notion-Like App (Vue/Express)

## Stack
- **Frontend:** Vue 3 (Vite) — Port **5173**
- **Backend:** Express.js (Node.js) — Port **8080**
- **Storage:** In-memory (server-side JavaScript objects/arrays)

---

## Core Features & Functional Requirements

### 1. Pages
- Create, read, update, delete (CRUD) pages
- Each page has: `id`, `title`, `content` (rich text blocks), `createdAt`, `updatedAt`, `parentId` (for nesting)
- Pages can be nested (sub-pages)
- Sidebar lists all top-level and nested pages

### 2. Blocks (Content System)
- Each page contains an ordered list of blocks
- Block types supported:
  - `text` — plain paragraph
  - `heading1`, `heading2`, `heading3` — headings
  - `todo` — checkbox item
  - `bullet` — bulleted list item
  - `numbered` — numbered list item
  - `divider` — horizontal rule
- Blocks have: `id`, `type`, `content`, `checked` (for todos), `order`

### 3. Sidebar Navigation
- Collapsible sidebar showing page tree
- Click page to open it
- Inline rename of pages
- Add new page button
- Delete page (with confirmation)

### 4. Editor
- Click-to-edit inline blocks
- Press `Enter` to create new block below
- Press `Backspace` on empty block to delete it
- Change block type via `/` command menu (slash commands)
- Drag-and-drop block reordering

### 5. UI/UX
- Clean, minimal Notion-like aesthetic (white background, subtle borders)
- Responsive layout (sidebar + main content area)
- Auto-save on content change (debounced)
- Page title editable at top of editor

---

## API Endpoints (Express — Port 8080)

### Pages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pages` | Get all pages (tree structure) |
| GET | `/api/pages/:id` | Get single page with blocks |
| POST | `/api/pages` | Create new page |
| PUT | `/api/pages/:id` | Update page title/metadata |
| DELETE | `/api/pages/:id` | Delete page and its blocks |

### Blocks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pages/:id/blocks` | Get all blocks for a page |
| POST | `/api/pages/:id/blocks` | Add a block to a page |
| PUT | `/api/pages/:id/blocks/:blockId` | Update a block |
| DELETE | `/api/pages/:id/blocks/:blockId` | Delete a block |
| PUT | `/api/pages/:id/blocks/reorder` | Reorder blocks (send ordered id array) |

---

## In-Memory Data Models

```javascript
// Pages store
const pages = {
  "page-uuid-1": {
    id: "page-uuid-1",
    title: "Welcome Page",
    parentId: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
}

// Blocks store
const blocks = {
  "page-uuid-1": [
    {
      id: "block-uuid-1",
      type: "heading1",       // text|heading1|heading2|heading3|todo|bullet|numbered|divider
      content: "Hello World",
      checked: false,         // only for todo type
      order: 0
    }
  ]
}
```

---

## File Structure

```
root/
├── backend/
│   ├── package.json
│   ├── server.js                  # Express app entry, port 8080
│   ├── store/
│   │   └── memoryStore.js         # In-memory pages & blocks storage + helper fns
│   └── routes/
│       ├── pages.js               # /api/pages routes
│       └── blocks.js              # /api/pages/:id/blocks routes
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js             # Vite config, dev server port 5173, proxy /api → 8080
│   ├── index.html
│   └── src/
│       ├── main.js                # Vue app entry
│       ├── App.vue                # Root component (sidebar + router-view layout)
│       ├── router/
│       │   └── index.js           # Vue Router: / and /page/:id
│       ├── store/
│       │   └── usePageStore.js    # Pinia store for pages & blocks state
│       ├── api/
│       │   └── index.js           # Axios API client (baseURL: http://localhost:8080)
│       ├── components/
│       │   ├── Sidebar/
│       │   │   ├── Sidebar.vue            # Sidebar wrapper
│       │   │   ├── SidebarPageItem.vue    # Recursive page tree item
│       │   │   └── SidebarAddButton.vue   # New page button
│       │   ├── Editor/
│       │   │   ├── Editor.vue             # Main editor container
│       │   │   ├── PageTitle.vue          # Editable page title
│       │   │   ├── BlockList.vue          # Renders ordered list of blocks
│       │   │   ├── Block.vue              # Individual block renderer/editor
│       │   │   ├── BlockMenu.vue          # Slash command menu
│       │   │   └── BlockTypeIcon.vue      # Icon per block type
│       │   └── UI/
│       │       ├── ConfirmModal.vue        # Delete confirmation dialog
│       │       └── EmptyState.vue         # No page selected state
│       └── views/
│           ├── HomeView.vue       # Landing / no page selected
│           └── PageView.vue       # Page editor view (/page/:id)
│
└── README.md
```

---

## Key Implementation Notes

1. **Port Contract:** Backend Express server MUST run on **port 8080**. Vite dev server MUST run on **port 5173** with `/api` proxied to `http://localhost:8080`.
2. **UUID Generation:** Use `crypto.randomUUID()` (Node built-in) for all IDs on the backend.
3. **Auto-save:** Debounce block/title updates by 500ms using `lodash.debounce` or a custom composable before calling PUT endpoints.
4. **Slash Commands:** Typing `/` in an empty block opens `BlockMenu.vue` with block type options; selecting one converts the block type.
5. **Seed Data:** `memoryStore.js` should initialize with one default "Getting Started" page with a few sample blocks so the app isn't empty on first load.
6. **CORS:** Express must enable CORS for `http://localhost:5173`.
7. **Pinia** is the recommended state manager for Vue 3.