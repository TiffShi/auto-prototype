package com.weatherapp.controller;

import com.weatherapp.model.WeatherResponse;
import com.weatherapp.service.WeatherService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller exposing the weather API to the Angular frontend.
 *
 * <p>Endpoint: {@code GET /api/weather?location={city}}
 */
@Slf4j
@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    /**
     * Returns current weather data for the requested location.
     *
     * @param location city name (e.g. "London") or ZIP+country code (e.g. "90210,us")
     * @return {@link WeatherResponse} JSON with temperature, description, humidity, etc.
     */
    @GetMapping
    public ResponseEntity<WeatherResponse> getWeather(
            @RequestParam(name = "location") String location) {

        log.info("Received weather request for location: '{}'", location);
        WeatherResponse response = weatherService.getWeather(location);
        log.info("Returning weather data for: {} ({})", response.getLocation(), response.getCountry());
        return ResponseEntity.ok(response);
    }
}