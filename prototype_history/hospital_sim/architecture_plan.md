---

# 🏥 Hospital Simulator — Architecture Plan

## Overview
A browser-based hospital management simulator where users manage departments, staff, patients, and resources in real time. The system tracks patient intake, triage, treatment, discharge, and hospital financials/stats.

---

## Port Contract
- **Backend API**: `http://localhost:8080`
- **Frontend**: `http://localhost:5173`
- **Database**: PostgreSQL on internal port `5432` (not exposed publicly)

---

## Functional Requirements

### 1. Hospital Dashboard
- Real-time overview of hospital status (occupancy, staff on duty, revenue, patient queue)
- Key metrics: bed availability, ER wait time, staff utilization, daily revenue

### 2. Patient Management
- Random patient generation (name, age, condition severity: low/medium/critical)
- Patient intake → triage → treatment → discharge pipeline
- Patient queue with priority sorting by severity
- Track patient status: Waiting, In Treatment, Discharged, Deceased

### 3. Department Management
- Departments: Emergency Room, ICU, General Ward, Surgery, Pharmacy
- Each department has: bed count, staff assigned, current occupancy
- Upgrade departments (increase capacity, hire staff)

### 4. Staff Management
- Staff roles: Doctor, Nurse, Surgeon, Pharmacist, Administrator
- Hire/fire staff, assign to departments
- Staff have: fatigue level, skill level, salary cost
- Shift scheduling (Day/Night shifts)

### 5. Resource & Inventory
- Medical supplies: medicines, equipment, beds
- Track stock levels, auto-alert on low stock
- Purchase supplies (costs money)

### 6. Financial System
- Starting budget (e.g., $500,000)
- Revenue from treated patients (based on severity/treatment)
- Expenses: staff salaries, supplies, upgrades
- Financial history log

### 7. Simulation Engine
- Time-based simulation (1 sim-minute = configurable real seconds)
- Events: random patient arrivals, equipment failures, staff illness, disease outbreaks
- Game speed controls: Pause / 1x / 2x / 5x

### 8. Notifications & Events
- Alert feed for critical events (patient critical, low supplies, staff shortage)
- Event log with timestamps

---

## Data Models

### `hospitals`
| Field | Type |
|---|---|
| id | UUID PK |
| name | VARCHAR |
| budget | DECIMAL |
| day | INTEGER |
| speed_multiplier | FLOAT |
| created_at | TIMESTAMP |

### `departments`
| Field | Type |
|---|---|
| id | UUID PK |
| hospital_id | UUID FK |
| name | VARCHAR |
| type | ENUM (ER, ICU, GENERAL, SURGERY, PHARMACY) |
| bed_capacity | INTEGER |
| current_occupancy | INTEGER |
| upgrade_level | INTEGER |

### `patients`
| Field | Type |
|---|---|
| id | UUID PK |
| hospital_id | UUID FK |
| department_id | UUID FK (nullable) |
| name | VARCHAR |
| age | INTEGER |
| condition | VARCHAR |
| severity | ENUM (LOW, MEDIUM, CRITICAL) |
| status | ENUM (WAITING, IN_TREATMENT, DISCHARGED, DECEASED) |
| admitted_at | TIMESTAMP |
| discharged_at | TIMESTAMP (nullable) |
| treatment_cost | DECIMAL |

### `staff`
| Field | Type |
|---|---|
| id | UUID PK |
| hospital_id | UUID FK |
| department_id | UUID FK (nullable) |
| name | VARCHAR |
| role | ENUM (DOCTOR, NURSE, SURGEON, PHARMACIST, ADMIN) |
| skill_level | INTEGER (1–10) |
| fatigue | INTEGER (0–100) |
| salary | DECIMAL |
| shift | ENUM (DAY, NIGHT) |
| is_available | BOOLEAN |

### `inventory`
| Field | Type |
|---|---|
| id | UUID PK |
| hospital_id | UUID FK |
| item_name | VARCHAR |
| category | ENUM (MEDICINE, EQUIPMENT, SUPPLIES) |
| quantity | INTEGER |
| unit_cost | DECIMAL |
| reorder_threshold | INTEGER |

### `financial_transactions`
| Field | Type |
|---|---|
| id | UUID PK |
| hospital_id | UUID FK |
| type | ENUM (REVENUE, EXPENSE) |
| amount | DECIMAL |
| description | VARCHAR |
| created_at | TIMESTAMP |

### `events`
| Field | Type |
|---|---|
| id | UUID PK |
| hospital_id | UUID FK |
| event_type | VARCHAR |
| description | TEXT |
| severity | ENUM (INFO, WARNING, CRITICAL) |
| created_at | TIMESTAMP |

---

## API Endpoints

### Hospital
- `POST /api/hospitals` — Create new hospital/game
- `GET /api/hospitals/{id}` — Get hospital state
- `PATCH /api/hospitals/{id}/speed` — Set simulation speed

### Departments
- `GET /api/hospitals/{id}/departments` — List departments
- `PATCH /api/departments/{id}/upgrade` — Upgrade department

### Patients
- `GET /api/hospitals/{id}/patients` — List patients (filterable by status)
- `POST /api/hospitals/{id}/patients/admit` — Manually admit patient
- `PATCH /api/patients/{id}/status` — Update patient status
- `POST /api/hospitals/{id}/patients/generate` — Trigger random patient arrival

