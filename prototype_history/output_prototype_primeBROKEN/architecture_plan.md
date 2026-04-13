# Architecture Plan: Prime Number Visualizer (Sieve of Eratosthenes)

---

## Tech Stack
- **Frontend:** React (Vite) — Port **5173**
- **Backend:** Spring Boot (Java) — Port **8080**

---

## Functional Requirements

### Core Features
1. **User Input:** A text/number input field where the user enters a maximum number (e.g., 100).
2. **Sieve Calculation:** The backend computes all prime numbers up to the given limit using the Sieve of Eratosthenes algorithm.
3. **Grid Display:** The frontend renders a responsive grid of all numbers from 1 to the limit.
4. **Prime Highlighting:** Prime numbers are visually highlighted in a distinct color (e.g., vibrant purple/gold) within the grid.
5. **Loading State:** A loading indicator while the backend processes the request.
6. **Error Handling:** Display user-friendly messages for invalid inputs (e.g., negative numbers, non-integers, numbers > 1,000,000).

### API Contract
- **Endpoint:** `GET /api/primes?limit={number}`
- **Response (200 OK):**
  ```json
  {
    "limit": 100,
    "primes": [2, 3, 5, 7, 11, 13, ...]
  }
  ```
- **Response (400 Bad Request):**
  ```json
  {
    "error": "Limit must be a positive integer between 2 and 1,000,000"
  }
  ```

---

## Port Contract (STRICT)
| Service  | Port |
|----------|------|
| Backend (Spring Boot) | **8080** |
| Frontend (React/Vite) | **5173** |

---

## Precise File Structure

### Backend (Spring Boot)
```
prime-visualizer-backend/
├── pom.xml
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── primevisualizer/
        │           ├── PrimeVisualizerApplication.java   # Main Spring Boot entry point (@SpringBootApplication)
        │           ├── controller/
        │           │   └── PrimeController.java          # REST controller: GET /api/primes?limit={n}
        │           ├── service/
        │           │   └── SieveService.java             # Sieve of Eratosthenes logic, returns List<Integer>
        │           ├── model/
        │           │   └── PrimeResponse.java            # Response POJO: { limit: int, primes: List<Integer> }
        │           └── config/
        │               └── CorsConfig.java               # CORS config: allow origin http://localhost:5173
        └── resources/
            └── application.properties                    # server.port=8080
```

#### Key Implementation Notes (Backend)
- **`SieveService.java`:** Implements the classic boolean array sieve. Validates input (2 ≤ limit ≤ 1,000,000). Throws `IllegalArgumentException` for invalid input.
- **`PrimeController.java`:** `@RestController`, `@RequestMapping("/api")`. Catches `IllegalArgumentException` and returns `ResponseEntity` with HTTP 400.
- **`CorsConfig.java`:** `@Configuration` + `WebMvcConfigurer`. Allows `GET` from `http://localhost:5173`.
- **`application.properties`:** Sets `server.port=8080`.

---

### Frontend (React + Vite)
```
prime-visualizer-frontend/
├── package.json
├── vite.config.js                  # Dev server on port 5173, proxy /api → http://localhost:8080
├── index.html
└── src/
    ├── main.jsx                    # React DOM root render
    ├── App.jsx                     # Root component: manages state (limit, primes, loading, error)
    ├── api/
    │   └── primeApi.js             # fetch('/api/primes?limit=...') — Axios or fetch wrapper
    ├── components/
    │   ├── InputPanel.jsx          # Number input + "Visualize" button + validation feedback
    │   ├── PrimeGrid.jsx           # Renders grid of NumberCell components (1 to limit)
    │   └── NumberCell.jsx          # Single cell: displays number, applies .prime CSS class if prime
    └── styles/
        ├── App.css                 # Global layout styles
        ├── InputPanel.css          # Input/button styling
        └── PrimeGrid.css           # Grid layout (CSS Grid, auto-fill), .prime highlight color
```

#### Key Implementation Notes (Frontend)
- **`App.jsx`:** Holds state: `limit`, `primes` (Set for O(1) lookup), `loading`, `error`. Passes handlers down to `InputPanel`, passes `primes` Set and `limit` to `PrimeGrid`.
- **`primeApi.js`:** Single async function `fetchPrimes(limit)` — calls `GET /api/primes?limit={limit}`, returns parsed JSON or throws error.
- **`PrimeGrid.jsx`:** Uses `Array.from({length: limit}, (_, i) => i + 1)` to generate numbers 1–N. Renders a `NumberCell` for each.
- **`NumberCell.jsx`:** Receives `number` and `isPrime` (boolean). Applies CSS class `prime` when `isPrime` is true.
- **`PrimeGrid.css`:** Uses `display: grid; grid-template-columns: repeat(auto-fill, minmax(50px, 1fr))` for responsive layout. `.prime { background-color: #7c3aed; color: white; }` for highlighting.
- **`vite.config.js`:** Proxy config routes `/api` requests to `http://localhost:8080` to avoid CORS issues in dev.

---

## Data Flow Summary
```
User types limit → InputPanel → App.jsx (calls fetchPrimes)
    → GET /api/primes?limit=100 → PrimeController
    → SieveService.computePrimes(100)
    → Returns PrimeResponse JSON
    → App.jsx stores primes as Set<number>
    → PrimeGrid renders 1–100 grid
    → NumberCell checks Set → applies .prime class
```