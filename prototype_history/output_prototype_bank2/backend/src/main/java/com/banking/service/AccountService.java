package com.banking.service;

import com.banking.exception.InsufficientFundsException;
import com.banking.exception.InvalidAmountException;
import com.banking.model.Account;
import com.banking.model.Transaction;
import com.banking.model.Transaction.TransactionType;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Singleton service holding all in-memory account state.
 * Manages balance and transaction history with thread-safe operations.
 */
@Service
public class AccountService {

    private final Account account;
    private final List<Transaction> transactions;
    private final AtomicLong transactionIdCounter;

    public AccountService() {
        this.account = new Account(0.00);
        this.transactions = new ArrayList<>();
        this.transactionIdCounter = new AtomicLong(1);
    }

    /**
     * Returns the current account balance.
     */
    public synchronized double getBalance() {
        return account.getBalance();
    }

    /**
     * Deposits the given amount into the account.
     *
     * @param amount the amount to deposit (must be > 0)
     * @return the updated balance after deposit
     * @throws InvalidAmountException if amount is zero or negative
     */
    public synchronized double deposit(double amount) {
        validateAmount(amount);

        account.deposit(amount);

        Transaction transaction = new Transaction(
                transactionIdCounter.getAndIncrement(),
                TransactionType.DEPOSIT,
                amount,
                LocalDateTime.now()
        );
        transactions.add(transaction);

        return account.getBalance();
    }

    /**
     * Withdraws the given amount from the account.
     *
     * @param amount the amount to withdraw (must be > 0 and <= balance)
     * @return the updated balance after withdrawal
     * @throws InvalidAmountException      if amount is zero or negative
     * @throws InsufficientFundsException  if amount exceeds current balance
     */
    public synchronized double withdraw(double amount) {
        validateAmount(amount);

        double currentBalance = account.getBalance();
        if (amount > currentBalance) {
            throw new InsufficientFundsException(amount, currentBalance);
        }

        account.withdraw(amount);

        Transaction transaction = new Transaction(
                transactionIdCounter.getAndIncrement(),
                TransactionType.WITHDRAWAL,
                amount,
                LocalDateTime.now()
        );
        transactions.add(transaction);

        return account.getBalance();
    }

    /**
     * Returns an unmodifiable view of the transaction history,
     * ordered from most recent to oldest.
     */
    public synchronized List<Transaction> getTransactions() {
        List<Transaction> copy = new ArrayList<>(transactions);
        Collections.reverse(copy);
        return Collections.unmodifiableList(copy);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private void validateAmount(double amount) {
        if (amount <= 0) {
            throw new InvalidAmountException(amount);
        }
    }
}