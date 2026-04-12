from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_log_water_intake():
    response = client.post(
        "/water_intake/",
        json={"amount": 250.0, "date": "2023-10-10T10:00:00"}
    )
    assert response.status_code == 200
    assert response.json()["amount"] == 250.0