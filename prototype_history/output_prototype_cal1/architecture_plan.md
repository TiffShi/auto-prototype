# Calculator App — Architecture Plan

---

## 📋 Overview

A clean, responsive calculator web application with a React frontend and a FastAPI backend that handles arithmetic operations via a REST API.

---

## ✅ Functional Requirements

### Frontend
- [ ] Display a calculator UI with buttons (0–9, operators, clear, equals)
- [ ] Show current input and running expression in a display screen
- [ ] Support operations: **addition, subtraction, multiplication, division**
- [ ] Handle edge cases: division by zero, decimal inputs, chained operations
- [ ] Send expression to backend API on `=` press and display result
- [ ] Clear/reset button (`C`) to wipe the current state

### Backend
- [ ] `POST /calculate` — Accept a math expression, evaluate it, return the result
- [ ] Input validation (reject malformed or unsafe expressions)
- [ ] Return structured JSON responses with result or error message
- [ ] CORS enabled for local frontend development

---

## 🗂️ File Structure

```
calculator-app/
│
├── backend/
│   ├── main.py                  # FastAPI app entry point, CORS config
│   ├── routers/
│   │   └── calculator.py        # POST /calculate route
│   ├── services/
│   │   └── evaluator.py         # Safe expression evaluation logic
│   ├── models/
│   │   └── schemas.py           # Pydantic request/response models
│   ├── requirements.txt         # fastapi, uvicorn, pydantic
│   └── .env                     # Environment variables (PORT, etc.)
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── main.jsx             # React entry point
│   │   ├── App.jsx              # Root component
│   │   ├── components/
│   │   │   ├── Calculator.jsx   # Main calculator shell component
│   │   │   ├── Display.jsx      # Expression + result display screen
│   │   │   └── Button.jsx       # Reusable calculator button component
│   │   ├── hooks/
│   │   │   └── useCalculator.js # State logic (input, expression, result)
│   │   ├── services/
│   │   │   └── api.js           # Axios calls to backend API
│   │   └── styles/
│   │       └── calculator.css   # Calculator layout and theme styles
│   ├── package.json
│   └── vite.config.js           # Vite dev server + proxy to backend
│
└── README.md
```

---

## 🔌 API Design

### `POST /calculate`

**Request Body:**
```json
{
  "expression": "8 * (3 + 2)"
}
```

**Success Response `200`:**
```json
{
  "result": 40,
  "expression": "8 * (3 + 2)"
}
```

**Error Response `400`:**
```json
{
  "error": "Division by zero",
  "expression": "5 / 0"
}
```

---

## 🧠 Key Implementation Notes

### Backend — `evaluator.py`
- Use Python's `ast` module to **safely parse and evaluate** expressions
- **Never use `eval()` directly** — whitelist only numeric operations (`+`, `-`, `*`, `/`)
- Raise `HTTPException(400)` for invalid or unsafe input

### Frontend — `useCalculator.js`
| State Variable | Purpose |
|---|---|
| `expression` | The full string being built (e.g. `"8*(3+2)"`) |
| `display` | What's shown on screen |
| `result` | Returned value from API |
| `error` | Error message to display |

### Frontend — `vite.config.js`
- Proxy `/api` → `http://localhost:8000` to avoid CORS issues in dev

---

## 🚀 Getting Started (Dev)

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

---

## 📦 Key Dependencies

| Layer | Package | Purpose |
|---|---|---|
| Backend | `fastapi` | API framework |
| Backend | `uvicorn` | ASGI server |
| Backend | `pydantic` | Request validation |
| Frontend | `react` | UI framework |
| Frontend | `axios` | HTTP client |
| Frontend | `vite` | Build tool & dev server |