import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routers import photos
from database import init_db

# Ensure uploads directory exists
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

app = FastAPI(
    title="Photo Sharing API",
    description="Backend API for the Photo Sharing application",
    version="1.0.0",
)

# CORS — explicitly whitelist the frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for serving uploaded images
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Include routers
app.include_router(photos.router, prefix="/api/photos", tags=["photos"])


@app.on_event("startup")
async def startup_event():
    """Initialize the database on startup."""
    init_db()


@app.get("/", tags=["health"])
async def root():
    return {"status": "ok", "message": "Photo Sharing API is running"}


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)