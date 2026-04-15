package com.bankingapp.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * In-memory account model holding the current balance
 * and a list of all transactions.
 * This object is managed as a singleton via AccountService (@Service).
 * All state resets on server restart.
 */
public class Account {

    private double balance;
    private final List<Transaction> transactions;

    public Account() {
        this.balance = 0.0;
        this.transactions = new ArrayList<>();
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }

    public List<Transaction> getTransactions() {
        return Collections.unmodifiableList(transactions);
    }

    public void addTransaction(Transaction transaction) {
        this.transactions.add(transaction);
    }
}