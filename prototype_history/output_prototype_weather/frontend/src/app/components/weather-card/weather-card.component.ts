import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { WeatherResponse } from '../../models/weather.model';

@Component({
  selector: 'app-weather-card',
  templateUrl: './weather-card.component.html',
  styleUrls: ['./weather-card.component.css']
})
export class WeatherCardComponent implements OnChanges {
  /** Weather data passed in from the parent AppComponent. */
  @Input() weather!: WeatherResponse;

  /** Emoji icon derived from the weather description. */
  weatherIcon = '🌡️';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['weather'] && this.weather) {
      this.weatherIcon = this.resolveWeatherIcon(this.weather.description);
    }
  }

  /**
   * Maps a weather description string to a representative emoji.
   * Falls back to a thermometer if no match is found.
   */
  private resolveWeatherIcon(description: string): string {
    const desc = description.toLowerCase();

    if (desc.includes('thunder') || desc.includes('storm'))  return '⛈️';
    if (desc.includes('drizzle'))                             return '🌦️';
    if (desc.includes('rain'))                                return '🌧️';
    if (desc.includes('snow') || desc.includes('sleet'))      return '❄️';
    if (desc.includes('mist') || desc.includes('fog') ||
        desc.includes('haze') || desc.includes('smoke'))      return '🌫️';
    if (desc.includes('clear') || desc.includes('sunny'))     return '☀️';
    if (desc.includes('partly') || desc.includes('few'))      return '⛅';
    if (desc.includes('cloud') || desc.includes('overcast'))  return '☁️';
    if (desc.includes('wind'))                                 return '💨';

    return '🌡️';
  }
}