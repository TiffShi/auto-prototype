# Banking App — Architecture Plan

## Stack Decision
- **Frontend:** Raw HTML, CSS, and JavaScript (no frameworks)
- **Backend:** FastAPI (Python) — running on **port 8080**
- **Frontend:** Served via a simple static file server — running on **port 5173**
- **Storage:** In-memory (Python dictionary on the backend)

---

## Functional Requirements

### Core Features
1. **View Balance** — Display the current account balance on page load and after every transaction
2. **Deposit Cash** — User enters an amount and clicks "Deposit"; balance increases
3. **Withdraw Cash** — User enters an amount and clicks "Withdraw"; balance decreases (with overdraft protection)
4. **Transaction History** — Display a running log of all deposits and withdrawals
5. **Error Handling** — Show clear error messages for invalid inputs (negative numbers, zero, insufficient funds)

### API Endpoints (Backend — Port 8080)
| Method | Endpoint | Description |
|--------|------------------|-------------------------------|
| GET | `/balance` | Returns current balance |
| POST | `/deposit` | Deposits an amount |
| POST | `/withdraw` | Withdraws an amount |
| GET | `/transactions` | Returns transaction history |

### Request/Response Contracts

**POST `/deposit`**
```json
Request:  { "amount": 100.00 }
Response: { "success": true, "balance": 600.00, "message": "Deposited $100.00" }
```

**POST `/withdraw`**
```json
Request:  { "amount": 50.00 }
Response: { "success": true, "balance": 550.00, "message": "Withdrew $50.00" }
```

**GET `/balance`**
```json
Response: { "balance": 550.00 }
```

**GET `/transactions`**
```json
Response: {
  "transactions": [
    { "type": "deposit", "amount": 100.00, "timestamp": "2024-01-01T10:00:00" },
    { "type": "withdraw", "amount": 50.00, "timestamp": "2024-01-01T10:05:00" }
  ]
}
```

---

## File Structure

```
banking-app/
│
├── backend/
│   ├── main.py               # FastAPI app, in-memory state, all route handlers
│   └── requirements.txt      # fastapi, uvicorn
│
├── frontend/
│   ├── index.html            # Main HTML structure (balance display, forms, history)
│   ├── style.css             # All styling (card layout, buttons, transaction list)
│   └── app.js                # All fetch() calls to API, DOM manipulation, event listeners
│
└── README.md                 # Setup and run instructions
```

---

## Architecture Details

### Backend (`main.py`)
- Single FastAPI app instance
- In-memory state:
  ```python
  account = { "balance": 500.00, "transactions": [] }
  ```
- CORS enabled to allow requests from `http://localhost:5173`
- Runs on **port 8080** via `uvicorn main:app --port 8080`
- Validates all amounts (must be > 0, withdraw cannot exceed balance)

### Frontend (`index.html`)
- Single-page layout with three sections:
  1. **Balance Card** — Large balance display at the top
  2. **Action Panel** — Single amount input + two buttons (Deposit / Withdraw)
  3. **Transaction History** — Scrollable list of past transactions
- On load: fetches `/balance` and `/transactions` to populate the UI

### Frontend (`app.js`)
- All API calls use `fetch()` pointed at `http://localhost:8080`
- `refreshBalance()` — calls GET `/balance`, updates DOM
- `refreshHistory()` — calls GET `/transactions`, rebuilds history list
- `deposit(amount)` — calls POST `/deposit`, then refreshes balance + history
- `withdraw(amount)` — calls POST `/withdraw`, then refreshes balance + history
- Input validation on the client side before sending requests
- Displays success/error messages inline without page reload

### Frontend (`style.css`)
- Clean, modern banking UI with a neutral color palette
- Responsive card-based layout
- Color-coded transactions: green for deposits, red for withdrawals
- Button hover/active states for interactivity

---

## Port Contract (MUST be followed by all agents)
| Service | Port |
|----------------|------|
| Backend API | **8080** |
| Frontend | **5173** |