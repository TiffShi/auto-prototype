import pytest
from fastapi.testclient import TestClient
import sys
import os

# Ensure the app directory is on the path when running tests
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import app

client = TestClient(app)


class TestHealthEndpoint:
    def test_health_check(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"


class TestCalculateEndpoint:
    def test_basic_addition(self):
        response = client.post("/api/calculate", json={"expression": "2 + 3"})
        assert response.status_code == 200
        data = response.json()
        assert data["result"] == 5
        assert data["expression"] == "2 + 3"

    def test_multiplication_with_parentheses(self):
        response = client.post(
            "/api/calculate", json={"expression": "8 * (3 + 2)"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["result"] == 40

    def test_float_result(self):
        response = client.post("/api/calculate", json={"expression": "7 / 2"})
        assert response.status_code == 200
        data = response.json()
        assert data["result"] == 3.5

    def test_division_by_zero_returns_400(self):
        response = client.post("/api/calculate", json={"expression": "5 / 0"})
        assert response.status_code == 400
        detail = response.json()["detail"]
        assert "Division by zero" in detail["error"]
        assert detail["expression"] == "5 / 0"

    def test_invalid_syntax_returns_400(self):
        response = client.post("/api/calculate", json={"expression": "8 * ("})
        assert response.status_code == 400
        detail = response.json()["detail"]
        assert "error" in detail

    def test_empty_expression_returns_422(self):
        response = client.post("/api/calculate", json={"expression": ""})
        assert response.status_code == 422

    def test_missing_expression_field_returns_422(self):
        response = client.post("/api/calculate", json={})
        assert response.status_code == 422

    def test_unsafe_expression_returns_400(self):
        response = client.post(
            "/api/calculate", json={"expression": "__import__('os')"}
        )
        assert response.status_code == 400

    def test_chained_operations(self):
        response = client.post(
            "/api/calculate", json={"expression": "100 - 45 * 2 + 10"}
        )
        assert response.status_code == 200
        assert response.json()["result"] == 20

    def test_decimal_expression(self):
        response = client.post(
            "/api/calculate", json={"expression": "3.14 * 2"}
        )
        assert response.status_code == 200
        result = response.json()["result"]
        assert abs(result - 6.28) < 1e-9

    def test_negative_numbers(self):
        response = client.post("/api/calculate", json={"expression": "-5 + 10"})
        assert response.status_code == 200
        assert response.json()["result"] == 5

    def test_response_contains_expression(self):
        expr = "3 * 3"
        response = client.post("/api/calculate", json={"expression": expr})
        assert response.status_code == 200
        assert response.json()["expression"] == expr