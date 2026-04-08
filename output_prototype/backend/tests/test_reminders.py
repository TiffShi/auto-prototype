from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_set_reminder():
    response = client.post(
        "/reminders/",
        json={"time": "2023-10-10T10:00:00", "frequency": "daily"}
    )
    assert response.status_code == 200
    assert response.json()["frequency"] == "daily"