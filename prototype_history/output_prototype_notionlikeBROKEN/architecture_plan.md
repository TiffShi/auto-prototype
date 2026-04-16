# Architecture Plan: Notion-Like App (Vue/SpringBoot)

## Overview
A full-featured Notion-like productivity app with pages, blocks, rich text editing, nested documents, and workspace management.

---

## Port Contract
- **Backend API (SpringBoot):** `http://localhost:8080`
- **Frontend (Vue):** `http://localhost:5173`

---

## Core Functional Requirements

### 1. Workspace & Pages
- Create, rename, delete workspaces
- Create, rename, delete, and nest pages (tree structure)
- Sidebar navigation showing page hierarchy
- Page icons and cover images

### 2. Block-Based Editor
- Supported block types:
  - **Text** (paragraph)
  - **Heading** (H1, H2, H3)
  - **Bullet List** / **Numbered List**
  - **To-Do** (checkbox)
  - **Code Block**
  - **Divider**
  - **Quote**
- Drag-and-drop block reordering
- `/` command menu to insert block types
- Inline text formatting (bold, italic, underline, strikethrough, inline code)

### 3. Document Management
- Auto-save on edit (debounced)
- Page breadcrumb navigation
- Soft delete (Trash) with restore functionality
- Page search (full-text)

### 4. User Authentication
- Register / Login / Logout
- JWT-based authentication
- Protected routes on frontend

---

## Tech Stack Details

| Layer | Technology |
|---|---|
| Frontend | Vue 3 (Composition API) + Vite |
| UI Framework | Tailwind CSS |
| State Management | Pinia |
| Rich Text / Blocks | Tiptap (Vue 3 compatible) |
| HTTP Client | Axios |
| Backend | Spring Boot 3 (Java 17) |
| Database | PostgreSQL |
| ORM | Spring Data JPA / Hibernate |
| Auth | Spring Security + JWT |
| Build Tool | Maven |

---

## API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Pages
```
GET    /api/pages                    # Get all root pages
GET    /api/pages/{id}               # Get single page with blocks
POST   /api/pages                    # Create new page
PUT    /api/pages/{id}               # Update page metadata
DELETE /api/pages/{id}               # Soft delete page
GET    /api/pages/{id}/children      # Get child pages
PUT    /api/pages/{id}/move          # Move page (change parent)
GET    /api/pages/trash              # Get trashed pages
PUT    /api/pages/{id}/restore       # Restore from trash
GET    /api/pages/search?q={query}   # Full-text search
```

### Blocks
```
GET    /api/pages/{pageId}/blocks         # Get all blocks for a page
POST   /api/pages/{pageId}/blocks         # Create block
PUT    /api/blocks/{id}                   # Update block content
DELETE /api/blocks/{id}                   # Delete block
PUT    /api/pages/{pageId}/blocks/reorder # Reorder blocks
```

---

## File Structure

