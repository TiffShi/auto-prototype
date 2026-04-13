# Architecture Plan: Weather App

## Stack
- **Frontend:** Angular (port **5173**)
- **Backend:** Spring Boot (port **8080**)
- **External API:** OpenWeatherMap API (free tier)

---

## Functional Requirements

### Core Features
1. **Location Search** – User enters a city name or ZIP code into a search input field
2. **Current Temperature Display** – Fetches and displays the current temperature for the given location
3. **Temperature Units** – Display temperature in Celsius and Fahrenheit
4. **Weather Condition** – Show a brief weather description (e.g., "Cloudy", "Sunny")
5. **Error Handling** – Display user-friendly messages for invalid locations or API failures
6. **Loading State** – Show a loading indicator while fetching data

---

## Architecture Overview

```
[Angular Frontend :5173]
        |
        | HTTP GET /api/weather?location={city}
        v
[Spring Boot Backend :8080]
        |
        | HTTP GET (OpenWeatherMap API)
        v
[OpenWeatherMap External API]
```

---

## Backend: Spring Boot

### File Structure
```
weather-backend/
├── pom.xml
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── weatherapp/
│       │           ├── WeatherAppApplication.java          # Main Spring Boot entry point
│       │           ├── controller/
│       │           │   └── WeatherController.java          # REST controller: GET /api/weather
│       │           ├── service/
│       │           │   └── WeatherService.java             # Business logic, calls OpenWeatherMap
│       │           ├── model/
│       │           │   └── WeatherResponse.java            # Response DTO (location, temp, description)
│       │           └── config/
│       │               └── CorsConfig.java                 # CORS config to allow :5173
│       └── resources/
│           └── application.properties                      # API key, server port=8080, base URL
```

### Key Backend Details
- **Endpoint:** `GET /api/weather?location={city}`
- **Response JSON:**
```json
{
  "location": "London",
  "temperatureCelsius": 15.3,
  "temperatureFahrenheit": 59.5,
  "description": "Partly Cloudy",
  "humidity": 72,
  "country": "GB"
}
```
- **Port:** `server.port=8080` in `application.properties`
- **CORS:** Allow origin `http://localhost:5173`
- **Dependencies:** Spring Web, Spring Boot DevTools, Lombok, RestTemplate/WebClient

---

## Frontend: Angular

### File Structure
```
weather-frontend/
├── package.json
├── angular.json                                            # Configure dev server port to 5173
├── tsconfig.json
├── src/
│   ├── main.ts
│   ├── index.html
│   ├── styles.css                                         # Global styles
│   └── app/
│       ├── app.module.ts                                  # Root module, HttpClientModule
│       ├── app.component.ts                               # Root component
│       ├── app.component.html
│       ├── components/
│       │   ├── search-bar/
│       │   │   ├── search-bar.component.ts                # Input field + search button
│       │   │   ├── search-bar.component.html
│       │   │   └── search-bar.component.css
│       │   └── weather-card/
│       │       ├── weather-card.component.ts              # Displays temp, description, humidity
│       │       ├── weather-card.component.html
│       │       └── weather-card.component.css
│       ├── services/
│       │   └── weather.service.ts                         # HttpClient calls to :8080/api/weather
│       └── models/
│           └── weather.model.ts                           # TypeScript interface for WeatherResponse
```

### Key Frontend Details
- **Dev Server Port:** Configure `angular.json` to use port **5173**
- **API Base URL:** `http://localhost:8080/api/weather`
- **Weather Service:** Uses Angular `HttpClient` to call the backend
- **Components:**
  - `SearchBarComponent` – emits search events with city name
  - `WeatherCardComponent` – receives and renders weather data
- **Error Handling:** Display error banner if backend returns non-2xx response
- **Loading Spinner:** Show while HTTP request is in-flight using `isLoading` boolean flag

---

## Data Flow

```
1. User types city name in SearchBarComponent
2. User clicks "Search" button
3. WeatherService.getWeather(city) called → GET http://localhost:8080/api/weather?location={city}
4. Spring Boot WeatherController receives request
5. WeatherService calls OpenWeatherMap API with city + API key
6. Response mapped to WeatherResponse DTO and returned as JSON
7. Angular receives JSON → WeatherCardComponent renders temperature & details
```

---

## Configuration Notes

| Setting | Value |
|---|---|
| Backend Port | `8080` |
| Frontend Port | `5173` |
| CORS Allowed Origin | `http://localhost:5173` |
| API Key Storage | `application.properties` (backend only, never exposed to frontend) |
| External API | OpenWeatherMap Current Weather API |