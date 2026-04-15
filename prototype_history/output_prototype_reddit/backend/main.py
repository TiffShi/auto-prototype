from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import communities, posts, comments

app = FastAPI(title="Reddit-Type App", version="1.0.0")

# CORS configuration — explicitly whitelist the frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(communities.router, tags=["communities"])
app.include_router(posts.router, tags=["posts"])
app.include_router(comments.router, tags=["comments"])


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}