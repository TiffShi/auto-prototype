from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import calculator

app = FastAPI(
    title="Calculator API",
    description="A simple calculator API that evaluates arithmetic expressions safely.",
    version="1.0.0",
)

# CORS configuration for frontend development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(calculator.router)


@app.get("/health", tags=["Health"])
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok"}