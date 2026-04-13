package com.weatherapp.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Standardised error payload returned to the frontend
 * whenever the backend encounters a handled exception.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    /** Short machine-readable error code, e.g. "LOCATION_NOT_FOUND" */
    private String errorCode;

    /** Human-readable message safe to display in the UI */
    private String message;

    /** UTC timestamp of when the error occurred */
    private LocalDateTime timestamp;

    public static ErrorResponse of(String errorCode, String message) {
        return new ErrorResponse(errorCode, message, LocalDateTime.now());
    }
}