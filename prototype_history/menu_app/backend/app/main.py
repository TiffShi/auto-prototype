import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth, categories, menu_items, public

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan: startup and shutdown hooks."""
    logger.info("Starting Restaurant Menu API on port 8080...")
    # Attempt to ensure MinIO bucket exists on startup (non-fatal if MinIO is unavailable)
    try:
        from app.services.storage_service import ensure_bucket_exists
        ensure_bucket_exists()
    except Exception as exc:
        logger.warning("MinIO bucket setup skipped at startup: %s", exc)
    yield
    logger.info("Shutting down Restaurant Menu API.")


app = FastAPI(
    title="Restaurant Menu Management API",
    description="Backend API for managing restaurant menus with owner authentication.",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — explicitly whitelist the Vite frontend origin
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(menu_items.router)
app.include_router(public.router)


@app.get("/health", tags=["Health"], summary="Health check endpoint")
def health_check() -> dict:
    return {"status": "ok", "service": "restaurant-menu-api"}