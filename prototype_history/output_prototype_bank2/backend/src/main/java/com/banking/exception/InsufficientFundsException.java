package com.banking.exception;

/**
 * Thrown when a withdrawal amount exceeds the current account balance.
 */
public class InsufficientFundsException extends RuntimeException {

    private final double requestedAmount;
    private final double availableBalance;

    public InsufficientFundsException(double requestedAmount, double availableBalance) {
        super(String.format(
                "Insufficient funds: requested %.2f but available balance is %.2f",
                requestedAmount,
                availableBalance
        ));
        this.requestedAmount = requestedAmount;
        this.availableBalance = availableBalance;
    }

    public double getRequestedAmount() {
        return requestedAmount;
    }

    public double getAvailableBalance() {
        return availableBalance;
    }
}