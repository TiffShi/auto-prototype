# A2Z Selects — E-Commerce Platform Architecture Plan

---

## Overview
A full-stack e-commerce web application for **A2Z Selects**, allowing an owner/admin to upload and manage products (with images, descriptions, and prices), and customers to browse and view items for sale.

---

## Port Contract
| Service | Port |
|---|---|
| **Backend API (FastAPI)** | `8080` |
| **Frontend (React/Vite)** | `5173` |

---

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Axios, TailwindCSS |
| Backend | FastAPI, Python, Uvicorn |
| Database | SQLite (via SQLAlchemy ORM) |
| File Storage | Local filesystem (`/uploads` directory) |
| Auth (Admin) | Simple JWT-based authentication |

---

## Functional Requirements

### Customer-Facing Features
1. **Home Page** — Hero banner + featured products grid
2. **Product Listing Page** — Browse all available products with image, name, and price
3. **Product Detail Page** — Full product view with image, description, price, and a "Contact to Buy" or "Add to Cart" button
4. **Responsive Design** — Mobile-friendly layout using TailwindCSS

### Admin/Owner Features
1. **Admin Login Page** — Secure login with JWT token stored in localStorage
2. **Admin Dashboard** — Overview of all listed products
3. **Upload Product Form** — Form to add a new product with:
   - Product name
   - Description (rich text or textarea)
   - Price
   - Image upload (file input → stored on server)
4. **Edit Product** — Modify existing product details/image
5. **Delete Product** — Remove a product from the store

### Backend API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Admin login, returns JWT |
| `GET` | `/api/products` | List all products |
| `GET` | `/api/products/{id}` | Get single product |
| `POST` | `/api/products` | Create new product (admin, multipart/form-data) |
| `PUT` | `/api/products/{id}` | Update product (admin) |
| `DELETE` | `/api/products/{id}` | Delete product (admin) |
| `GET` | `/uploads/{filename}` | Serve uploaded images statically |

---

## Precise File Structure

```
a2z-selects/
├── backend/
│   ├── main.py                  # FastAPI app entry point, CORS, static files, port 8080
│   ├── database.py              # SQLAlchemy engine, SessionLocal, Base
│   ├── models.py                # Product & User SQLAlchemy models
│   ├── schemas.py               # Pydantic schemas for request/response validation
│   ├── auth.py                  # JWT creation, password hashing, auth utilities
│   ├── requirements.txt         # fastapi, uvicorn, sqlalchemy, python-jose, passlib, python-multipart, pillow
│   ├── seed_admin.py            # One-time script to create the admin user in DB
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py              # POST /api/auth/login
│   │   └── products.py          # All /api/products CRUD routes
│   └── uploads/                 # Directory where uploaded product images are stored
│       └── .gitkeep
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js           # Vite config — dev server on port 5173, proxy /api → 8080
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx             # React entry point
│       ├── App.jsx              # React Router routes definition
│       ├── index.css            # Tailwind base imports
│       ├── api/
│       │   └── axios.js         # Axios instance with baseURL http://localhost:8080
│       ├── context/
│       │   └── AuthContext.jsx  # Admin auth state (JWT token, login/logout)
│       ├── components/
│       │   ├── Navbar.jsx       # Site navigation with A2Z Selects branding
│       │   ├── Footer.jsx       # Footer component
│       │   ├── ProductCard.jsx  # Reusable product card (image, name, price)
│       │   └── ProtectedRoute.jsx # Redirects to login if no JWT token
│       └── pages/
│           ├── HomePage.jsx         # Hero + featured products
│           ├── ProductsPage.jsx     # Full product grid listing
│           ├── ProductDetailPage.jsx# Single product detail view
│           ├── AdminLoginPage.jsx   # Admin login form
│           ├── AdminDashboard.jsx   # Admin product management table
│           ├── AdminUploadPage.jsx  # Add new product form (with image upload)
│           └── AdminEditPage.jsx    # Edit existing product form
│
└── README.md                    # Setup and run instructions
```

---

## Data Models

### Product
| Field | Type | Notes |
|---|---|---|
| `id` | Integer | Primary key, auto-increment |
| `name` | String | Product name |
| `description` | Text | Full product description |
| `price` | Float | Product price in USD |
| `image_filename` | String | Stored filename in `/uploads` |
| `created_at` | DateTime | Auto-set on creation |

### User (Admin)
| Field | Type | Notes |
|---|---|---|
| `id` | Integer | Primary key |
| `username` | String | Unique admin username |
| `hashed_password` | String | Bcrypt hashed password |

---

## Key Implementation Notes
- **CORS**: FastAPI must allow origin `http://localhost:5173`
- **Static Files**: FastAPI mounts `/uploads` directory at `/uploads` route to serve images
- **Image URLs**: Frontend constructs image URLs as `http://localhost:8080/uploads/{filename}`
- **JWT**: Tokens stored in `localStorage`, sent as `Authorization: Bearer <token>` header on admin requests
- **Vite Proxy**: `/api` requests from frontend proxied to `http://localhost:8080` in development
- **Admin Seeding**: `seed_admin.py` creates a default admin user (username: `admin`, password: `admin123`) on first run