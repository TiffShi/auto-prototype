import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  BalanceResponse,
  TransactionResponse,
  TransactionsListResponse
} from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBalance(): Observable<BalanceResponse> {
    return this.http.get<BalanceResponse>(`${this.apiUrl}/api/account/balance`);
  }

  deposit(amount: number): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.apiUrl}/api/account/deposit`, { amount });
  }

  withdraw(amount: number): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.apiUrl}/api/account/withdraw`, { amount });
  }

  getTransactions(): Observable<TransactionsListResponse> {
    return this.http.get<TransactionsListResponse>(`${this.apiUrl}/api/account/transactions`);
  }
}