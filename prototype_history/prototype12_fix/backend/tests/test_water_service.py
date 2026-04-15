"""Unit tests for the water service layer."""

import json
import os
import tempfile
from datetime import datetime, timezone
from unittest.mock import patch

import pytest

from app.models.water import WaterEntryCreate
from app.services import water_service


@pytest.fixture(autouse=True)
def temp_data_file(tmp_path):
    """Redirect the water service DATA_FILE to a temporary file for each test."""
    temp_file = tmp_path / "water_logs.json"
    temp_file.write_text(json.dumps({"logs": {}}))
    with patch.object(water_service, "DATA_FILE", str(temp_file)):
        yield str(temp_file)


def test_add_and_retrieve_entry():
    entry_data = WaterEntryCreate(amount_ml=300)
    added = water_service.add_water_entry("u1", entry_data)

    assert added.amount_ml == 300
    assert added.id is not None

    entries = water_service.get_todays_entries("u1")
    assert len(entries) == 1
    assert entries[0].id == added.id


def test_delete_entry():
    entry_data = WaterEntryCreate(amount_ml=500)
    added = water_service.add_water_entry("u1", entry_data)

    result = water_service.delete_water_entry("u1", added.id)
    assert result is True

    entries = water_service.get_todays_entries("u1")
    assert len(entries) == 0


def test_delete_nonexistent_entry_returns_false():
    result = water_service.delete_water_entry("u1", "nonexistent-id")
    assert result is False


def test_get_last_entry_time_no_entries():
    last = water_service.get_last_entry_time("u1")
    assert last is None


def test_get_last_entry_time_with_entries():
    water_service.add_water_entry("u1", WaterEntryCreate(amount_ml=100))
    water_service.add_water_entry("u1", WaterEntryCreate(amount_ml=200))
    last = water_service.get_last_entry_time("u1")
    assert last is not None
    assert isinstance(last, datetime)


def test_total_ml_calculation():
    water_service.add_water_entry("u1", WaterEntryCreate(amount_ml=250))
    water_service.add_water_entry("u1", WaterEntryCreate(amount_ml=750))
    entries = water_service.get_todays_entries("u1")
    total = sum(e.amount_ml for e in entries)
    assert total == 1000.0