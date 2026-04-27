---

# Architecture Plan: Restaurant Menu Management Website

## Overview
A full-stack web application that allows restaurant owners to log in, customize their menu (add/edit/delete categories and items with images), and display a public-facing menu page for customers.

---

## Functional Requirements

### Public-Facing Menu (Customer View)
- View all menu categories and items
- See item name, description, price, and photo
- Filter/browse by category
- No login required

### Owner Dashboard (Admin View)
- Secure login/logout (JWT-based authentication)
- Manage menu categories (create, rename, reorder, delete)
- Manage menu items per category:
  - Add/edit/delete items
  - Upload item photos (stored in MinIO)
  - Set name, description, price, availability toggle
- Preview public menu

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) — Port **5173** |
| Backend API | FastAPI (Python) — Port **8080** |
| Database | PostgreSQL |
| Object Storage | MinIO (Ports **9000** / **9001**) |
| Auth | JWT via `python-jose` + `passlib[bcrypt]` (standalone, no legacy wrappers) |
| ORM | SQLAlchemy + Alembic |
| HTTP Client | Axios (frontend) |

---

## Docker Compose Services

```yaml
# docker-compose.yml
services:
  frontend:       # React/Vite — host port 5173
  backend:        # FastAPI    — host port 8080
  database:       # PostgreSQL — internal port 5432
  minio:          # MinIO      — host ports 9000 (API) / 9001 (Console)
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
│   ├── alembic.ini
│   ├── alembic/
│   │   └── versions/
│   └── app/
│       ├── main.py                  # FastAPI app entry, CORS, router registration
│       ├── config.py                # Env vars (DB URL, JWT secret, MinIO config)
│       ├── database.py              # SQLAlchemy engine & session
│       ├── models/
│       │   ├── user.py              # Owner/user model
│       │   ├── category.py          # Menu category model
│       │   └── menu_item.py         # Menu item model (name, desc, price, image_url, available)
│       ├── schemas/
│       │   ├── user.py              # Pydantic schemas for auth
│       │   ├── category.py          # Pydantic schemas for categories
│       │   └── menu_item.py         # Pydantic schemas for menu items
│       ├── routers/
│       │   ├── auth.py              # POST /auth/login, POST /auth/register
│       │   ├── categories.py        # CRUD /categories
│       │   ├── menu_items.py        # CRUD /menu-items, POST /menu-items/{id}/upload-image
│       │   └── public.py            # GET /public/menu (no auth required)
│       ├── services/
│       │   ├── auth_service.py      # JWT creation/verification using python-jose
│       │   ├── hash_service.py      # Password hashing using passlib[bcrypt] directly
│       │   └── storage_service.py   # MinIO upload/delete/presigned URL helpers
│       └── dependencies.py          # get_db(), get_current_owner() dependency injection
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
│       │   └── axiosClient.js       # Axios instance pointing to port 8080
│       ├── context/
│       │   └── AuthContext.jsx      # JWT storage, login/logout state
│       ├── pages/
│       │   ├── PublicMenu.jsx       # Customer-facing menu display
│       │   ├── Login.jsx            # Owner login page
│       │   └── Dashboard.jsx        # Owner dashboard (protected route)
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── CategoryCard.jsx     # Displays a category + its items
│       │   ├── MenuItemCard.jsx     # Single item display (public)
│       │   ├── MenuItemForm.jsx     # Add/edit item form with image upload
│       │   ├── CategoryForm.jsx     # Add/edit category form
│       │   └── ProtectedRoute.jsx   # Redirects unauthenticated users
│       └── assets/
│
└── database/
    └── Dockerfile                   # PostgreSQL with optional init.sql
```

---

## API Endpoint Summary

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register owner account |
| POST | `/auth/login` | No | Login, returns JWT |
| GET | `/public/menu` | No | Full public menu (categories + items) |
| GET | `/categories` | Yes | List all categories |
| POST | `/categories` | Yes | Create category |
| PUT | `/categories/{id}` | Yes | Update category |
| DELETE | `/categories/{id}` | Yes | Delete category |
| GET | `/menu-items` | Yes | List all items |
| POST | `/menu-items` | Yes | Create menu item |
| PUT | `/menu-items/{id}` | Yes | Update menu item |
| DELETE | `/menu-items/{id}` | Yes | Delete menu item |
| POST | `/menu-items/{id}/upload-image` | Yes | Upload image to MinIO |

---

## Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| email | VARCHAR | Unique |
| hashed_password | VARCHAR | bcrypt via passlib |
| created_at | TIMESTAMP | |

### `categories`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR | |
| sort_order | INTEGER | For reordering |
| owner_id | UUID | FK → users |

### `menu_items`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| category_id | UUID | FK → categories |
| name | VARCHAR | |
| description | TEXT | |
| price | NUMERIC(10,2) | |
| image_url | VARCHAR | MinIO presigned or public URL |
| is_available | BOOLEAN | Default TRUE |
| sort_order | INTEGER | |

---

## Key Implementation Notes

1. **Ports are strict**: Backend MUST bind to `0.0.0.0:8080`; Frontend Vite dev server MUST run on port `5173`.
2. **Auth**: Use `python-jose[cryptography]` for JWT and `passlib[bcrypt]` directly — do NOT use `Flask-Login`, `django-allauth`, or any legacy wrapper.
3. **Image Storage**: All item images are uploaded to MinIO bucket `menu-images`. The backend generates presigned URLs for frontend display.
4. **CORS**: FastAPI must allow origin `http://localhost:5173`.
5. **Environment Variables**: All secrets (DB password, JWT secret, MinIO credentials) must be passed via `.env` file and never hardcoded.
6. **Public Menu**: The `/public/menu` endpoint requires zero authentication — it is the customer-facing view.