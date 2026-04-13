package com.weatherapp;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "openweathermap.api.key=test-key",
        "openweathermap.api.base-url=https://api.openweathermap.org/data/2.5/weather"
})
class WeatherAppApplicationTests {

    @Test
    void contextLoads() {
        // Verifies the Spring application context starts without errors
    }
}