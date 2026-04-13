import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WeatherResponse, ErrorResponse } from '../models/weather.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  /** Base URL sourced from the environment file – never hardcoded. */
  private readonly apiUrl = `${environment.apiBaseUrl}/api/weather`;

  constructor(private http: HttpClient) {}

  /**
   * Fetches current weather data for the given location.
   * @param location City name (e.g. "London") or ZIP code (e.g. "90210,us")
   */
  getWeather(location: string): Observable<WeatherResponse> {
    const params = new HttpParams().set('location', location.trim());

    return this.http
      .get<WeatherResponse>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Transforms HttpErrorResponse into a user-friendly Error with a
   * message extracted from the backend ErrorResponse payload when available.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let userMessage = 'An unexpected error occurred. Please try again.';

    if (error.status === 0) {
      // Network / CORS error
      userMessage = 'Unable to reach the weather service. Please check your connection.';
    } else if (error.error && typeof error.error === 'object') {
      const backendError = error.error as ErrorResponse;
      if (backendError.message) {
        userMessage = backendError.message;
      }
    } else if (error.status === 404) {
      userMessage = 'Location not found. Please check the city name and try again.';
    } else if (error.status >= 500) {
      userMessage = 'The weather service is currently unavailable. Please try again later.';
    }

    return throwError(() => new Error(userMessage));
  }
}