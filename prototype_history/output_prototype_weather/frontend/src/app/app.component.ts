import { Component } from '@angular/core';
import { WeatherService } from './services/weather.service';
import { WeatherResponse } from './models/weather.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  /** Holds the latest successful weather response. */
  weatherData: WeatherResponse | null = null;

  /** True while the HTTP request is in-flight. */
  isLoading = false;

  /** Holds a user-friendly error message when a request fails. */
  errorMessage: string | null = null;

  constructor(private weatherService: WeatherService) {}

  /**
   * Triggered by the SearchBarComponent's (search) event.
   * Clears previous state, sets loading, then calls the weather service.
   */
  onSearch(location: string): void {
    if (!location || !location.trim()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.weatherData = null;

    this.weatherService.getWeather(location).subscribe({
      next: (data: WeatherResponse) => {
        this.weatherData = data;
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }
}