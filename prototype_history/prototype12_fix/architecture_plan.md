# Water Intake Tracker — Architecture Plan

---

## Overview
A full-stack web application that allows authenticated users to log and track their daily water intake, with a reminder system. User data is stored in a local JSON file (mock database).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Axios + React Router |
| Backend | FastAPI + Python |
| Auth | JWT (JSON Web Tokens) |
| Storage | Local JSON file (mock DB) |
| Reminders | APScheduler (background job in FastAPI) |

---

## Functional Requirements

### Authentication
- [ ] User can log in with username and password
- [ ] Passwords are hashed (bcrypt) even in mock data
- [ ] JWT token issued on login, stored in `localStorage`
- [ ] Protected routes redirect unauthenticated users to `/login`
- [ ] User can log out

### Water Intake Tracking
- [ ] User can log a water intake entry (amount in ml/oz + timestamp)
- [ ] User can view today's total intake
- [ ] User can view a history log of entries for the current day
- [ ] User can delete an individual entry
- [ ] Daily goal progress bar (default goal: 2000ml)

### Reminders
- [ ] Background scheduler runs every hour during waking hours (8am–10pm)
- [ ] If user hasn't logged water in the last hour, a reminder is triggered
- [ ] Reminder is surfaced as an in-app notification on next page load (polling)

---

## File Structure

```
water-tracker/
│
├── backend/
│   ├── main.py                  # FastAPI app entry point, CORS, router registration
│   ├── auth.py                  # JWT creation, decoding, password hashing
│   ├── routes/
│   │   ├── auth_routes.py       # POST /login, POST /logout
│   │   ├── water_routes.py      # GET/POST/DELETE /water/entries
│   │   └── reminder_routes.py   # GET /reminders/check
│   ├── models/
│   │   ├── user.py              # Pydantic model: User, LoginRequest
│   │   └── water.py             # Pydantic model: WaterEntry, WaterLog
│   ├── services/
│   │   ├── user_service.py      # Read/validate users from JSON
│   │   ├── water_service.py     # CRUD logic for water entries in JSON
│   │   └── reminder_service.py  # Scheduler logic, reminder state checks
│   ├── data/
│   │   ├── users.json           # Mock user DB { username, hashed_password }
│   │   └── water_logs.json      # Water entries per user { user: [entries] }
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── main.jsx             # React entry point
│   │   ├── App.jsx              # Router setup, protected route logic
│   │   ├── api/
│   │   │   └── axiosClient.js   # Axios instance with JWT interceptor
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Auth state, login/logout functions
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx    # Login form
│   │   │   └── DashboardPage.jsx# Main tracker UI
│   │   ├── components/
│   │   │   ├── WaterForm.jsx    # Input form to log water amount
│   │   │   ├── WaterLog.jsx     # List of today's entries with delete
│   │   │   ├── ProgressBar.jsx  # Visual daily goal progress
│   │   │   ├── ReminderBanner.jsx # Displays reminder notification
│   │   │   └── Navbar.jsx       # Top nav with logout button
│   │   └── styles/
│   │       └── index.css        # Global styles
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/auth/login` | ❌ | Validate credentials, return JWT |
| `POST` | `/auth/logout` | ✅ | Invalidate client token |
| `GET` | `/water/entries` | ✅ | Get today's entries for user |
| `POST` | `/water/entries` | ✅ | Add a new water entry |
| `DELETE` | `/water/entries/{id}` | ✅ | Delete a specific entry |
| `GET` | `/reminders/check` | ✅ | Check if a reminder should be shown |

---

## Data Shapes

### `users.json`
```json
{
  "users": [
    {
      "id": "u1",
      "username": "alice",
      "hashed_password": "$2b$12$..."
    }
  ]
}
```

### `water_logs.json`
```json
{
  "logs": {
    "u1": [
      {
        "id": "entry-uuid",
        "amount_ml": 250,
        "timestamp": "2024-01-15T08:30:00"
      }
    ]
  }
}
```

---

## Key Implementation Notes

1. **JWT Flow** — Token is attached to every request via an Axios interceptor in `axiosClient.js`. Backend verifies token on every protected route using a FastAPI `Depends()` guard.

2. **JSON as DB** — `water_service.py` reads and writes `water_logs.json` on every request. File is loaded into memory, mutated, then written back. Sufficient for a single-user/mock scenario.

3. **Reminder Logic** — `APScheduler` runs a background job inside FastAPI on startup. It sets a flag per user in memory (or back to JSON). The frontend polls `GET /reminders/check` every 60 seconds and displays `ReminderBanner.jsx` if a reminder is pending. The flag clears once acknowledged.

4. **Protected Routes (React)** — `App.jsx` wraps dashboard routes in a `<ProtectedRoute>` component that reads from `AuthContext`. If no token exists, it redirects to `/login`.

5. **Password Hashing** — Even though this is mock data, passwords in `users.json` should be pre-hashed using `bcrypt`. A helper script `hash_password.py` can be added to generate these.