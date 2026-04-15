package com.primevisualizer.model;

import java.util.List;

/**
 * Response DTO returned by GET /api/primes.
 * Contains the original limit, the list of discovered prime numbers, and their count.
 */
public class PrimeResponse {

    private final int limit;
    private final List<Integer> primes;
    private final int count;

    public PrimeResponse(int limit, List<Integer> primes) {
        this.limit = limit;
        this.primes = List.copyOf(primes); // defensive immutable copy
        this.count = primes.size();
    }

    public int getLimit() {
        return limit;
    }

    public List<Integer> getPrimes() {
        return primes;
    }

    public int getCount() {
        return count;
    }
}