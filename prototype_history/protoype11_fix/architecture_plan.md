# 💧 Water Intake Tracker — Architecture Plan

---

## 1. Product Overview

A full-stack web app that allows a user to **log daily water intake**, **visualize progress** toward a daily goal, and **receive browser-based reminders** to drink water at set intervals.

---

## 2. Functional Requirements

### Core Features
| # | Feature | Description |
|---|---------|-------------|
| F1 | Log Water Intake | Add a drink entry (amount + unit: ml/oz) with a timestamp |
| F2 | Daily Goal Tracking | Set a daily water goal (default: 2000ml); show progress bar |
| F3 | Daily Summary | View total intake for today and history by date |
| F4 | Reminder Scheduler | User sets reminder interval (e.g., every 60 min); browser sends push notification |
| F5 | Reset / New Day | Auto-reset daily log at midnight |
| F6 | Settings | Configure goal amount, reminder interval, preferred unit |

### Out of Scope (v1)
- User authentication / multi-user support
- Mobile app
- Email/SMS reminders

---

## 3. Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React + Vite | Fast, modern SPA |
| UI Components | Tailwind CSS + shadcn/ui | Clean, minimal styling |
| State Management | Zustand | Lightweight, simple |
| Backend | FastAPI (Python) | Fast REST API, easy scheduling |
| Database | SQLite + SQLAlchemy | Simple, file-based, no setup |
| Reminders | Web Notifications API (browser) | No external service needed for v1 |
| Background Tasks | APScheduler (FastAPI) | In-process job scheduling |

---

## 4. Data Models

### `WaterEntry`
```python
id: int (PK)
amount: float          # e.g., 250
unit: str              # "ml" or "oz"
logged_at: datetime    # UTC timestamp
```

### `UserSettings`
```python
id: int (PK, always row 1)
daily_goal_ml: float   # default 2000
reminder_interval_min: int  # default 60
preferred_unit: str    # "ml" or "oz"
```

---

## 5. API Endpoints

### Water Entries
```
POST   /api/entries          → Log a new water entry
GET    /api/entries/today    → Get all entries for today
GET    /api/entries?date=    → Get entries for a specific date
DELETE /api/entries/{id}     → Remove an entry
```

### Settings
```
GET    /api/settings         → Fetch current settings
PUT    /api/settings         → Update settings
```

### Summary
```
GET    /api/summary/today    → { total_ml, goal_ml, percentage, entries[] }
GET    /api/summary/history  → Last 7 days of totals
```

---

## 6. File Structure

```
water-tracker/
│
├── backend/
│   ├── main.py                  # FastAPI app entry point, CORS, router registration
│   ├── database.py              # SQLAlchemy engine, session, Base
│   ├── models.py                # ORM models (WaterEntry, UserSettings)
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── crud.py                  # DB operations (create, read, delete entries)
│   ├── scheduler.py             # APScheduler setup (optional server-side ping)
│   ├── routers/
│   │   ├── entries.py           # /api/entries routes
│   │   ├── settings.py          # /api/settings routes
│   │   └── summary.py           # /api/summary routes
│   ├── requirements.txt
│   └── water_tracker.db         # Auto-generated SQLite file
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── main.jsx             # React entry point
│   │   ├── App.jsx              # Root component, routing
│   │   ├── store/
│   │   │   └── useWaterStore.js # Zustand store (entries, settings, goal)
│   │   ├── api/
│   │   │   └── waterApi.js      # Axios API calls (all endpoints)
│   │   ├── hooks/
│   │   │   └── useReminder.js   # Web Notifications interval logic
│   │   ├── components/
│   │   │   ├── LogWaterForm.jsx      # Input: amount, unit, submit button
│   │   │   ├── ProgressBar.jsx       # Visual goal progress (e.g., 1200/2000ml)
│   │   │   ├── EntryList.jsx         # Today's log entries with delete option
│   │   │   ├── HistoryChart.jsx      # Bar chart of last 7 days (recharts)
│   │   │   ├── ReminderToggle.jsx    # Enable/disable + set interval
│   │   │   └── SettingsPanel.jsx     # Goal, unit, reminder config
│   │   └── pages/
│   │       ├── Dashboard.jsx    # Main page: form + progress + today's log
│   │       ├── History.jsx      # 7-day history chart
│   │       └── Settings.jsx     # Settings page
│   └── package.json
│
├── .env                         # CORS origins, DB path
├── docker-compose.yml           # Optional: run both services together
└── README.md
```

---

## 7. Key Implementation Notes

### 🔔 Reminder Logic (`useReminder.js`)
```js
// Request permission once on app load
// Use setInterval based on user's reminder_interval_min setting
// Fire: new Notification("💧 Time to drink water!", { body: "Stay hydrated!" })
// Store intervalId in Zustand to allow toggling off
```

### 📊 Progress Bar Logic
```
percentage = (total_ml_today / daily_goal_ml) * 100
Color: red < 33% → yellow < 66% → green >= 100%
```

### 🔄 Auto Daily Reset
```python
# In scheduler.py — runs at 00:00 daily
# No deletion needed: "today's" entries are always filtered by date
# SQLite query: WHERE DATE(logged_at) = DATE('now')
```

---

## 8. Development Milestones

```
Week 1 — Backend
  ✅ Set up FastAPI + SQLite
  ✅ Implement all models, CRUD, and API routes
  ✅ Test with Postman/Swagger UI

Week 2 — Frontend Core
  ✅ Scaffold React + Vite + Tailwind
  ✅ Build Dashboard (log form + progress bar + entry list)
  ✅ Connect to backend API

Week 3 — Polish
  ✅ Add history chart (recharts)
  ✅ Implement browser reminder (useReminder hook)
  ✅ Build Settings page
  ✅ Basic responsive design
```

---

## 9. `requirements.txt`
```
fastapi
uvicorn
sqlalchemy
pydantic
apscheduler
python-dotenv
```

## 10. `package.json` Key Dependencies
```json
"dependencies": {
  "react": "^18",
  "axios": "^1",
  "zustand": "^4",
  "recharts": "^2",
  "tailwindcss": "^3",
  "@shadcn/ui": "latest"
}
```

---

> **Next Step:** Start with `backend/database.py` and `backend/models.py` to establish the data foundation, then build upward through the API routes before touching the frontend.