# Banking App — Architecture Plan

## Overview
A simple banking application that allows users to deposit and withdraw cash. Account balance is stored in-memory on the Spring Boot backend. Vue handles the frontend UI.

---

## Functional Requirements

### Core Features
1. **View Balance** — Display the current account balance
2. **Deposit Cash** — Input an amount and add it to the balance
3. **Withdraw Cash** — Input an amount and subtract it from the balance
4. **Transaction Validation** — Prevent overdrafts (insufficient funds) and negative/zero inputs
5. **Transaction History** — Display a log of past deposits and withdrawals (in-memory)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 (Composition API) |
| Backend | Spring Boot 3 (Java) |
| Storage | In-Memory (Java object/singleton) |
| API Style | REST |
| Styling | CSS |

---

## API Endpoints

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| GET | `/api/account/balance` | Get current balance | None | `{ balance: number }` |
| POST | `/api/account/deposit` | Deposit cash | `{ amount: number }` | `{ balance: number, message: string }` |
| POST | `/api/account/withdraw` | Withdraw cash | `{ amount: number }` | `{ balance: number, message: string }` |
| GET | `/api/account/transactions` | Get transaction history | None | `[ { type, amount, timestamp } ]` |

---

## File Structure

```
banking-app/
│
├── backend/                                  # Spring Boot Project
│   ├── pom.xml                               # Maven dependencies
│   └── src/
│       └── main/
│           ├── java/
│           │   └── com/
│           │       └── bankingapp/
│           │           ├── BankingAppApplication.java        # Entry point
│           │           ├── controller/
│           │           │   └── AccountController.java        # REST endpoints
│           │           ├── service/
│           │           │   └── AccountService.java           # Business logic
│           │           ├── model/
│           │           │   ├── Account.java                  # Balance state (in-memory)
│           │           │   └── Transaction.java              # Transaction record model
│           │           └── config/
│           │               └── CorsConfig.java               # CORS config for Vue dev server
│           └── resources/
│               └── application.properties                    # Server port config (8080)
│
└── frontend/                                 # Vue 3 Project
    ├── package.json
    ├── vite.config.js                        # Vite config + proxy to backend
    ├── index.html
    └── src/
        ├── main.js                           # Vue app entry point
        ├── App.vue                           # Root component
        ├── components/
        │   ├── BalanceDisplay.vue            # Shows current balance
        │   ├── DepositForm.vue               # Deposit input + button
        │   ├── WithdrawForm.vue              # Withdraw input + button
        │   └── TransactionHistory.vue        # List of past transactions
        ├── services/
        │   └── api.js                        # Axios API calls to backend
        └── assets/
            └── styles/
                └── main.css                  # Global styles
```

---

## Key Implementation Notes

### Backend (Spring Boot)
- `Account.java` will be a **singleton-scoped Spring `@Service`** holding balance and transaction list in memory
- `AccountService.java` handles deposit/withdraw logic with validation (no negative amounts, no overdraft)
- `CorsConfig.java` allows requests from Vue dev server (`localhost:5173`)
- Transactions stored as a `List<Transaction>` in memory — resets on server restart

### Frontend (Vue 3)
- `api.js` uses **Axios** to communicate with the Spring Boot REST API
- `App.vue` manages shared state (balance, transactions) and passes data via props/emits
- Forms validate input client-side before sending to backend
- Balance refreshes automatically after every deposit or withdrawal

### Validation Rules
- Amount must be a **positive number greater than 0**
- Withdrawal amount must **not exceed current balance**
- Backend returns descriptive error messages for invalid operations