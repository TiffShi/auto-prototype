import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import trips, websocket

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


def create_application() -> FastAPI:
    app = FastAPI(
        title="Ride-Sharing Simulator API",
        description="Real-time ride-sharing simulation with WebSocket live updates.",
        version="1.0.0",
    )

    # ── CORS ──────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_ORIGIN],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ───────────────────────────────────────────────────────────
    app.include_router(trips.router)
    app.include_router(websocket.router)

    # ── Lifecycle ─────────────────────────────────────────────────────────
    @app.on_event("startup")
    async def on_startup():
        logger.info("Initialising database tables…")
        await init_db()
        logger.info("Database ready.")

    @app.get("/health", tags=["health"])
    async def health_check():
        return {"status": "ok"}

    return app


app = create_application()