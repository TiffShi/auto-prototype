import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.routers import auth, categories, items, menu
from app.services.storage_service import ensure_bucket_exists

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application startup and shutdown lifecycle handler."""
    logger.info("Starting up Restaurant Menu API…")

    # 1. Create database tables
    try:
        init_db()
        logger.info("Database tables initialised.")
    except Exception as exc:
        logger.error("Database initialisation failed: %s", exc)
        raise

    # 2. Ensure MinIO bucket exists with public-read policy
    try:
        ensure_bucket_exists()
    except Exception as exc:
        logger.warning("MinIO setup failed (continuing anyway): %s", exc)

    yield  # Application is running

    logger.info("Shutting down Restaurant Menu API.")


app = FastAPI(
    title="Restaurant Menu Management API",
    description=(
        "Backend API for managing restaurant menus. "
        "Owners can register, log in, and manage categories and items. "
        "Customers can view the published menu without authentication."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server — explicit, no wildcard
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(items.router)
app.include_router(menu.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"], summary="Health check endpoint")
def health_check() -> dict:
    return {"status": "ok", "service": "restaurant-menu-api"}