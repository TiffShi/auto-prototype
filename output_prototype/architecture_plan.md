# Temperature Converter – Architecture Plan

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

### FR-1 — User Input
- A numeric text field accepts the temperature value (integers and decimals, including negatives)
- Two dropdowns: **From Scale** and **To Scale**, each containing `Celsius`, `Fahrenheit`, `Kelvin`
- A **Convert** button triggers the API call

### FR-2 — Conversion Logic (Backend)
- All conversions route through Kelvin as the canonical intermediate unit
- Supported pairs: C↔F, C↔K, F↔K (and same-scale identity)
- Returns a JSON response with the result as a full-precision float
- Validates input: rejects non-numeric values and temperatures below absolute zero

### FR-3 — Result Display
- The converted result is displayed clearly below the form
- Shows: `{input} °{FromScale} = {result} °{ToScale}`
- Handles and displays backend validation errors gracefully

### FR-4 — Edge Cases
- Same input/output scale → returns the original value
- Absolute zero enforcement (e.g., reject < −273.15 °C)
- Empty or non-numeric input → frontend blocks submission before API call

---

## 4. API Design

### `POST /convert`

**Request Body**
```json
{
  "value": 100.0,
  "from_scale": "Celsius",
  "to_scale": "Fahrenheit"
}
```

**Success Response** `200 OK`
```json
{
  "result": 212.0,
  "from_scale": "Celsius",
  "to_scale": "Fahrenheit",
  "input_value": 100.0
}
```

**Error Response** `422 Unprocessable Entity`
```json
{
  "detail": "Temperature is below absolute zero for the given scale."
}
```

---

## 5. Conversion Logic Rules

```
To convert any value → first convert to Kelvin → then convert to target:

Celsius    → Kelvin:     K = C + 273.15
Fahrenheit → Kelvin:     K = (F + 459.67) × 5/9
Kelvin     → Kelvin:     K = K

Kelvin → Celsius:        C = K − 273.15
Kelvin → Fahrenheit:     F = K × 9/5 − 459.67
Kelvin → Kelvin:         K = K

Absolute zero in Kelvin: K >= 0
```

---

## 6. File Structure

```
temperature-converter/
│
├── backend/
│   ├── main.py                  # FastAPI app entry point, registers router
│   ├── routers/
│   │   └── convert.py           # POST /convert endpoint
│   ├── services/
│   │   └── conversion.py        # Pure conversion logic & absolute zero validation
│   ├── models/
│   │   └── schemas.py           # Pydantic request/response models
│   └── requirements.txt         # fastapi, uvicorn, pydantic
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx             # React entry point
        ├── App.jsx              # Root component, holds state
        ├── api/
        │   └── convertApi.js    # Axios call to POST /convert
        ├── components/
        │   ├── ConverterForm.jsx # Input field + two dropdowns + button
        │   ├── ResultDisplay.jsx # Shows the formatted result or error
        │   └── ScaleDropdown.jsx # Reusable dropdown for scale selection
        └── styles/
            ├── App.module.css
            ├── ConverterForm.module.css
            └── ResultDisplay.module.css
```

---

## 7. Component Responsibilities

### `App.jsx`
- Owns state: `inputValue`, `fromScale`, `toScale`, `result`, `error`, `isLoading`
- Passes handlers down to `ConverterForm`
- Passes `result` and `error` to `ResultDisplay`

### `ConverterForm.jsx`
- Renders the numeric input, two `ScaleDropdown` instances, and the Convert button
- Performs client-side validation (empty, non-numeric) before calling the API
- Calls `convertApi.js` on submit and lifts result/error up to `App`

### `ScaleDropdown.jsx`
- Props: `label`, `value`, `onChange`
- Renders a `<select>` with the three scale options

### `ResultDisplay.jsx`
- Props: `result`, `error`, `isLoading`
- Conditionally renders a loading state, error message, or formatted result string

### `convertApi.js`
- Single exported async function `convertTemperature({ value, fromScale, toScale })`
- Returns the parsed response data or throws a structured error

---

## 8. Data Flow (End-to-End)

```
User fills form
      │
      ▼
ConverterForm validates input (client-side)
      │
      ▼
convertApi.js → POST /convert → FastAPI router (convert.py)
                                        │
                                        ▼
                               schemas.py validates Pydantic model
                                        │
                                        ▼
                               conversion.py runs math + absolute zero check
                                        │
                                        ▼
                               JSON response returned
      │
      ▼
App.jsx updates state → ResultDisplay renders output
```

---

## 9. Development Milestones

| # | Milestone | Deliverable |
|---|---|---|
| 1 | Backend core | `conversion.py` with all 6 conversion paths + validation |
| 2 | Backend API | Pydantic schemas + `/convert` endpoint wired up |
| 3 | Frontend shell | Vite/React scaffold + `ConverterForm` renders correctly |
| 4 | API integration | `convertApi.js` connected, result flows to `ResultDisplay` |
| 5 | Error handling | Absolute zero errors + network errors displayed in UI |
| 6 | Polish | Loading states, same-scale hint, CSS styling |