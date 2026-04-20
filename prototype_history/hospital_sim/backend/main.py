import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import (
    hospitals,
    departments,
    patients,
    staff,
    inventory,
    financials,
    events,
    simulation,
)
from app.websocket.manager import websocket_router
from app.services.simulation_engine import simulation_manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified.")

    # Start the simulation manager background task
    sim_task = asyncio.create_task(simulation_manager.run())
    logger.info("Simulation manager started.")

    yield

    # Shutdown
    sim_task.cancel()
    try:
        await sim_task
    except asyncio.CancelledError:
        pass
    logger.info("Simulation manager stopped.")
    await engine.dispose()


app = FastAPI(
    title="Hospital Simulator API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(hospitals.router, prefix="/api", tags=["hospitals"])
app.include_router(departments.router, prefix="/api", tags=["departments"])
app.include_router(patients.router, prefix="/api", tags=["patients"])
app.include_router(staff.router, prefix="/api", tags=["staff"])
app.include_router(inventory.router, prefix="/api", tags=["inventory"])
app.include_router(financials.router, prefix="/api", tags=["financials"])
app.include_router(events.router, prefix="/api", tags=["events"])
app.include_router(simulation.router, prefix="/api", tags=["simulation"])
app.include_router(websocket_router, tags=["websocket"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "hospital-simulator-backend"}