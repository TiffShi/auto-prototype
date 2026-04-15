package com.primevisualizer.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SieveServiceTest {

    private SieveService sieveService;

    @BeforeEach
    void setUp() {
        sieveService = new SieveService();
    }

    @Test
    @DisplayName("Primes up to 10 should be [2, 3, 5, 7]")
    void primesUpTo10() {
        List<Integer> primes = sieveService.findPrimes(10);
        assertThat(primes).containsExactly(2, 3, 5, 7);
    }

    @Test
    @DisplayName("Primes up to 2 should be [2]")
    void primesUpTo2() {
        List<Integer> primes = sieveService.findPrimes(2);
        assertThat(primes).containsExactly(2);
    }

    @Test
    @DisplayName("Primes up to 100 should contain 25 primes")
    void primesUpTo100Count() {
        List<Integer> primes = sieveService.findPrimes(100);
        assertThat(primes).hasSize(25);
        assertThat(primes).startsWith(2, 3, 5, 7, 11);
        assertThat(primes).endsWith(89, 97);
    }

    @Test
    @DisplayName("Primes up to 1,000,000 should contain 78,498 primes")
    void primesUpToOneMillion() {
        List<Integer> primes = sieveService.findPrimes(1_000_000);
        assertThat(primes).hasSize(78_498);
    }

    @Test
    @DisplayName("Result list should be in ascending order")
    void primesAreOrdered() {
        List<Integer> primes = sieveService.findPrimes(50);
        for (int i = 0; i < primes.size() - 1; i++) {
            assertThat(primes.get(i)).isLessThan(primes.get(i + 1));
        }
    }

    @Test
    @DisplayName("1 should never appear in the primes list")
    void oneIsNotPrime() {
        List<Integer> primes = sieveService.findPrimes(10);
        assertThat(primes).doesNotContain(1);
    }

    @ParameterizedTest
    @ValueSource(ints = {-1, 0, 1, 1_000_001, Integer.MAX_VALUE})
    @DisplayName("Invalid limits should throw IllegalArgumentException")
    void invalidLimitsThrow(int invalidLimit) {
        assertThatThrownBy(() -> sieveService.findPrimes(invalidLimit))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Limit must be a positive integer between 2 and 1,000,000");
    }

    @Test
    @DisplayName("Composite numbers should not appear in primes list")
    void compositeNumbersExcluded() {
        List<Integer> primes = sieveService.findPrimes(30);
        // Known composites in range
        assertThat(primes).doesNotContain(4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28);
    }
}