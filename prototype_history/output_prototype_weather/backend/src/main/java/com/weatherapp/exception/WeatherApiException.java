package com.weatherapp.exception;

/**
 * Thrown when the OpenWeatherMap API returns an unexpected error
 * or when the HTTP call itself fails (network timeout, etc.).
 */
public class WeatherApiException extends RuntimeException {

    public WeatherApiException(String message) {
        super(message);
    }

    public WeatherApiException(String message, Throwable cause) {
        super(message, cause);
    }
}