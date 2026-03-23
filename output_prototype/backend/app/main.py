from fastapi import FastAPI
from app.routers import user, water_intake, reminders
from app.database import engine, Base

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Include routers
app.include_router(user.router)
app.include_router(water_intake.router)
app.include_router(reminders.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Water Intake Tracker API"}