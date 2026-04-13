package com.weatherapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class WeatherAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(WeatherAppApplication.class, args);
    }

    /**
     * Registers RestTemplate as a Spring-managed bean so it can be
     * injected wherever HTTP calls to OpenWeatherMap are needed.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}