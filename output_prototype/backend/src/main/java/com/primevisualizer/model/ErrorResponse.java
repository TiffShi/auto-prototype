package com.primevisualizer.model;

/**
 * Error DTO returned on 400 Bad Request responses.
 */
public class ErrorResponse {

    private final String error;

    public ErrorResponse(String error) {
        this.error = error;
    }

    public String getError() {
        return error;
    }
}