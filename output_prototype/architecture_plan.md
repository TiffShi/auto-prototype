# Architecture Plan: Prime Number Visualizer (Sieve of Eratosthenes)

---

## Tech Stack
- **Frontend:** React (Vite) — Port **5173**
- **Backend:** Spring Boot (Java) — Port **8080**

---

## Functional Requirements

### Core Features
1. **User Input:** A text/number input field where the user enters a maximum number (e.g., 100).
2. **Sieve Calculation:** Backend computes all prime numbers up to the given limit using the Sieve of Eratosthenes algorithm.
3. **Grid Display:** Frontend renders a responsive grid of all numbers from 1 to the limit.
4. **Prime Highlighting:** Prime numbers are visually highlighted in a distinct color (e.g., vibrant purple/gold) vs. non-primes (muted gray).
5. **Loading State:** Show a loading indicator while the backend processes the request.
6. **Error Handling:** Display user-friendly error messages for invalid inputs (e.g., negative numbers, non-integers, values > 1,000,000).

### UX Details
- Input validation on both frontend (basic) and backend (strict).
- "Visualize" button triggers the API call.
- Grid cells animate in on render for visual appeal.
- Display a count of primes found (e.g., "Found 25 primes up to 100").

---

## API Contract

### Endpoint: `GET /api/primes?limit={number}`

**Request:**
```
GET http://localhost:8080/api/primes?limit=100
```

**Success Response (200 OK):**
```json
{
  "limit": 100,
  "primes": [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97],
  "count": 25
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Limit must be a positive integer between 2 and 1,000,000"
}
```

---

## Backend File Structure (Spring Boot)

```
prime-visualizer-backend/
├── pom.xml
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── primevisualizer/
        │           ├── PrimeVisualizerApplication.java   # Main Spring Boot entry point
        │           ├── controller/
        │           │   └── PrimeController.java          # REST controller, GET /api/primes
        │           ├── service/
        │           │   └── SieveService.java             # Sieve of Eratosthenes logic
        │           ├── model/
        │           │   └── PrimeResponse.java            # Response DTO (limit, primes, count)
        │           └── config/
        │               └── CorsConfig.java               # CORS config allowing localhost:5173
        └── resources/
            └── application.properties                    # server.port=8080
```

### Key Implementation Notes (Backend)
- **`application.properties`**: Set `server.port=8080`
- **`CorsConfig.java`**: Allow cross-origin requests from `http://localhost:5173`
- **`SieveService.java`**: Pure Java boolean array sieve — O(n log log n) complexity
- **`PrimeController.java`**: Validate `limit` is between 2 and 1,000,000; return 400 on invalid input
- **`PrimeResponse.java`**: Simple POJO with `limit` (int), `primes` (List<Integer>), `count` (int)

---

## Frontend File Structure (React + Vite)

```
prime-visualizer-frontend/
├── package.json
├── vite.config.js                        # Dev server on port 5173, proxy /api → localhost:8080
├── index.html
└── src/
    ├── main.jsx                          # React entry point
    ├── App.jsx                           # Root component, holds state
    ├── api/
    │   └── primeApi.js                   # Axios/fetch call to GET /api/primes?limit=
    ├── components/
    │   ├── InputPanel.jsx                # Number input + "Visualize" button
    │   ├── StatsBar.jsx                  # Displays "Found X primes up to Y"
    │   ├── PrimeGrid.jsx                 # Renders the full number grid
    │   └── NumberCell.jsx                # Individual cell — styled differently if prime
    └── styles/
        ├── App.css                       # Global styles, layout
        ├── InputPanel.css                # Input/button styling
        ├── PrimeGrid.css                 # Grid layout (CSS Grid), cell animations
        └── NumberCell.css               # Prime vs non-prime color theming
```

### Key Implementation Notes (Frontend)
- **`vite.config.js`**: Configure `server.port: 5173` and proxy `/api` requests to `http://localhost:8080`
- **`App.jsx`**: Manages state: `limit`, `primes` (Set for O(1) lookup), `loading`, `error`
- **`primeApi.js`**: Single async function `fetchPrimes(limit)` calling `GET /api/primes?limit={limit}`
- **`PrimeGrid.jsx`**: Receives full number range (1 to limit) and the primes Set; renders `NumberCell` for each
- **`NumberCell.jsx`**: Accepts `number` and `isPrime` props; applies `.prime` or `.composite` CSS class
- **`StatsBar.jsx`**: Shows prime count and limit; hidden until first successful fetch
- **CSS**: Prime cells → vibrant highlight (e.g., `#7c3aed` purple with white text); composite → `#e5e7eb` gray; number `1` styled as special (neither prime nor composite)

---

## Data Flow Summary

```
User types limit (e.g., 100)
        ↓
[InputPanel] → clicks "Visualize"
        ↓
[primeApi.js] → GET http://localhost:8080/api/primes?limit=100
        ↓
[PrimeController] → validates input
        ↓
[SieveService] → runs Sieve of Eratosthenes → returns List<Integer>
        ↓
JSON response { limit: 100, primes: [...], count: 25 }
        ↓
[App.jsx] → stores primes as a Set
        ↓
[PrimeGrid] → renders 100 NumberCells
        ↓
[NumberCell] → isPrime? → purple highlight : gray cell
```

---

## Constraints & Validation Rules
| Rule | Frontend | Backend |
|---|---|---|
| Must be a positive integer | Warn on blur | Return 400 |
| Minimum value: 2 | Disable button | Return 400 |
| Maximum value: 1,000,000 | Warn user | Return 400 |
| Non-numeric input | Block submission | Return 400 |