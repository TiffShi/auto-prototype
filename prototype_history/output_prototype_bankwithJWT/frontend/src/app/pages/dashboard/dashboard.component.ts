import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';
import { Transaction } from '../../models/transaction.model';
import { User } from '../../models/user.model';

type ActiveTab = 'deposit' | 'withdraw';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  balance: number = 0;
  transactions: Transaction[] = [];

  isLoadingBalance = true;
  isLoadingTransactions = true;
  isSubmitting = false;

  activeTab: ActiveTab = 'deposit';
  transactionForm!: FormGroup;

  successMessage = '';
  errorMessage = '';

  constructor(
    private accountService: AccountService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    this.transactionForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
    });

    this.loadBalance();
    this.loadTransactions();
  }

  get amount() {
    return this.transactionForm.get('amount');
  }

  setActiveTab(tab: ActiveTab): void {
    this.activeTab = tab;
    this.transactionForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
  }

  loadBalance(): void {
    this.isLoadingBalance = true;
    this.accountService.getBalance().subscribe({
      next: (res) => {
        this.balance = res.balance;
        this.isLoadingBalance = false;
      },
      error: () => {
        this.isLoadingBalance = false;
      }
    });
  }

  loadTransactions(): void {
    this.isLoadingTransactions = true;
    this.accountService.getTransactions().subscribe({
      next: (res) => {
        this.transactions = res.transactions;
        this.isLoadingTransactions = false;
      },
      error: () => {
        this.isLoadingTransactions = false;
      }
    });
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    const amount = parseFloat(this.transactionForm.value.amount);
    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const request$ =
      this.activeTab === 'deposit'
        ? this.accountService.deposit(amount)
        : this.accountService.withdraw(amount);

    request$.subscribe({
      next: (res) => {
        this.balance = res.balance;
        this.successMessage = res.message;
        this.transactionForm.reset();
        this.isSubmitting = false;
        this.loadTransactions();
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Transaction failed. Please try again.';
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  }

  formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateStr));
  }
}