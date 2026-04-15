package com.primevisualizer.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    private static final String FRONTEND_ORIGIN = "http://localhost:5173";

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();

        // Explicitly whitelist the frontend origin — no wildcards
        corsConfiguration.setAllowedOrigins(List.of(FRONTEND_ORIGIN));

        // Allow standard HTTP methods used by this API
        corsConfiguration.setAllowedMethods(List.of("GET", "OPTIONS"));

        // Allow all headers the browser may send
        corsConfiguration.setAllowedHeaders(List.of(
                "Origin",
                "Content-Type",
                "Accept",
                "Authorization",
                "X-Requested-With"
        ));

        // Expose headers the frontend may need to read
        corsConfiguration.setExposedHeaders(List.of("Content-Type"));

        // Allow credentials if needed in the future
        corsConfiguration.setAllowCredentials(true);

        // Cache preflight response for 1 hour (3600 seconds)
        corsConfiguration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply CORS config to all API endpoints
        source.registerCorsConfiguration("/api/**", corsConfiguration);

        return new CorsFilter(source);
    }
}