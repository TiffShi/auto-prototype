package com.banking.model;

/**
 * DTO for balance-related API responses.
 */
public class BalanceResponse {

    private double balance;
    private String message;

    public BalanceResponse() {
    }

    public BalanceResponse(double balance, String message) {
        this.balance = balance;
        this.message = message;
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}