from fastapi import FastAPI
from app.routers import auth, water_intake, reminders
from app.database import engine, Base

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Include routers
app.include_router(auth.router)
app.include_router(water_intake.router)
app.include_router(reminders.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Water Intake Tracker API"}