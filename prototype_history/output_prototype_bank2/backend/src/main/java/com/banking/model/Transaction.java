package com.banking.model;

import java.time.LocalDateTime;

/**
 * Represents a single transaction record (deposit or withdrawal).
 */
public class Transaction {

    public enum TransactionType {
        DEPOSIT,
        WITHDRAWAL
    }

    private final long id;
    private final TransactionType type;
    private final double amount;
    private final LocalDateTime timestamp;

    public Transaction(long id, TransactionType type, double amount, LocalDateTime timestamp) {
        this.id = id;
        this.type = type;
        this.amount = amount;
        this.timestamp = timestamp;
    }

    public long getId() {
        return id;
    }

    public TransactionType getType() {
        return type;
    }

    public double getAmount() {
        return amount;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}