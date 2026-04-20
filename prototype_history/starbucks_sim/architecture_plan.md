---

# Architecture Plan: Starbucks-Like Drink Ordering App

## Overview
A full-stack beverage ordering application where users can browse a menu of drinks, customize their orders, and place them. Built with **Vue 3** (frontend), **FastAPI** (backend), **PostgreSQL** (database), and **MinIO** (object storage for drink images).

---

## Port Contract
| Service | Internal Port | Host Port |
|---|---|---|
| Frontend (Vue) | 5173 | **5173** |
| Backend (FastAPI) | 8080 | **8080** |
| PostgreSQL | 5432 | 5432 |
| MinIO API | 9000 | **9000** |
| MinIO Console | 9001 | **9001** |

---

## Functional Requirements

### 1. User Authentication
- User registration (name, email, password)
- User login / logout (JWT-based)
- Protected routes for ordering and order history

### 2. Menu Browsing
- Display all available drinks grouped by category (e.g., Hot Coffees, Cold Brews, Teas, Refreshers, Frappuccinos)
- Each drink card shows: image (from MinIO), name, description, base price
- Filter by category
- Search drinks by name

### 3. Drink Customization
- Select drink size (Tall, Grande, Venti)
- Select milk type (Whole, Oat, Almond, Skim, None)
- Add extras/modifiers (extra shot, syrup flavors, whipped cream, etc.)
- Real-time price calculation based on customizations

### 4. Cart Management
- Add drinks (with customizations) to cart
- Update quantity or remove items from cart
- View cart summary with total price

### 5. Order Placement
- Place order from cart
- Order confirmation screen with order ID and estimated wait time
- Order status tracking (Pending → In Progress → Ready → Completed)

### 6. Order History
- Authenticated users can view past orders
- Re-order from history (pre-fills cart with previous items)

### 7. Admin Panel (Basic)
- Add / edit / delete drinks from the menu
- Upload drink images (stored in MinIO)
- View and update order statuses

---

## Data Models

### `users`
```
id, email, name, hashed_password, role (user/admin), created_at
```

### `categories`
```
id, name, display_order
```

### `drinks`
```
id, category_id, name, description, base_price, image_url, is_available, created_at
```

### `modifiers`
```
id, name, type (size/milk/extra), price_delta
```

### `drink_modifiers` (join)
```
drink_id, modifier_id
```

### `orders`
```
id, user_id, status, total_price, created_at, updated_at
```

### `order_items`
```
id, order_id, drink_id, quantity, unit_price, customization_notes (JSON)
```

### `order_item_modifiers` (join)
```
order_item_id, modifier_id
```

---

## API Endpoints (FastAPI — port 8080)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET  /api/auth/me`

### Menu
- `GET  /api/categories`
- `GET  /api/drinks` — supports `?category_id=&search=`
- `GET  /api/drinks/{id}`
- `GET  /api/modifiers`

### Cart (session/local — managed client-side in Pinia store)

### Orders
- `POST /api/orders` — place order
- `GET  /api/orders` — user's order history
- `GET  /api/orders/{id}` — order detail
- `PATCH /api/orders/{id}/status` — admin only

### Admin
- `POST   /api/admin/drinks`
- `PUT    /api/admin/drinks/{id}`
- `DELETE /api/admin/drinks/{id}`
- `POST   /api/admin/drinks/{id}/image` — upload to MinIO

### Media
- `GET /api/media/{filename}` — proxied MinIO presigned URL

---

## Frontend Pages & Components (Vue 3 — port 5173)

### Pages
```
/                    → Home / Featured drinks
/menu                → Full menu with category filters
/menu/:id            → Drink detail + customization modal
/cart                → Cart review page
/checkout            → Order confirmation
/orders              → Order history (auth required)
/orders/:id          → Order detail / status
/login               → Login page
/register            → Register page
/admin               → Admin dashboard (admin role required)
```

