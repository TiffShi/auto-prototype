package com.bankingapp.service;

import com.bankingapp.model.Account;
import com.bankingapp.model.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * AccountService is a singleton Spring service that manages
 * the in-memory Account state. All business logic for
 * deposits, withdrawals, and validation lives here.
 */
@Service
public class AccountService {

    private static final Logger logger = LoggerFactory.getLogger(AccountService.class);

    // Single in-memory account instance — resets on server restart
    private final Account account;

    public AccountService() {
        this.account = new Account();
        logger.info("AccountService initialized. Starting balance: $0.00");
    }

    /**
     * Returns the current account balance.
     */
    public double getBalance() {
        return account.getBalance();
    }

    /**
     * Deposits the given amount into the account.
     *
     * @param amount the amount to deposit (must be > 0)
     * @return the updated balance after deposit
     * @throws IllegalArgumentException if amount is invalid
     */
    public synchronized double deposit(double amount) {
        validateAmount(amount);

        double newBalance = account.getBalance() + amount;
        account.setBalance(newBalance);

        Transaction transaction = new Transaction(
                Transaction.Type.DEPOSIT,
                amount,
                newBalance
        );
        account.addTransaction(transaction);

        logger.debug("Deposit: +${} | New Balance: ${}", amount, newBalance);
        return newBalance;
    }

    /**
     * Withdraws the given amount from the account.
     *
     * @param amount the amount to withdraw (must be > 0 and <= balance)
     * @return the updated balance after withdrawal
     * @throws IllegalArgumentException if amount is invalid or causes overdraft
     */
    public synchronized double withdraw(double amount) {
        validateAmount(amount);

        if (amount > account.getBalance()) {
            logger.warn("Withdrawal rejected: amount ${} exceeds balance ${}", amount, account.getBalance());
            throw new IllegalArgumentException(
                    String.format("Insufficient funds. Current balance is $%.2f.", account.getBalance())
            );
        }

        double newBalance = account.getBalance() - amount;
        account.setBalance(newBalance);

        Transaction transaction = new Transaction(
                Transaction.Type.WITHDRAWAL,
                amount,
                newBalance
        );
        account.addTransaction(transaction);

        logger.debug("Withdrawal: -${} | New Balance: ${}", amount, newBalance);
        return newBalance;
    }

    /**
     * Returns an unmodifiable list of all past transactions.
     */
    public List<Transaction> getTransactions() {
        return account.getTransactions();
    }

    /**
     * Validates that the given amount is a positive number greater than zero.
     *
     * @param amount the amount to validate
     * @throws IllegalArgumentException if the amount is invalid
     */
    private void validateAmount(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be a positive number greater than zero.");
        }
        if (Double.isNaN(amount) || Double.isInfinite(amount)) {
            throw new IllegalArgumentException("Amount must be a valid number.");
        }
    }
}