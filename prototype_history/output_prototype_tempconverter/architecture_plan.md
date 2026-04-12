# Temperature Converter — Architecture Plan

---

## 1. Product Overview

A lightweight web app where a user inputs a numeric temperature value, selects a source scale and a target scale, submits the form, and receives the precise converted value — calculated server-side.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | FastAPI (Python) |
| HTTP Client | Axios |
| Styling | CSS Modules |
| Package Mgmt | pip + npm |

---

## 3. Functional Requirements

### FR-1: Temperature Input
- User enters a numeric value in a text input field
- Input must validate for numeric values only
- Negative values must be allowed
- Decimal values must be allowed

### FR-2: Scale Selection
- Two dropdowns: **From Scale** and **To Scale**
- Options in each: `Celsius`, `Fahrenheit`, `Kelvin`
- Both dropdowns are independent (same scale can be selected in both)

### FR-3: Conversion Calculation (Backend)
- A `POST /convert` endpoint accepts `value`, `from_scale`, `to_scale`
- All conversion logic lives exclusively on the backend
- Returns the exact converted number (full float precision)
- Kelvin cannot be negative — backend returns a `400` error if input would produce an invalid Kelvin value

### FR-4: Result Display
- Converted result is displayed clearly below the form
- Result shows the value and the target unit label (e.g., `212.0 °F`)
- While awaiting response, a loading indicator is shown

### FR-5: Error Handling
- Invalid input (non-numeric, empty) caught on the frontend before submission
- Physics errors (e.g., below absolute zero) returned from backend and displayed inline
- Network errors are caught and shown to the user

---

## 4. Conversion Logic (Backend Reference)

```
# To Celsius first, then to target:

Fahrenheit → Celsius: (F - 32) × 5/9
Kelvin     → Celsius: K - 273.15

Celsius → Fahrenheit: (C × 9/5) + 32
Celsius → Kelvin:     C + 273.15

Absolute zero check: result in Kelvin must be >= 0
```

---

## 5. API Contract

### `POST /convert`

**Request Body (JSON):**
```json
{
  "value": 100,
  "from_scale": "celsius",
  "to_scale": "fahrenheit"
}
```

**Success Response `200`:**
```json
{
  "result": 212.0,
  "from_scale": "celsius",
  "to_scale": "fahrenheit",
  "input_value": 100
}
```

**Error Response `400`:**
```json
{
  "detail": "Temperature below absolute zero is not physically possible."
}
```

**Validation Rules:**
- `from_scale` and `to_scale` must be one of: `celsius`, `fahrenheit`, `kelvin`
- `value` must be a valid float

---

## 6. File Structure

```
temperature-converter/
│
├── backend/
│   ├── main.py                  # FastAPI app entry point, CORS config
│   ├── routers/
│   │   └── convert.py           # POST /convert route handler
│   ├── services/
│   │   └── conversion.py        # Pure conversion logic & validation
│   ├── models/
│   │   └── schemas.py           # Pydantic request/response models
│   └── requirements.txt         # fastapi, uvicorn, pydantic
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── main.jsx             # React entry point
│   │   ├── App.jsx              # Root component, state management
│   │   ├── api/
│   │   │   └── converterApi.js  # Axios call to POST /convert
│   │   ├── components/
│   │   │   ├── ConverterForm.jsx   # Input + dropdowns + submit button
│   │   │   ├── ResultDisplay.jsx   # Shows result or error message
│   │   │   └── LoadingSpinner.jsx  # Loading state indicator
│   │   └── styles/
│   │       ├── App.module.css
│   │       ├── ConverterForm.module.css
│   │       └── ResultDisplay.module.css
│   ├── package.json
│   └── vite.config.js           # Proxy /convert → localhost:8000
│
└── README.md
```

---

## 7. Component & Data Flow

```
App.jsx  (holds: inputValue, fromScale, toScale, result, error, isLoading)
│
├── <ConverterForm />
│     ├── Numeric text input        → updates inputValue
│     ├── "From" <select>           → updates fromScale
│     ├── "To"   <select>           → updates toScale
│     └── Submit button             → triggers handleConvert()
│
│         handleConvert()
│           1. Frontend validates: is inputValue a valid number?
│           2. Sets isLoading = true
│           3. Calls converterApi.js → POST /convert
│           4. On success: sets result, clears error
│           5. On failure: sets error message
│           6. Sets isLoading = false
│
├── <LoadingSpinner />              → renders only when isLoading = true
└── <ResultDisplay />               → renders result value or error string
```

---

## 8. Key Implementation Notes

1. **Vite Proxy** — Configure `vite.config.js` to proxy `/convert` to `http://localhost:8000` so no CORS issues in development
2. **Same-scale conversion** — Backend should handle this gracefully and simply return the original value
3. **Precision** — Return Python's native `float`; do not round on the backend. Let the frontend display up to 4 decimal places using `toFixed(4)`
4. **Pydantic Enum** — Use a `StrEnum` or `Literal` type in `schemas.py` to enforce valid scale values automatically
5. **Stateless backend** — No database, no sessions; every request is fully self-contained