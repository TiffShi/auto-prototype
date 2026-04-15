package com.primevisualizer.model;

import java.util.List;

public class PrimeResponse {

    private int limit;
    private List<Integer> primes;

    public PrimeResponse() {
    }

    public PrimeResponse(int limit, List<Integer> primes) {
        this.limit = limit;
        this.primes = primes;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    public List<Integer> getPrimes() {
        return primes;
    }

    public void setPrimes(List<Integer> primes) {
        this.primes = primes;
    }
}