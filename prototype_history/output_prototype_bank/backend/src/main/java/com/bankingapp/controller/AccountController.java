package com.bankingapp.controller;

import com.bankingapp.model.Transaction;
import com.bankingapp.service.AccountService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller exposing banking API endpoints.
 *
 * Base URL: http://localhost:8080/api/account
 *
 * Endpoints:
 *   GET  /api/account/balance       — Get current balance
 *   POST /api/account/deposit       — Deposit cash
 *   POST /api/account/withdraw      — Withdraw cash
 *   GET  /api/account/transactions  — Get transaction history
 */
@RestController
@RequestMapping("/api/account")
public class AccountController {

    private static final Logger logger = LoggerFactory.getLogger(AccountController.class);

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    /**
     * GET /api/account/balance
     * Returns the current account balance.
     *
     * Response: { "balance": 100.00 }
     */
    @GetMapping("/balance")
    public ResponseEntity<Map<String, Object>> getBalance() {
        logger.debug("GET /api/account/balance");
        Map<String, Object> response = new HashMap<>();
        response.put("balance", accountService.getBalance());
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/account/deposit
     * Deposits the specified amount into the account.
     *
     * Request Body: { "amount": 50.00 }
     * Response:     { "balance": 150.00, "message": "Deposit successful." }
     */
    @PostMapping("/deposit")
    public ResponseEntity<Map<String, Object>> deposit(@Valid @RequestBody AmountRequest request) {
        logger.debug("POST /api/account/deposit | amount: {}", request.getAmount());
        try {
            double newBalance = accountService.deposit(request.getAmount());
            Map<String, Object> response = new HashMap<>();
            response.put("balance", newBalance);
            response.put("message", String.format("Successfully deposited $%.2f.", request.getAmount()));
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return buildErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * POST /api/account/withdraw
     * Withdraws the specified amount from the account.
     *
     * Request Body: { "amount": 30.00 }
     * Response:     { "balance": 120.00, "message": "Withdrawal successful." }
     */
    @PostMapping("/withdraw")
    public ResponseEntity<Map<String, Object>> withdraw(@Valid @RequestBody AmountRequest request) {
        logger.debug("POST /api/account/withdraw | amount: {}", request.getAmount());
        try {
            double newBalance = accountService.withdraw(request.getAmount());
            Map<String, Object> response = new HashMap<>();
            response.put("balance", newBalance);
            response.put("message", String.format("Successfully withdrew $%.2f.", request.getAmount()));
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return buildErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * GET /api/account/transactions
     * Returns the full transaction history.
     *
     * Response: [ { "type": "DEPOSIT", "amount": 50.00, "timestamp": "...", "balanceAfter": 50.00 }, ... ]
     */
    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactions() {
        logger.debug("GET /api/account/transactions");
        return ResponseEntity.ok(accountService.getTransactions());
    }

    /**
     * Builds a standardized error response body.
     */
    private ResponseEntity<Map<String, Object>> buildErrorResponse(String message, HttpStatus status) {
        Map<String, Object> error = new HashMap<>();
        error.put("balance", accountService.getBalance());
        error.put("message", message);
        return ResponseEntity.status(status).body(error);
    }

    // -----------------------------------------------
    // Inner DTO class for deposit/withdraw requests
    // -----------------------------------------------

    /**
     * Request body DTO for deposit and withdrawal operations.
     */
    public static class AmountRequest {

        @NotNull(message = "Amount must not be null.")
        @Positive(message = "Amount must be a positive number greater than zero.")
        private Double amount;

        public AmountRequest() {}

        public AmountRequest(Double amount) {
            this.amount = amount;
        }

        public Double getAmount() {
            return amount;
        }

        public void setAmount(Double amount) {
            this.amount = amount;
        }
    }
}