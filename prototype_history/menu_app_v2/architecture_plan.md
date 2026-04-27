---

# Architecture Plan: Restaurant Menu Management Website

## Overview
A full-stack web application where restaurant owners can log in, create and customize their restaurant menu (categories, items, prices, images), and publish a public-facing menu page for customers to view.

---

## Functional Requirements

### Public-Facing Menu (Customer View)
- View the restaurant's published menu grouped by category
- View item name, description, price, and photo
- Mobile-responsive layout
- No login required

### Owner Dashboard (Admin View)
- Owner registration & login (JWT-based authentication)
- Create, edit, delete **menu categories** (e.g., Appetizers, Mains, Desserts)
- Create, edit, delete **menu items** within categories
  - Fields: name, description, price, image upload, availability toggle
- Drag-and-drop or manual reordering of categories and items
- Upload item images (stored in MinIO)
- Publish/unpublish the menu
- Preview menu as customers see it

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) — Port **5173** |
| Backend API | FastAPI (Python) — Port **8080** |
| Database | PostgreSQL |
| Object Storage | MinIO (Ports **9000** / **9001**) |
| Auth | JWT via `python-jose` + `passlib[bcrypt]` (standalone, no legacy wrappers) |
| Image Handling | `boto3` or `minio` Python SDK |

---

## Docker Compose Services

```yaml
# docker-compose.yml
services:
  frontend:       # React/Vite — host port 5173
  backend:        # FastAPI   — host port 8080
  database:       # PostgreSQL
  minio:          # MinIO     — host ports 9000 (API) / 9001 (Console)
```

---

## Precise File Structure

```
project-root/
├── docker-compose.yml
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py                  # FastAPI app entry point, CORS, router registration
│   │   ├── config.py                # Env vars (DB URL, MinIO creds, JWT secret)
│   │   ├── database.py              # SQLAlchemy engine, session, Base
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py              # Owner user model
│   │   │   ├── category.py          # Menu category model
│   │   │   └── item.py              # Menu item model
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py              # Pydantic schemas for auth
│   │   │   ├── category.py          # Pydantic schemas for categories
│   │   │   └── item.py              # Pydantic schemas for items
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py              # POST /auth/register, POST /auth/login
│   │   │   ├── categories.py        # CRUD /categories
│   │   │   ├── items.py             # CRUD /items, POST /items/{id}/image
│   │   │   └── menu.py              # GET /menu (public, no auth)
│   │   ├── services/
│   │   │   ├── auth_service.py      # JWT creation/validation, password hashing
│   │   │   └── storage_service.py   # MinIO upload/delete/presigned URL logic
│   │   └── dependencies.py          # get_db(), get_current_user() dependencies
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js               # Proxy /api → http://backend:8080
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                  # React Router setup
│       ├── api/
│       │   ├── axiosClient.js       # Axios instance with base URL & JWT interceptor
│       │   ├── authApi.js           # login, register calls
│       │   ├── categoryApi.js       # CRUD category calls
│       │   ├── itemApi.js           # CRUD item + image upload calls
│       │   └── menuApi.js           # Public menu fetch
│       ├── context/
│       │   └── AuthContext.jsx      # JWT storage, login/logout state
│       ├── pages/
│       │   ├── PublicMenuPage.jsx   # Customer-facing menu view
│       │   ├── LoginPage.jsx        # Owner login form
│       │   ├── RegisterPage.jsx     # Owner registration form
│       │   └── DashboardPage.jsx    # Owner menu management hub
│       ├── components/
│       │   ├── Navbar.jsx           # Top nav (dashboard vs public)
│       │   ├── CategoryCard.jsx     # Category block with items list
│       │   ├── ItemCard.jsx         # Single menu item display
│       │   ├── CategoryForm.jsx     # Add/edit category modal form
│       │   ├── ItemForm.jsx         # Add/edit item modal form w/ image upload
│       │   ├── ImageUploader.jsx    # Drag-and-drop image input component
│       │   └── ProtectedRoute.jsx   # Redirects unauthenticated users
│       └── styles/
│           └── index.css            # Global styles / Tailwind base
│
└── database/
    └── Dockerfile                   # PostgreSQL with optional init scripts
```

---

## API Endpoint Summary

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register new owner |
| POST | `/auth/login` | No | Login, returns JWT |
| GET | `/menu` | No | Get full published menu (public) |
| GET | `/categories` | Yes | List all categories |
| POST | `/categories` | Yes | Create category |
| PUT | `/categories/{id}` | Yes | Update category |
| DELETE | `/categories/{id}` | Yes | Delete category |
| GET | `/items` | Yes | List all items |
| POST | `/items` | Yes | Create item |
| PUT | `/items/{id}` | Yes | Update item |
| DELETE | `/items/{id}` | Yes | Delete item |
| POST | `/items/{id}/image` | Yes | Upload item image to MinIO |

---

## Database Schema (Key Tables)

```
users         → id, email, hashed_password, restaurant_name, created_at
categories    → id, owner_id (FK), name, description, sort_order, is_published
items         → id, category_id (FK), name, description, price, image_url, is_available, sort_order
```

---

## Critical Implementation Notes

1. **Ports are fixed**: Backend MUST bind to `0.0.0.0:8080`; Frontend Vite dev server MUST run on port `5173`.
2. **Authentication**: Use `passlib[bcrypt]` directly for password hashing and `python-jose[cryptography]` for JWT. Do NOT use legacy auth frameworks.
3. **Image Storage**: All item images are uploaded to MinIO bucket `menu-images`. The backend stores the presigned/public URL in `items.image_url`.
4. **CORS**: FastAPI must allow origin `http://localhost:5173`.
5. **MinIO Init**: On startup, `storage_service.py` must ensure the `menu-images` bucket exists and is set to public read policy.
6. **Environment Variables**: All secrets (DB password, MinIO credentials, JWT secret) must be passed via `.env` file and never hardcoded.