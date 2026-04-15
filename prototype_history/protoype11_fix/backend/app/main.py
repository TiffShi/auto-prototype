import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import entries, settings, summary
from app.scheduler import start_scheduler, shutdown_scheduler

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    start_scheduler()
    yield
    # Shutdown
    shutdown_scheduler()


app = FastAPI(
    title="Water Intake Tracker API",
    description="Track daily water intake, manage goals, and view history.",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(entries.router, prefix="/api/entries", tags=["entries"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(summary.router, prefix="/api/summary", tags=["summary"])


@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok", "message": "Water Tracker API is running 💧"}