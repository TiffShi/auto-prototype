from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import DocumentCreate, DocumentUpdate, DocumentResponse
from storage import Storage
import uuid
from datetime import datetime, timezone

app = FastAPI(title="Text Editor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

storage = Storage()


@app.get("/documents", response_model=list[DocumentResponse])
def list_documents():
    documents = storage.get_all()
    return documents


@app.post("/documents", response_model=DocumentResponse, status_code=201)
def create_document(payload: DocumentCreate):
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        "title": payload.title,
        "content": payload.content,
        "created_at": now,
        "updated_at": now,
    }
    storage.save(doc)
    return doc


@app.get("/documents/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: str):
    doc = storage.get_by_id(doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@app.put("/documents/{doc_id}", response_model=DocumentResponse)
def update_document(doc_id: str, payload: DocumentUpdate):
    doc = storage.get_by_id(doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")

    if payload.title is not None:
        doc["title"] = payload.title
    if payload.content is not None:
        doc["content"] = payload.content
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()

    storage.update(doc)
    return doc


@app.delete("/documents/{doc_id}", status_code=204)
def delete_document(doc_id: str):
    doc = storage.get_by_id(doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")
    storage.delete(doc_id)
    return None


@app.get("/health")
def health_check():
    return {"status": "ok"}