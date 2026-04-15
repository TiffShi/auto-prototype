package com.weatherapp.controller;

import com.weatherapp.exception.GlobalExceptionHandler;
import com.weatherapp.exception.LocationNotFoundException;
import com.weatherapp.model.WeatherResponse;
import com.weatherapp.service.WeatherService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(WeatherController.class)
@Import(GlobalExceptionHandler.class)
class WeatherControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WeatherService weatherService;

    @Test
    void getWeather_validLocation_returns200WithJson() throws Exception {
        WeatherResponse mockResponse = WeatherResponse.builder()
                .location("London")
                .country("GB")
                .temperatureCelsius(15.3)
                .temperatureFahrenheit(59.5)
                .description("Light Rain")
                .humidity(72)
                .windSpeed(4.1)
                .build();

        when(weatherService.getWeather("London")).thenReturn(mockResponse);

        mockMvc.perform(get("/api/weather")
                        .param("location", "London")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.location").value("London"))
                .andExpect(jsonPath("$.country").value("GB"))
                .andExpect(jsonPath("$.temperatureCelsius").value(15.3))
                .andExpect(jsonPath("$.temperatureFahrenheit").value(59.5))
                .andExpect(jsonPath("$.description").value("Light Rain"))
                .andExpect(jsonPath("$.humidity").value(72))
                .andExpect(jsonPath("$.windSpeed").value(4.1));
    }

    @Test
    void getWeather_unknownLocation_returns404() throws Exception {
        when(weatherService.getWeather("Atlantis"))
                .thenThrow(new LocationNotFoundException("Atlantis"));

        mockMvc.perform(get("/api/weather")
                        .param("location", "Atlantis")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("LOCATION_NOT_FOUND"));
    }

    @Test
    void getWeather_missingLocationParam_returns400() throws Exception {
        mockMvc.perform(get("/api/weather")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("MISSING_PARAMETER"));
    }
}