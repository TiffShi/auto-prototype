"""
Utility script to hash a plain-text password using bcrypt.

Usage:
    python -m app.scripts.hash_password <plain_password>

Example:
    python -m app.scripts.hash_password mySecret123
"""

import sys

from app.auth import hash_password


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python -m app.scripts.hash_password <plain_password>")
        sys.exit(1)

    plain = sys.argv[1]
    hashed = hash_password(plain)
    print(f"\nPlain text : {plain}")
    print(f"Bcrypt hash: {hashed}\n")
    print("Paste the hash value into app/data/users.json as 'hashed_password'.")


if __name__ == "__main__":
    main()