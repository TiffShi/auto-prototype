/**
 * Mirrors the WeatherResponse DTO returned by the Spring Boot backend.
 */
export interface WeatherResponse {
  location: string;
  country: string;
  temperatureCelsius: number;
  temperatureFahrenheit: number;
  description: string;
  humidity: number;
  windSpeed: number;
}

/**
 * Standardised error payload returned by the backend on failures.
 */
export interface ErrorResponse {
  errorCode: string;
  message: string;
  timestamp: string;
}