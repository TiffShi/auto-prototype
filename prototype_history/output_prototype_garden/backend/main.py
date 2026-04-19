from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import SessionStart, SessionData
from session_store import session_store
import uuid
import time

app = FastAPI(title="Blooming Flower Garden API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Blooming Flower Garden API is running"}


@app.post("/api/session/start", response_model=SessionData)
def start_session(payload: SessionStart):
    session_id = str(uuid.uuid4())
    started_at = time.time()

    session_data = {
        "session_id": session_id,
        "flower_type": payload.flower_type,
        "started_at": started_at,
        "bloom_count": 0,
    }

    session_store[session_id] = session_data

    return SessionData(
        session_id=session_id,
        flower_type=payload.flower_type,
        started_at=started_at,
        elapsed_seconds=0.0,
        bloom_count=0,
    )


@app.get("/api/session/{session_id}", response_model=SessionData)
def get_session(session_id: str):
    if session_id not in session_store:
        raise HTTPException(status_code=404, detail="Session not found")

    session = session_store[session_id]
    elapsed = time.time() - session["started_at"]

    import math
    bloom_count = int(math.floor(math.log(elapsed + 1) * 3))

    session_store[session_id]["bloom_count"] = bloom_count

    return SessionData(
        session_id=session_id,
        flower_type=session["flower_type"],
        started_at=session["started_at"],
        elapsed_seconds=round(elapsed, 2),
        bloom_count=bloom_count,
    )


@app.patch("/api/session/{session_id}/bloom")
def update_bloom_count(session_id: str, bloom_count: int):
    if session_id not in session_store:
        raise HTTPException(status_code=404, detail="Session not found")

    session_store[session_id]["bloom_count"] = bloom_count
    return {"session_id": session_id, "bloom_count": bloom_count, "updated": True}


@app.delete("/api/session/{session_id}")
def end_session(session_id: str):
    if session_id not in session_store:
        raise HTTPException(status_code=404, detail="Session not found")

    session = session_store.pop(session_id)
    elapsed = time.time() - session["started_at"]

    return {
        "session_id": session_id,
        "flower_type": session["flower_type"],
        "total_elapsed_seconds": round(elapsed, 2),
        "final_bloom_count": session["bloom_count"],
        "ended": True,
    }


@app.get("/api/sessions/count")
def get_active_session_count():
    return {"active_sessions": len(session_store)}