package com.primevisualizer.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Service that implements the Sieve of Eratosthenes algorithm.
 *
 * Time complexity:  O(n log log n)
 * Space complexity: O(n)
 *
 * The sieve works by:
 *   1. Creating a boolean array `isComposite` of size (limit + 1), all initialised to false.
 *   2. Starting from p = 2, marking every multiple of p (starting at p²) as composite.
 *   3. Repeating for the next unmarked number until p² > limit.
 *   4. Collecting all indices still marked false (i.e., prime) into the result list.
 */
@Service
public class SieveService {

    private static final int MIN_LIMIT = 2;
    private static final int MAX_LIMIT = 1_000_000;

    /**
     * Validates the limit and runs the sieve.
     *
     * @param limit upper bound (inclusive) for prime search
     * @return ordered list of all prime numbers in [2, limit]
     * @throws IllegalArgumentException if limit is outside the valid range
     */
    public List<Integer> findPrimes(int limit) {
        validateLimit(limit);
        return runSieve(limit);
    }

    /**
     * Pure sieve implementation — no validation side-effects.
     */
    private List<Integer> runSieve(int limit) {
        // isComposite[i] == true  →  i is NOT prime
        // isComposite[i] == false →  i IS prime (for i >= 2)
        boolean[] isComposite = new boolean[limit + 1];

        // 0 and 1 are not prime
        isComposite[0] = true;
        isComposite[1] = true;

        // Sieve: for each prime p, mark multiples starting at p*p
        for (int p = 2; (long) p * p <= limit; p++) {
            if (!isComposite[p]) {
                // Start at p*p because smaller multiples were already marked
                // by earlier primes. Use long arithmetic to avoid int overflow.
                for (long multiple = (long) p * p; multiple <= limit; multiple += p) {
                    isComposite[(int) multiple] = true;
                }
            }
        }

        // Collect all primes into a result list
        List<Integer> primes = new ArrayList<>();
        for (int i = 2; i <= limit; i++) {
            if (!isComposite[i]) {
                primes.add(i);
            }
        }

        return primes;
    }

    /**
     * Validates that the provided limit is within the acceptable range.
     *
     * @throws IllegalArgumentException with a descriptive message on failure
     */
    private void validateLimit(int limit) {
        if (limit < MIN_LIMIT || limit > MAX_LIMIT) {
            throw new IllegalArgumentException(
                    "Limit must be a positive integer between 2 and 1,000,000"
            );
        }
    }

    public int getMinLimit() {
        return MIN_LIMIT;
    }

    public int getMaxLimit() {
        return MAX_LIMIT;
    }
}