### Frontend (Vue)
```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── router/
│   │   └── index.js                  # Vue Router config
│   ├── stores/
│   │   ├── auth.js                   # Pinia auth store
│   │   ├── pages.js                  # Pinia pages store
│   │   └── editor.js                 # Pinia editor/blocks store
│   ├── api/
│   │   ├── axios.js                  # Axios instance + interceptors
│   │   ├── auth.js                   # Auth API calls
│   │   ├── pages.js                  # Pages API calls
│   │   └── blocks.js                 # Blocks API calls
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.vue         # Main layout wrapper
│   │   │   ├── Sidebar.vue           # Left sidebar
│   │   │   ├── SidebarPageItem.vue   # Recursive page tree item
│   │   │   └── TopBar.vue            # Top navigation bar
│   │   ├── editor/
│   │   │   ├── BlockEditor.vue       # Main Tiptap editor wrapper
│   │   │   ├── BlockMenu.vue         # Slash command menu
│   │   │   ├── DraggableBlock.vue    # Drag-and-drop block wrapper
│   │   │   └── FormattingToolbar.vue # Inline formatting toolbar
│   │   ├── page/
│   │   │   ├── PageHeader.vue        # Page title + icon + cover
│   │   │   ├── PageBreadcrumb.vue    # Breadcrumb trail
│   │   │   └── PageTreeItem.vue      # Nested page item
│   │   ├── ui/
│   │   │   ├── Modal.vue             # Reusable modal
│   │   │   ├── ContextMenu.vue       # Right-click context menu
│   │   │   ├── SearchModal.vue       # Global search modal
│   │   │   ├── EmojiPicker.vue       # Icon/emoji picker
│   │   │   └── Button.vue            # Reusable button
│   │   └── auth/
│   │       ├── LoginForm.vue
│   │       └── RegisterForm.vue
│   ├── views/
│   │   ├── LoginView.vue
│   │   ├── RegisterView.vue
│   │   ├── HomeView.vue              # Landing / redirect
│   │   ├── PageView.vue              # Main page editor view
│   │   └── TrashView.vue             # Trash bin view
│   ├── composables/
│   │   ├── useAutoSave.js            # Debounced auto-save logic
│   │   ├── usePageTree.js            # Page tree manipulation
│   │   └── useDragAndDrop.js         # DnD composable
│   └── assets/
│       ├── main.css                  # Tailwind base styles
│       └── logo.svg
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### Backend (SpringBoot)
```
backend/
├── src/
│   └── main/
│       ├── java/com/notionapp/
│       │   ├── NotionAppApplication.java        # Main entry point
│       │   ├── config/
│       │   │   ├── SecurityConfig.java          # Spring Security config
│       │   │   ├── JwtConfig.java               # JWT properties
│       │   │   └── CorsConfig.java              # CORS (allow port 5173)
│       │   ├── auth/
│       │   │   ├── AuthController.java
│       │   │   ├── AuthService.java
│       │   │   ├── JwtUtil.java                 # JWT generate/validate
│       │   │   ├── JwtAuthFilter.java           # JWT request filter
│       │   │   └── dto/
│       │   │       ├── LoginRequest.java
│       │   │       ├── RegisterRequest.java
│       │   │       └── AuthResponse.java
│       │   ├── user/
│       │   │   ├── User.java                    # User entity
│       │   │   ├── UserRepository.java
│       │   │   └── UserService.java
│       │   ├── page/
│       │   │   ├── Page.java                    # Page entity
│       │   │   ├── PageRepository.java
│       │   │   ├── PageService.java
│       │   │   ├── PageController.java
│       │   │   └── dto/
│       │   │       ├── PageRequest.java
│       │   │       ├── PageResponse.java
│       │   │       └── MovePageRequest.java
│       │   ├── block/
│       │   │   ├── Block.java                   # Block entity
│       │   │   ├── BlockType.java               # Enum (TEXT, H1, H2...)
│       │   │   ├── BlockRepository.java
│       │   │   ├── BlockService.java
│       │   │   ├── BlockController.java
│       │   │   └── dto/
│       │   │       ├── BlockRequest.java
│       │   │       ├── BlockResponse.java
│       │   │       └── ReorderRequest.java
│       │   └── exception/
│       │       ├── GlobalExceptionHandler.java
│       │       ├── ResourceNotFoundException.java
│       │       └── UnauthorizedException.java
│       └── resources/
│           ├── application.properties           # DB, JWT, server port=8080
│           └── db/
│               └── migration/                   # Flyway migrations (optional)
├── pom.xml
└── README.md
```

---

## Database Schema

### `users`
| Column | Type |
|---|---|
| id | UUID (PK) |
| email | VARCHAR UNIQUE |
| username | VARCHAR |
| password_hash | VARCHAR |
| created_at | TIMESTAMP |

### `pages`
| Column | Type |
|---|---|
| id | UUID (PK) |
| user_id | UUID (FK → users) |
| parent_id | UUID (FK → pages, nullable) |
| title | VARCHAR |
| icon | VARCHAR (emoji/url) |
| cover_url | VARCHAR |
| order_index | INTEGER |
| is_deleted | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

### `blocks`
| Column | Type |
|---|---|
| id | UUID (PK) |
| page_id | UUID (FK → pages) |
| type | VARCHAR (enum) |
| content | TEXT (JSON) |
| order_index | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Key Implementation Notes

1. **CORS:** `CorsConfig.java` must explicitly allow `http://localhost:5173`
2. **Server Port:** `application.properties` must set `server.port=8080`
3. **JWT:** Stored in `localStorage` on frontend, sent as `Authorization: Bearer <token>` header
4. **Auto-save:** Debounced 1000ms using `useAutoSave.js` composable — triggers `PUT /api/blocks/{id}` on content change
5. **Page Tree:** Recursive `SidebarPageItem.vue` component renders nested pages using `parent_id` relationships
6. **Block Ordering:** `order_index` integer field; reorder endpoint accepts array of `{id, order_index}` pairs
7. **Tiptap:** Used as the core block editor with custom extensions for slash commands and block types