import json
import os
from typing import Optional

STORAGE_FILE = os.path.join(os.path.dirname(__file__), "documents.json")


class Storage:
    def __init__(self):
        self._ensure_file()

    def _ensure_file(self):
        if not os.path.exists(STORAGE_FILE):
            with open(STORAGE_FILE, "w", encoding="utf-8") as f:
                json.dump([], f)

    def _read(self) -> list[dict]:
        with open(STORAGE_FILE, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
                if not isinstance(data, list):
                    return []
                return data
            except json.JSONDecodeError:
                return []

    def _write(self, documents: list[dict]):
        with open(STORAGE_FILE, "w", encoding="utf-8") as f:
            json.dump(documents, f, indent=2, ensure_ascii=False)

    def get_all(self) -> list[dict]:
        docs = self._read()
        # Return sorted by updated_at descending
        return sorted(docs, key=lambda d: d.get("updated_at", ""), reverse=True)

    def get_by_id(self, doc_id: str) -> Optional[dict]:
        docs = self._read()
        for doc in docs:
            if doc.get("id") == doc_id:
                return doc
        return None

    def save(self, document: dict):
        docs = self._read()
        docs.append(document)
        self._write(docs)

    def update(self, updated_doc: dict):
        docs = self._read()
        for i, doc in enumerate(docs):
            if doc.get("id") == updated_doc["id"]:
                docs[i] = updated_doc
                break
        self._write(docs)

    def delete(self, doc_id: str):
        docs = self._read()
        docs = [doc for doc in docs if doc.get("id") != doc_id]
        self._write(docs)