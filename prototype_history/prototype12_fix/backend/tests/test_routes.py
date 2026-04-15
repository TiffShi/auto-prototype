"""Integration tests for the FastAPI routes using TestClient."""

import json
import os
import tempfile
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.auth import hash_password
from app.services import water_service, user_service


MOCK_USERS = {
    "users": [
        {
            "id": "u1",
            "username": "testuser",
            "hashed_password": hash_password("testpass"),
        }
    ]
}

MOCK_LOGS: dict = {"logs": {}}


@pytest.fixture()
def client(tmp_path):
    """
    Provide a TestClient with patched data files pointing to temp files.
    """
    users_file = tmp_path / "users.json"
    logs_file = tmp_path / "water_logs.json"

    users_file.write_text(json.dumps(MOCK_USERS))
    logs_file.write_text(json.dumps(MOCK_LOGS))

    with (
        patch.object(user_service, "DATA_FILE", str(users_file)),
        patch.object(water_service, "DATA_FILE", str(logs_file)),
    ):
        with TestClient(app) as c:
            yield c


def _login(client: TestClient) -> str:
    """Helper: log in and return the JWT access token."""
    resp = client.post("/auth/login", json={"username": "testuser", "password": "testpass"})
    assert resp.status_code == 200
    return resp.json()["access_token"]


def test_login_success(client):
    resp = client.post("/auth/login", json={"username": "testuser", "password": "testpass"})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["username"] == "testuser"


def test_login_wrong_password(client):
    resp = client.post("/auth/login", json={"username": "testuser", "password": "wrong"})
    assert resp.status_code == 401


def test_login_unknown_user(client):
    resp = client.post("/auth/login", json={"username": "nobody", "password": "x"})
    assert resp.status_code == 401


def test_get_entries_unauthenticated(client):
    resp = client.get("/water/entries")
    assert resp.status_code == 403


def test_get_entries_empty(client):
    token = _login(client)
    resp = client.get("/water/entries", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["entries"] == []
    assert data["total_ml"] == 0


def test_add_entry(client):
    token = _login(client)
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.post("/water/entries", json={"amount_ml": 300}, headers=headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["amount_ml"] == 300
    assert "id" in data


def test_delete_entry(client):
    token = _login(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Add an entry
    add_resp = client.post("/water/entries", json={"amount_ml": 250}, headers=headers)
    entry_id = add_resp.json()["id"]

    # Delete it
    del_resp = client.delete(f"/water/entries/{entry_id}", headers=headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["deleted_id"] == entry_id

    # Confirm it's gone
    get_resp = client.get("/water/entries", headers=headers)
    assert get_resp.json()["entries"] == []


def test_delete_nonexistent_entry(client):
    token = _login(client)
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.delete("/water/entries/fake-id-000", headers=headers)
    assert resp.status_code == 404


def test_reminder_check_no_reminder(client):
    token = _login(client)
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/reminders/check", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["has_reminder"] is False


def test_logout(client):
    token = _login(client)
    resp = client.post("/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert "logged out" in resp.json()["message"]