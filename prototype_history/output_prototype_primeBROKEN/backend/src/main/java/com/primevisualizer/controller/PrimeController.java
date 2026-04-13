package com.primevisualizer.controller;

import com.primevisualizer.model.ErrorResponse;
import com.primevisualizer.model.PrimeResponse;
import com.primevisualizer.service.SieveService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PrimeController {

    private final SieveService sieveService;

    public PrimeController(SieveService sieveService) {
        this.sieveService = sieveService;
    }

    /**
     * GET /api/primes?limit={n}
     * Returns all prime numbers from 2 up to and including the given limit.
     *
     * @param limit the upper bound for prime computation (must be between 2 and 1,000,000)
     * @return 200 OK with PrimeResponse, or 400 Bad Request with ErrorResponse
     */
    @GetMapping("/primes")
    public ResponseEntity<?> getPrimes(@RequestParam(name = "limit") int limit) {
        List<Integer> primes = sieveService.computePrimes(limit);
        PrimeResponse response = new PrimeResponse(limit, primes);
        return ResponseEntity.ok(response);
    }

    /**
     * Handles IllegalArgumentException thrown by SieveService for invalid limit values.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Handles type mismatch when the limit parameter cannot be parsed as an integer
     * (e.g., non-numeric strings, decimals).
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                "Limit must be a positive integer between 2 and 1,000,000"
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Handles missing required request parameter.
     */
    @ExceptionHandler(org.springframework.web.bind.MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParam(
            org.springframework.web.bind.MissingServletRequestParameterException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                "Query parameter 'limit' is required"
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }
}