# Banking App — Architecture Plan

## Stack
- **Frontend:** Angular (port **5173**)
- **Backend:** Express.js (port **8080**)
- **Auth:** JWT (JSON Web Tokens)
- **Storage:** In-memory (JavaScript objects/arrays on the backend)

---

## Functional Requirements

### Authentication
- User can **sign up** with username + password
- User can **log in** with username + password
- JWT token issued on login/signup, stored in `localStorage` on the frontend
- Protected routes require valid JWT (Angular route guards + Express middleware)

### Banking
- Authenticated user can **view their balance**
- Authenticated user can **deposit** a specified amount
- Authenticated user can **withdraw** a specified amount (with insufficient funds check)
- Transaction history stored in memory per user

---

## API Endpoints (Express — port 8080)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/signup` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/account/balance` | Yes | Get current balance |
| POST | `/api/account/deposit` | Yes | Deposit cash |
| POST | `/api/account/withdraw` | Yes | Withdraw cash |
| GET | `/api/account/transactions` | Yes | Get transaction history |

---

## File Structure

```
banking-app/
├── backend/
│   ├── package.json
│   ├── server.js                  # Express app entry point, port 8080
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification middleware
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/signup, /api/auth/login
│   │   └── accountRoutes.js       # /api/account/* (protected)
│   ├── controllers/
│   │   ├── authController.js      # Signup/login logic, JWT signing
│   │   └── accountController.js   # Deposit/withdraw/balance logic
│   └── data/
│       └── inMemoryStore.js       # In-memory users & accounts store
│
└── frontend/
    ├── package.json
    ├── angular.json               # Angular CLI config, devServer port 5173
    ├── tsconfig.json
    ├── src/
    │   ├── main.ts
    │   ├── app/
    │   │   ├── app.module.ts          # Root module, HttpClient, RouterModule
    │   │   ├── app-routing.module.ts  # Route definitions + AuthGuard
    │   │   ├── app.component.ts/html  # Root component with nav
    │   │   │
    │   │   ├── guards/
    │   │   │   └── auth.guard.ts      # Redirects unauthenticated users to /login
    │   │   │
    │   │   ├── interceptors/
    │   │   │   └── jwt.interceptor.ts # Attaches Bearer token to every request
    │   │   │
    │   │   ├── services/
    │   │   │   ├── auth.service.ts    # Signup/login API calls, token management
    │   │   │   └── account.service.ts # Balance/deposit/withdraw API calls
    │   │   │
    │   │   ├── pages/
    │   │   │   ├── login/
    │   │   │   │   ├── login.component.ts
    │   │   │   │   └── login.component.html   # Login form
    │   │   │   ├── signup/
    │   │   │   │   ├── signup.component.ts
    │   │   │   │   └── signup.component.html  # Signup form
    │   │   │   └── dashboard/
    │   │   │       ├── dashboard.component.ts
    │   │   │       └── dashboard.component.html # Balance, deposit, withdraw, history
    │   │   │
    │   │   └── models/
    │   │       ├── user.model.ts          # User interface
    │   │       └── transaction.model.ts   # Transaction interface
    │   │
    │   └── environments/
    │       └── environment.ts         # apiUrl: 'http://localhost:8080'
```

---

## Key Implementation Details

### Backend (`inMemoryStore.js`)
```js
// Structure:
const users = [];
// { id, username, passwordHash, balance, transactions[] }
```

### JWT Flow
1. On signup/login → server signs JWT with `userId` payload, secret from env
2. Token returned to Angular → stored in `localStorage`
3. `jwt.interceptor.ts` attaches `Authorization: Bearer <token>` to all HTTP requests
4. `authMiddleware.js` verifies token on protected Express routes

### Angular Route Protection
- `/login` and `/signup` → public
- `/dashboard` → protected by `AuthGuard` (checks `localStorage` for valid token)

### CORS
- Express configured with `cors` package to allow origin `http://localhost:5173`

### Port Contract
- **Backend API:** `http://localhost:8080`
- **Frontend Dev Server:** `http://localhost:5173`