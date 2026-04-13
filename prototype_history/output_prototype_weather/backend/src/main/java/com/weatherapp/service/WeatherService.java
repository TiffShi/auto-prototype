package com.weatherapp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.weatherapp.exception.LocationNotFoundException;
import com.weatherapp.exception.WeatherApiException;
import com.weatherapp.model.WeatherResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * Business-logic layer responsible for communicating with the
 * OpenWeatherMap Current Weather API and mapping the raw JSON
 * response into a {@link WeatherResponse} DTO.
 */
@Slf4j
@Service
public class WeatherService {

    private final RestTemplate restTemplate;

    @Value("${openweathermap.api.key}")
    private String apiKey;

    @Value("${openweathermap.api.base-url}")
    private String baseUrl;

    public WeatherService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Fetches current weather for the given location string.
     *
     * @param location city name (e.g. "London") or ZIP code (e.g. "90210,us")
     * @return populated {@link WeatherResponse}
     * @throws LocationNotFoundException if OpenWeatherMap returns 404
     * @throws WeatherApiException       for any other API or network failure
     */
    public WeatherResponse getWeather(String location) {
        validateLocation(location);

        String url = buildUrl(location);
        log.debug("Calling OpenWeatherMap: {}", url);

        try {
            ResponseEntity<JsonNode> response = restTemplate.getForEntity(url, JsonNode.class);
            JsonNode body = response.getBody();

            if (body == null) {
                throw new WeatherApiException("Empty response received from weather API.");
            }

            return mapToWeatherResponse(body);

        } catch (HttpClientErrorException ex) {
            if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new LocationNotFoundException(location);
            }
            if (ex.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                throw new WeatherApiException("Invalid API key configured on the server.");
            }
            log.error("HTTP error from OpenWeatherMap [{}]: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new WeatherApiException("Weather API returned an error: " + ex.getStatusCode());

        } catch (ResourceAccessException ex) {
            log.error("Network error reaching OpenWeatherMap: {}", ex.getMessage());
            throw new WeatherApiException("Could not reach the weather service. Check network connectivity.", ex);

        } catch (WeatherApiException | LocationNotFoundException ex) {
            // Re-throw domain exceptions without wrapping
            throw ex;

        } catch (Exception ex) {
            log.error("Unexpected error while fetching weather data: {}", ex.getMessage(), ex);
            throw new WeatherApiException("Unexpected error while fetching weather data.", ex);
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private void validateLocation(String location) {
        if (location == null || location.isBlank()) {
            throw new IllegalArgumentException("Location must not be blank.");
        }
        if (location.length() > 100) {
            throw new IllegalArgumentException("Location string is too long (max 100 characters).");
        }
    }

    private String buildUrl(String location) {
        return UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("q", location)
                .queryParam("appid", apiKey)
                .queryParam("units", "metric")   // Celsius from API; we convert to °F ourselves
                .build()
                .toUriString();
    }

    /**
     * Maps the raw OpenWeatherMap JSON node to our internal DTO.
     *
     * Expected JSON structure (abbreviated):
     * <pre>
     * {
     *   "name": "London",
     *   "sys": { "country": "GB" },
     *   "main": { "temp": 15.3, "humidity": 72 },
     *   "weather": [ { "description": "light rain" } ],
     *   "wind": { "speed": 4.1 }
     * }
     * </pre>
     */
    private WeatherResponse mapToWeatherResponse(JsonNode body) {
        try {
            String cityName    = body.path("name").asText("Unknown");
            String country     = body.path("sys").path("country").asText("N/A");
            double tempCelsius = body.path("main").path("temp").asDouble();
            int    humidity    = body.path("main").path("humidity").asInt();
            double windSpeed   = body.path("wind").path("speed").asDouble();

            // OpenWeatherMap returns description in lowercase; capitalise first letter
            String rawDescription = body.path("weather")
                                        .path(0)
                                        .path("description")
                                        .asText("N/A");
            String description = capitalise(rawDescription);

            double tempFahrenheit = celsiusToFahrenheit(tempCelsius);

            return WeatherResponse.builder()
                    .location(cityName)
                    .country(country)
                    .temperatureCelsius(round(tempCelsius))
                    .temperatureFahrenheit(round(tempFahrenheit))
                    .description(description)
                    .humidity(humidity)
                    .windSpeed(round(windSpeed))
                    .build();

        } catch (Exception ex) {
            log.error("Failed to parse OpenWeatherMap response: {}", body, ex);
            throw new WeatherApiException("Failed to parse weather data from API response.");
        }
    }

    private double celsiusToFahrenheit(double celsius) {
        return (celsius * 9.0 / 5.0) + 32.0;
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private String capitalise(String text) {
        if (text == null || text.isEmpty()) return text;
        return Character.toUpperCase(text.charAt(0)) + text.substring(1);
    }
}