"""
Initialisation script — run once to create the data files with
pre-hashed passwords.

Usage:
    python -m app.scripts.init_data
"""

import json
import os

from app.auth import hash_password

BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def init_users() -> None:
    users_path = os.path.join(BASE_DIR, "users.json")
    os.makedirs(BASE_DIR, exist_ok=True)

    users_data = {
        "users": [
            {
                "id": "u1",
                "username": "alice",
                "hashed_password": hash_password("password123"),
            },
            {
                "id": "u2",
                "username": "bob",
                "hashed_password": hash_password("securepass"),
            },
        ]
    }

    with open(users_path, "w", encoding="utf-8") as f:
        json.dump(users_data, f, indent=2)

    print(f"✅  users.json written to {os.path.abspath(users_path)}")


def init_water_logs() -> None:
    logs_path = os.path.join(BASE_DIR, "water_logs.json")
    os.makedirs(BASE_DIR, exist_ok=True)

    if os.path.exists(logs_path):
        print(f"ℹ️   water_logs.json already exists at {os.path.abspath(logs_path)} — skipping.")
        return

    logs_data = {"logs": {}}

    with open(logs_path, "w", encoding="utf-8") as f:
        json.dump(logs_data, f, indent=2)

    print(f"✅  water_logs.json written to {os.path.abspath(logs_path)}")


if __name__ == "__main__":
    init_users()
    init_water_logs()
    print("\n🚀  Data initialisation complete.")
    print("    Default credentials:")
    print("      alice / password123")
    print("      bob   / securepass")