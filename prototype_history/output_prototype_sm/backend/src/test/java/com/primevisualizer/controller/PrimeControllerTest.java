package com.primevisualizer.controller;

import com.primevisualizer.service.SieveService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PrimeController.class)
class PrimeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SieveService sieveService;

    @Test
    @DisplayName("GET /api/primes?limit=10 returns 200 with correct JSON structure")
    void getPrimesSuccess() throws Exception {
        when(sieveService.findPrimes(10)).thenReturn(List.of(2, 3, 5, 7));

        mockMvc.perform(get("/api/primes")
                        .param("limit", "10")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.limit").value(10))
                .andExpect(jsonPath("$.count").value(4))
                .andExpect(jsonPath("$.primes[0]").value(2))
                .andExpect(jsonPath("$.primes[1]").value(3))
                .andExpect(jsonPath("$.primes[2]").value(5))
                .andExpect(jsonPath("$.primes[3]").value(7));
    }

    @Test
    @DisplayName("GET /api/primes?limit=1 returns 400 with error message")
    void getPrimesInvalidLimitTooLow() throws Exception {
        when(sieveService.findPrimes(1))
                .thenThrow(new IllegalArgumentException(
                        "Limit must be a positive integer between 2 and 1,000,000"));

        mockMvc.perform(get("/api/primes")
                        .param("limit", "1")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(
                        "Limit must be a positive integer between 2 and 1,000,000"));
    }

    @Test
    @DisplayName("GET /api/primes?limit=abc returns 400 for non-integer input")
    void getPrimesNonIntegerLimit() throws Exception {
        mockMvc.perform(get("/api/primes")
                        .param("limit", "abc")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @DisplayName("GET /api/primes (no limit param) returns 400 with descriptive error")
    void getPrimesMissingParam() throws Exception {
        mockMvc.perform(get("/api/primes")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @DisplayName("GET /api/primes?limit=2 returns [2] with count 1")
    void getPrimesMinimumLimit() throws Exception {
        when(sieveService.findPrimes(2)).thenReturn(List.of(2));

        mockMvc.perform(get("/api/primes")
                        .param("limit", "2")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.limit").value(2))
                .andExpect(jsonPath("$.count").value(1))
                .andExpect(jsonPath("$.primes[0]").value(2));
    }
}