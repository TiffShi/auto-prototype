export type TransactionType = 'deposit' | 'withdrawal';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  createdAt: string;
}

export interface BalanceResponse {
  balance: number;
}

export interface TransactionResponse {
  message: string;
  balance: number;
  transaction: Transaction;
}

export interface TransactionsListResponse {
  transactions: Transaction[];
}