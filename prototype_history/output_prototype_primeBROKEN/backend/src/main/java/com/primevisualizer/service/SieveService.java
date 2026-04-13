package com.primevisualizer.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SieveService {

    private static final int MIN_LIMIT = 2;
    private static final int MAX_LIMIT = 1_000_000;

    /**
     * Computes all prime numbers up to and including the given limit
     * using the Sieve of Eratosthenes algorithm.
     *
     * @param limit the upper bound (inclusive) for prime computation
     * @return a list of all prime numbers from 2 to limit
     * @throws IllegalArgumentException if limit is outside the valid range [2, 1_000_000]
     */
    public List<Integer> computePrimes(int limit) {
        validateLimit(limit);

        // Boolean array where index represents the number.
        // true  = composite (not prime)
        // false = prime (initially all assumed prime)
        boolean[] isComposite = new boolean[limit + 1];

        // 0 and 1 are not prime
        isComposite[0] = true;
        isComposite[1] = true;

        // Classic Sieve of Eratosthenes
        for (int i = 2; (long) i * i <= limit; i++) {
            if (!isComposite[i]) {
                // Mark all multiples of i starting from i*i as composite
                for (int j = i * i; j <= limit; j += i) {
                    isComposite[j] = true;
                }
            }
        }

        // Collect all primes
        List<Integer> primes = new ArrayList<>();
        for (int i = 2; i <= limit; i++) {
            if (!isComposite[i]) {
                primes.add(i);
            }
        }

        return primes;
    }

    private void validateLimit(int limit) {
        if (limit < MIN_LIMIT || limit > MAX_LIMIT) {
            throw new IllegalArgumentException(
                    "Limit must be a positive integer between 2 and 1,000,000"
            );
        }
    }
}