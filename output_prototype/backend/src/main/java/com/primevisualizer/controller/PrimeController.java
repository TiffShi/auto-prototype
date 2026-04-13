package com.primevisualizer.controller;

import com.primevisualizer.model.ErrorResponse;
import com.primevisualizer.model.PrimeResponse;
import com.primevisualizer.service.SieveService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;

/**
 * REST controller exposing the prime-number computation endpoint.
 *
 * Endpoint: GET /api/primes?limit={number}
 *
 * Validation layers:
 *   1. Type mismatch (non-integer param)  → 400 via @ExceptionHandler
 *   2. Range validation                   → 400 via @ExceptionHandler (IllegalArgumentException)
 */
@RestController
@RequestMapping("/api")
public class PrimeController {

    private final SieveService sieveService;

    public PrimeController(SieveService sieveService) {
        this.sieveService = sieveService;
    }

    /**
     * Computes all prime numbers up to and including {@code limit}.
     *
     * @param limit the upper bound for the sieve (must be between 2 and 1,000,000)
     * @return 200 OK with {@link PrimeResponse}, or 400 Bad Request with {@link ErrorResponse}
     */
    @GetMapping("/primes")
    public ResponseEntity<PrimeResponse> getPrimes(
            @RequestParam(name = "limit") int limit) {

        List<Integer> primes = sieveService.findPrimes(limit);
        PrimeResponse response = new PrimeResponse(limit, primes);
        return ResponseEntity.ok(response);
    }

    // -------------------------------------------------------------------------
    // Exception Handlers (scoped to this controller)
    // -------------------------------------------------------------------------

    /**
     * Handles range-validation failures thrown by {@link SieveService#findPrimes(int)}.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity
                .badRequest()
                .body(new ErrorResponse(ex.getMessage()));
    }

    /**
     * Handles cases where the {@code limit} query parameter cannot be parsed as an integer
     * (e.g., "abc", "3.14", empty string).
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity
                .badRequest()
                .body(new ErrorResponse(
                        "Limit must be a positive integer between 2 and 1,000,000"
                ));
    }

    /**
     * Handles missing {@code limit} query parameter.
     */
    @ExceptionHandler(org.springframework.web.bind.MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParam(
            org.springframework.web.bind.MissingServletRequestParameterException ex) {
        return ResponseEntity
                .badRequest()
                .body(new ErrorResponse(
                        "Query parameter 'limit' is required. Example: /api/primes?limit=100"
                ));
    }
}