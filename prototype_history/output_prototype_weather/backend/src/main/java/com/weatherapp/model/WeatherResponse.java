package com.weatherapp.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO returned by the backend to the Angular frontend.
 * Contains all weather data fields the UI needs to render.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherResponse {

    /** City name as returned by OpenWeatherMap */
    private String location;

    /** Two-letter ISO country code, e.g. "GB", "US" */
    private String country;

    /** Temperature in degrees Celsius, rounded to one decimal place */
    private double temperatureCelsius;

    /** Temperature in degrees Fahrenheit, rounded to one decimal place */
    private double temperatureFahrenheit;

    /** Human-readable weather description, e.g. "Partly Cloudy" */
    private String description;

    /** Relative humidity percentage, 0–100 */
    private int humidity;

    /** Wind speed in metres per second */
    private double windSpeed;
}