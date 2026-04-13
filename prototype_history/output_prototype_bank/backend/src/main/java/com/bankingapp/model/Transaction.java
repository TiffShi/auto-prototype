package com.bankingapp.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Represents a single transaction record (deposit or withdrawal).
 * Stored in-memory as part of the Account's transaction history.
 */
public class Transaction {

    public enum Type {
        DEPOSIT,
        WITHDRAWAL
    }

    private final Type type;
    private final double amount;
    private final String timestamp;
    private final double balanceAfter;

    public Transaction(Type type, double amount, double balanceAfter) {
        this.type = type;
        this.amount = amount;
        this.balanceAfter = balanceAfter;
        this.timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    public Type getType() {
        return type;
    }

    public double getAmount() {
        return amount;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public double getBalanceAfter() {
        return balanceAfter;
    }
}