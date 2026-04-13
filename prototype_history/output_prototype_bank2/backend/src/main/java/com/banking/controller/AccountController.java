package com.banking.controller;

import com.banking.model.AmountRequest;
import com.banking.model.BalanceResponse;
import com.banking.model.Transaction;
import com.banking.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller exposing all banking API endpoints under /api/account.
 */
@RestController
@RequestMapping("/api/account")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    /**
     * GET /api/account/balance
     * Returns the current account balance.
     */
    @GetMapping("/balance")
    public ResponseEntity<BalanceResponse> getBalance() {
        double balance = accountService.getBalance();
        BalanceResponse response = new BalanceResponse(balance, "Balance retrieved successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/account/deposit
     * Deposits the specified amount and returns the updated balance.
     *
     * Request body: { "amount": 500.00 }
     */
    @PostMapping("/deposit")
    public ResponseEntity<BalanceResponse> deposit(@RequestBody AmountRequest request) {
        double updatedBalance = accountService.deposit(request.getAmount());
        BalanceResponse response = new BalanceResponse(updatedBalance, "Deposit successful");
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/account/withdraw
     * Withdraws the specified amount and returns the updated balance.
     *
     * Request body: { "amount": 200.00 }
     */
    @PostMapping("/withdraw")
    public ResponseEntity<BalanceResponse> withdraw(@RequestBody AmountRequest request) {
        double updatedBalance = accountService.withdraw(request.getAmount());
        BalanceResponse response = new BalanceResponse(updatedBalance, "Withdrawal successful");
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/account/transactions
     * Returns the full transaction history (most recent first).
     */
    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactions() {
        List<Transaction> transactions = accountService.getTransactions();
        return ResponseEntity.ok(transactions);
    }
}