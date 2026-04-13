# Banking App — Architecture Plan

## Stack Decision
- **Frontend:** Vue 3 (Vite) — running on **port 5173**
- **Backend:** Spring Boot / Java — running on **port 8080**
- **Storage:** In-memory (Java object/map on the backend, no database)

---

## Functional Requirements

### Core Features
1. **View Balance** — Display the current account balance on the main dashboard
2. **Deposit Cash** — Enter an amount and deposit it, updating the in-memory balance
3. **Withdraw Cash** — Enter an amount and withdraw it, with validation (insufficient funds check)
4. **Transaction History** — Display a running list of past deposits and withdrawals (stored in memory)
5. **Error Handling** — Show clear error messages for invalid inputs (negative amounts, overdraft, zero values)

---

## Backend Architecture (Spring Boot / Java — Port 8080)

### REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/account/balance` | Get current balance |
| POST | `/api/account/deposit` | Deposit an amount |
| POST | `/api/account/withdraw` | Withdraw an amount |
| GET | `/api/account/transactions` | Get transaction history |

### Request/Response Shapes

**POST `/api/account/deposit`**
```json
Request:  { "amount": 500.00 }
Response: { "balance": 1500.00, "message": "Deposit successful" }
```

**POST `/api/account/withdraw`**
```json
Request:  { "amount": 200.00 }
Response: { "balance": 1300.00, "message": "Withdrawal successful" }
```

**GET `/api/account/transactions`**
```json
Response: [
  { "id": 1, "type": "DEPOSIT", "amount": 500.00, "timestamp": "2024-01-01T10:00:00" },
  { "id": 2, "type": "WITHDRAWAL", "amount": 200.00, "timestamp": "2024-01-01T10:05:00" }
]
```

---

## File Structure

```
banking-app/
│
├── backend/                          # Spring Boot Java Application
│   ├── pom.xml                       # Maven dependencies (Spring Web, DevTools)
│   └── src/
│       └── main/
│           └── java/
│               └── com/
│                   └── banking/
│                       ├── BankingApplication.java          # Main Spring Boot entry point
│                       ├── config/
│                       │   └── CorsConfig.java              # CORS config to allow port 5173
│                       ├── controller/
│                       │   └── AccountController.java       # REST endpoints
│                       ├── service/
│                       │   └── AccountService.java          # Business logic, in-memory state
│                       └── model/
│                           ├── Account.java                 # Holds balance (in-memory)
│                           ├── Transaction.java             # Transaction record model
│                           └── AmountRequest.java           # DTO for deposit/withdraw requests
│
└── frontend/                         # Vue 3 + Vite Application
    ├── package.json
    ├── vite.config.js                # Dev server on port 5173, proxy to 8080
    ├── index.html
    └── src/
        ├── main.js                   # Vue app entry point
        ├── App.vue                   # Root component
        ├── api/
        │   └── bankingApi.js         # Axios calls to backend (port 8080)
        ├── components/
        │   ├── BalanceCard.vue       # Displays current balance
        │   ├── DepositForm.vue       # Form to deposit cash
        │   ├── WithdrawForm.vue      # Form to withdraw cash
        │   └── TransactionHistory.vue # List of past transactions
        └── views/
            └── DashboardView.vue     # Main dashboard composing all components
```

---

## Key Implementation Notes

### Backend
- `AccountService.java` will be a **`@Service` singleton** (Spring default) holding:
  - A `double balance` field initialized to `0.00`
  - A `List<Transaction>` for transaction history
- `CorsConfig.java` must explicitly **allow origin `http://localhost:5173`** and methods GET/POST
- Validation: throw a custom exception (e.g., `InsufficientFundsException`) if withdrawal > balance, return HTTP `400`
- All state lives purely in-memory — no database, no persistence layer

### Frontend
- `bankingApi.js` uses **Axios** with `baseURL: 'http://localhost:8080/api'`
- `vite.config.js` configures the dev server to run on **port 5173**
- `DashboardView.vue` manages shared state (balance, transactions) and passes data down via props/emits
- After every deposit or withdraw action, re-fetch balance and transaction history to keep UI in sync
- Display user-friendly error messages from backend responses (e.g., "Insufficient funds")