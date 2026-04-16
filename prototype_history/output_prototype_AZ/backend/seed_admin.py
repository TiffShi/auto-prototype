"""
One-time script to seed the default admin user into the database.

Usage:
    python seed_admin.py

Default credentials:
    username: admin
    password: admin123
"""

import sys
import os

# Ensure the backend directory is on the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine, Base
from models import User
from auth import hash_password

# Create tables if they don't exist yet
Base.metadata.create_all(bind=engine)

DEFAULT_USERNAME = "admin"
DEFAULT_PASSWORD = "admin123"


def seed_admin():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == DEFAULT_USERNAME).first()
        if existing:
            print(f"[seed_admin] Admin user '{DEFAULT_USERNAME}' already exists. Skipping.")
            return

        admin_user = User(
            username=DEFAULT_USERNAME,
            hashed_password=hash_password(DEFAULT_PASSWORD),
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"[seed_admin] Admin user created successfully.")
        print(f"  Username : {DEFAULT_USERNAME}")
        print(f"  Password : {DEFAULT_PASSWORD}")
        print(f"  User ID  : {admin_user.id}")
    except Exception as e:
        db.rollback()
        print(f"[seed_admin] Error creating admin user: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()