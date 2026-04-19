import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from config import settings
from routers import streams, websocket, hls

app = FastAPI(
    title="Local Network Live Streaming",
    description="Twitch-like local network streaming application",
    version="1.0.0",
)

# CORS configuration — explicitly whitelist frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(streams.router, prefix="/streams", tags=["streams"])
app.include_router(websocket.router, prefix="/ws", tags=["websocket"])
app.include_router(hls.router, prefix="/hls", tags=["hls"])

# Serve HLS output directory as static files
hls_output_path = os.path.join(os.path.dirname(__file__), "hls_output")
os.makedirs(hls_output_path, exist_ok=True)
app.mount("/hls-files", StaticFiles(directory=hls_output_path), name="hls_files")


@app.get("/", tags=["health"])
async def root():
    return {
        "status": "ok",
        "message": "Local Network Live Streaming API",
        "version": "1.0.0",
    }


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )