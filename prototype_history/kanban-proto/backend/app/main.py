from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, boards, columns, cards

app = FastAPI(
    title="Kanban API",
    version="1.0.0",
    description="Backend API for the Kanban board application",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(boards.router)
app.include_router(columns.router)
app.include_router(cards.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}