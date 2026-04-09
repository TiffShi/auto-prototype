from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routes import auth_routes, water_routes, reminder_routes
from app.services.reminder_service import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(
    title="Water Intake Tracker API",
    description="Track daily water intake with reminders",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/auth", tags=["Authentication"])
app.include_router(water_routes.router, prefix="/water", tags=["Water Intake"])
app.include_router(reminder_routes.router, prefix="/reminders", tags=["Reminders"])


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "message": "Water Intake Tracker API is running"}