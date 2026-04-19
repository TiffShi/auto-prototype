from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from database import Base, engine
from routes.notes import router as notes_router

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Notes Taking App",
    description="A simple CRUD notes application built with FastAPI",
    version="1.0.0",
)

# CORS configuration — explicitly whitelist the frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Accept", "Authorization"],
)

# Register routers
app.include_router(notes_router, prefix="/notes", tags=["notes"])


@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok", "message": "Notes API is running on port 8080"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)