### Key Components
```
NavBar, DrinkCard, CategoryFilter, SearchBar
DrinkCustomizer (modal), CartDrawer, CartItem
OrderStatusBadge, OrderHistoryCard
AdminDrinkForm, AdminOrderTable
```

### State Management (Pinia Stores)
```
authStore     → user session, JWT token
cartStore     → cart items, totals (persisted to localStorage)
menuStore     → drinks, categories, modifiers cache
orderStore    → active and past orders
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
│   ├── main.py                  # FastAPI app entry, CORS, router registration
│   ├── config.py                # Settings (env vars, DB URL, MinIO config)
│   ├── database.py              # SQLAlchemy engine & session
│   ├── models/
│   │   ├── user.py
│   │   ├── drink.py
│   │   ├── category.py
│   │   ├── modifier.py
│   │   └── order.py
│   ├── schemas/
│   │   ├── user.py
│   │   ├── drink.py
│   │   ├── modifier.py
│   │   └── order.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── menu.py
│   │   ├── orders.py
│   │   ├── admin.py
│   │   └── media.py
│   ├── services/
│   │   ├── auth_service.py      # JWT, password hashing
│   │   ├── order_service.py     # Order creation logic
│   │   └── minio_service.py     # MinIO upload/presign
│   └── alembic/                 # DB migrations
│       ├── env.py
│       └── versions/
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js           # Proxy /api → backend:8080
│   ├── index.html
│   └── src/
│       ├── main.js
│       ├── App.vue
│       ├── router/
│       │   └── index.js         # Vue Router routes
│       ├── stores/
│       │   ├── auth.js
│       │   ├── cart.js
│       │   ├── menu.js
│       │   └── order.js
│       ├── api/
│       │   └── index.js         # Axios instance with JWT interceptor
│       ├── pages/
│       │   ├── HomePage.vue
│       │   ├── MenuPage.vue
│       │   ├── DrinkDetailPage.vue
│       │   ├── CartPage.vue
│       │   ├── CheckoutPage.vue
│       │   ├── OrderHistoryPage.vue
│       │   ├── OrderDetailPage.vue
│       │   ├── LoginPage.vue
│       │   ├── RegisterPage.vue
│       │   └── AdminPage.vue
│       └── components/
│           ├── NavBar.vue
│           ├── DrinkCard.vue
│           ├── CategoryFilter.vue
│           ├── SearchBar.vue
│           ├── DrinkCustomizer.vue
│           ├── CartDrawer.vue
│           ├── CartItem.vue
│           ├── OrderStatusBadge.vue
│           ├── OrderHistoryCard.vue
│           ├── AdminDrinkForm.vue
│           └── AdminOrderTable.vue
│
└── database/
    └── Dockerfile               # PostgreSQL with init scripts
```

---

## Docker Compose Services

```yaml
services:
  backend:       # FastAPI — host port 8080
  frontend:      # Vue/Vite — host port 5173
  db:            # PostgreSQL — host port 5432
  minio:         # MinIO — host ports 9000 (API) / 9001 (Console)
```

### Key Environment Variables
```
# Backend
DATABASE_URL=postgresql://user:pass@db:5432/starbucks_db
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=drink-images
JWT_SECRET=supersecretkey
JWT_EXPIRE_MINUTES=1440

# Frontend
VITE_API_BASE_URL=http://localhost:8080
```

---

## Key Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Auth | JWT (Bearer token) | Stateless, works well with Vue SPA |
| Cart persistence | Pinia + localStorage | No server round-trip needed for cart |
| Image storage | MinIO | S3-compatible, self-hosted, ideal for drink photos |
| DB migrations | Alembic | Standard for SQLAlchemy/FastAPI |
| Vue state | Pinia | Official Vue 3 state management |
| HTTP client | Axios | Interceptors for JWT injection |
| Styling | Tailwind CSS | Rapid Starbucks-green themed UI |