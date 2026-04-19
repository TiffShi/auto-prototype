from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from routers import tracks, albums, artists, playlists, search, featured

app = FastAPI(
    title="Spotify-Type Music Streaming API",
    description="Backend API for a Spotify-inspired music streaming application",
    version="1.0.0",
)

# CORS configuration — explicitly whitelist frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Register routers
app.include_router(tracks.router, prefix="/api", tags=["Tracks"])
app.include_router(albums.router, prefix="/api", tags=["Albums"])
app.include_router(artists.router, prefix="/api", tags=["Artists"])
app.include_router(playlists.router, prefix="/api", tags=["Playlists"])
app.include_router(search.router, prefix="/api", tags=["Search"])
app.include_router(featured.router, prefix="/api", tags=["Featured"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Music Streaming API is running"}


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)