### Staff
- `GET /api/hospitals/{id}/staff` — List staff
- `POST /api/hospitals/{id}/staff/hire` — Hire staff member
- `DELETE /api/staff/{id}` — Fire staff member
- `PATCH /api/staff/{id}/assign` — Assign to department

### Inventory
- `GET /api/hospitals/{id}/inventory` — List inventory
- `POST /api/hospitals/{id}/inventory/purchase` — Purchase supplies

### Financials
- `GET /api/hospitals/{id}/financials` — Get budget + transaction history

### Events
- `GET /api/hospitals/{id}/events` — Get event log

### Simulation
- `POST /api/hospitals/{id}/simulate/tick` — Advance simulation one tick
- WebSocket: `ws://localhost:8080/ws/{hospital_id}` — Real-time sim updates

---

## File Structure

```
hospital-simulator/
├── docker-compose.yml
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                        # FastAPI app entry point
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py                  # Settings, DB URL, env vars
│   │   ├── database.py                # SQLAlchemy engine + session
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── hospital.py
│   │   │   ├── department.py
│   │   │   ├── patient.py
│   │   │   ├── staff.py
│   │   │   ├── inventory.py
│   │   │   ├── transaction.py
│   │   │   └── event.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── hospital.py
│   │   │   ├── department.py
│   │   │   ├── patient.py
│   │   │   ├── staff.py
│   │   │   ├── inventory.py
│   │   │   ├── transaction.py
│   │   │   └── event.py
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── hospitals.py
│   │   │   ├── departments.py
│   │   │   ├── patients.py
│   │   │   ├── staff.py
│   │   │   ├── inventory.py
│   │   │   ├── financials.py
│   │   │   ├── events.py
│   │   │   └── simulation.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── simulation_engine.py   # Core tick logic
│   │   │   ├── patient_generator.py   # Random patient creation
│   │   │   ├── event_generator.py     # Random event creation
│   │   │   ├── financial_service.py   # Budget calculations
│   │   │   └── staff_service.py       # Fatigue, shift logic
│   │   ├── websocket/
│   │   │   ├── __init__.py
│   │   │   └── manager.py             # WebSocket connection manager
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── enums.py               # All shared enums
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/
│       │   ├── hospitalApi.js
│       │   ├── patientApi.js
│       │   ├── staffApi.js
│       │   ├── inventoryApi.js
│       │   └── websocket.js           # WS client hook
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Sidebar.jsx
│       │   │   ├── TopBar.jsx
│       │   │   └── SimSpeedControl.jsx
│       │   ├── dashboard/
│       │   │   ├── StatCard.jsx
│       │   │   ├── OccupancyChart.jsx
│       │   │   └── RevenueChart.jsx
│       │   ├── patients/
│       │   │   ├── PatientQueue.jsx
│       │   │   ├── PatientCard.jsx
│       │   │   └── PatientStatusBadge.jsx
│       │   ├── departments/
│       │   │   ├── DepartmentGrid.jsx
│       │   │   └── DepartmentCard.jsx
│       │   ├── staff/
│       │   │   ├── StaffTable.jsx
│       │   │   ├── HireStaffModal.jsx
│       │   │   └── StaffCard.jsx
│       │   ├── inventory/
│       │   │   ├── InventoryTable.jsx
│       │   │   └── PurchaseModal.jsx
│       │   ├── financials/
│       │   │   ├── BudgetBar.jsx
│       │   │   └── TransactionLog.jsx
│       │   └── events/
│       │       ├── EventFeed.jsx
│       │       └── EventAlert.jsx
│       ├── pages/
│       │   ├── HomePage.jsx           # Create/load hospital
│       │   ├── DashboardPage.jsx
│       │   ├── PatientsPage.jsx
│       │   ├── DepartmentsPage.jsx
│       │   ├── StaffPage.jsx
│       │   ├── InventoryPage.jsx
│       │   └── FinancialsPage.jsx
│       ├── store/
│       │   ├── hospitalStore.js       # Zustand global state
│       │   ├── simulationStore.js
│       │   └── notificationStore.js
│       └── styles/
│           └── index.css
│
└── database/
    ├── Dockerfile
    └── init.sql                       # Schema + seed data
```

---

## Docker Compose Services

```yaml
services:
  db:
    build: ./database
    environment:
      POSTGRES_DB: hospital_sim
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"          # internal only recommended

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgresql://admin:secret@db:5432/hospital_sim
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend
```

---

## Key Technical Notes

1. **Simulation Engine**: The backend runs a background `asyncio` task per hospital that fires ticks at the configured speed. Each tick: generates patients, ages existing patients, applies fatigue to staff, deducts salaries, checks inventory thresholds, and pushes updates via WebSocket.
2. **WebSocket**: All real-time dashboard updates (patient arrivals, events, budget changes) are pushed via `ws://localhost:8080/ws/{hospital_id}`.
3. **State Management**: Frontend uses **Zustand** for global sim state, seeded from REST on load and updated via WebSocket messages.
4. **Styling**: Use **Tailwind CSS** with a dark medical theme (dark blues, greens for healthy metrics, reds for critical alerts).
5. **Alembic**: Use Alembic for database migrations in the backend.
6. **No object storage needed**: All data is structured/relational — no file uploads required.