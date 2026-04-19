import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, Base
from routers import auth, products

# Create all tables
Base.metadata.create_all(bind=engine)

# Ensure uploads directory exists
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

app = FastAPI(
    title="A2Z Selects API",
    description="Backend API for A2Z Selects e-commerce platform",
    version="1.0.0",
)

# CORS configuration — explicitly whitelist frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for static file serving
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])


@app.get("/", tags=["Health"])
def root():
    return {"message": "A2Z Selects API is running", "status": "ok"}


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "A2Z Selects API"}