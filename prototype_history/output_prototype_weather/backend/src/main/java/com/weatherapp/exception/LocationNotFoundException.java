package com.weatherapp.exception;

/**
 * Thrown when OpenWeatherMap returns a 404 for the requested location.
 */
public class LocationNotFoundException extends RuntimeException {

    public LocationNotFoundException(String location) {
        super("Location not found: " + location);
    }
}