import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import videos

# Create upload directories if they don't exist
os.makedirs("uploads/videos", exist_ok=True)
os.makedirs("uploads/thumbnails", exist_ok=True)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="YouTube-Style Video Platform",
    description="A video sharing platform API",
    version="1.0.0"
)

# CORS configuration — explicitly whitelist frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "Accept-Ranges", "Content-Length", "Content-Type"],
)

# Register routers
app.include_router(videos.router, prefix="/api/videos", tags=["videos"])


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Video platform API is running"}