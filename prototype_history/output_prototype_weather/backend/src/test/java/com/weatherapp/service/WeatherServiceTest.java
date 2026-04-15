package com.weatherapp.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.weatherapp.exception.LocationNotFoundException;
import com.weatherapp.exception.WeatherApiException;
import com.weatherapp.model.WeatherResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WeatherServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private WeatherService weatherService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(weatherService, "apiKey", "test-api-key");
        ReflectionTestUtils.setField(weatherService, "baseUrl",
                "https://api.openweathermap.org/data/2.5/weather");
    }

    @Test
    void getWeather_validCity_returnsWeatherResponse() throws Exception {
        // Arrange
        ObjectNode mockJson = buildMockApiResponse("London", "GB", 15.0, 72, "light rain", 4.1);
        when(restTemplate.getForEntity(anyString(), eq(com.fasterxml.jackson.databind.JsonNode.class)))
                .thenReturn(ResponseEntity.ok(mockJson));

        // Act
        WeatherResponse result = weatherService.getWeather("London");

        // Assert
        assertThat(result.getLocation()).isEqualTo("London");
        assertThat(result.getCountry()).isEqualTo("GB");
        assertThat(result.getTemperatureCelsius()).isEqualTo(15.0);
        assertThat(result.getTemperatureFahrenheit()).isEqualTo(59.0);
        assertThat(result.getDescription()).isEqualTo("Light rain");
        assertThat(result.getHumidity()).isEqualTo(72);
        assertThat(result.getWindSpeed()).isEqualTo(4.1);
    }

    @Test
    void getWeather_unknownCity_throwsLocationNotFoundException() {
        // Arrange
        when(restTemplate.getForEntity(anyString(), eq(com.fasterxml.jackson.databind.JsonNode.class)))
                .thenThrow(HttpClientErrorException.create(
                        HttpStatus.NOT_FOUND, "Not Found", null, null, null));

        // Act & Assert
        assertThatThrownBy(() -> weatherService.getWeather("UnknownXYZ"))
                .isInstanceOf(LocationNotFoundException.class)
                .hasMessageContaining("UnknownXYZ");
    }

    @Test
    void getWeather_blankLocation_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> weatherService.getWeather("  "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("blank");
    }

    @Test
    void getWeather_nullLocation_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> weatherService.getWeather(null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void getWeather_apiReturnsUnauthorized_throwsWeatherApiException() {
        when(restTemplate.getForEntity(anyString(), eq(com.fasterxml.jackson.databind.JsonNode.class)))
                .thenThrow(HttpClientErrorException.create(
                        HttpStatus.UNAUTHORIZED, "Unauthorized", null, null, null));

        assertThatThrownBy(() -> weatherService.getWeather("London"))
                .isInstanceOf(WeatherApiException.class)
                .hasMessageContaining("Invalid API key");
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private ObjectNode buildMockApiResponse(String city, String country,
                                             double temp, int humidity,
                                             String description, double windSpeed) {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("name", city);

        ObjectNode sys = objectMapper.createObjectNode();
        sys.put("country", country);
        root.set("sys", sys);

        ObjectNode main = objectMapper.createObjectNode();
        main.put("temp", temp);
        main.put("humidity", humidity);
        root.set("main", main);

        ObjectNode weatherEntry = objectMapper.createObjectNode();
        weatherEntry.put("description", description);
        root.putArray("weather").add(weatherEntry);

        ObjectNode wind = objectMapper.createObjectNode();
        wind.put("speed", windSpeed);
        root.set("wind", wind);

        return root;
    }
}