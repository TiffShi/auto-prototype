import time
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from core.config import get_settings
from core.database import engine, SessionLocal, Base
from routers import auth, cards, decks, games
from game_ws.game_ws import game_websocket_endpoint

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()


def wait_for_db(retries: int = 10, delay: float = 3.0) -> None:
    for attempt in range(retries):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Database connection established.")
            return
        except Exception as e:
            logger.warning(f"DB not ready (attempt {attempt + 1}/{retries}): {e}")
            time.sleep(delay)
    raise RuntimeError("Could not connect to the database after multiple retries")


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified.")


def run_card_seeder() -> None:
    db = SessionLocal()
    try:
        from services.card_seeder import seed_cards
        seed_cards(db)
    except Exception as e:
        logger.error(f"Card seeding failed: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up TCG backend...")
    wait_for_db()
    create_tables()
    run_card_seeder()
    logger.info("Startup complete.")
    yield
    logger.info("Shutting down TCG backend...")


app = FastAPI(
    title="Trading Card Game API",
    version="1.0.0",
    description="Backend API for the Online Trading Card Game",
    lifespan=lifespan,
)

# CORS — explicitly whitelist frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST routers
app.include_router(auth.router)
app.include_router(cards.router)
app.include_router(decks.router)
app.include_router(games.router)


# WebSocket endpoint
@app.websocket("/ws/game/{room_code}")
async def websocket_game(websocket: WebSocket, room_code: str):
    await game_websocket_endpoint(websocket, room_code)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "tcg-backend"}


@app.get("/")
def root():
    return {"message": "Trading Card Game API", "docs": "/docs"}