package com.banking.model;

/**
 * Represents the in-memory bank account holding the current balance.
 */
public class Account {

    private double balance;

    public Account() {
        this.balance = 0.00;
    }

    public Account(double initialBalance) {
        this.balance = initialBalance;
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }

    public void deposit(double amount) {
        this.balance += amount;
    }

    public void withdraw(double amount) {
        this.balance -= amount;
    }
}