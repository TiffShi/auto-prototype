<template>
  <div class="history-card">
    <!-- Header -->
    <div class="history-header">
      <div class="history-title-group">
        <span class="history-icon">📋</span>
        <div>
          <h2 class="history-title">Transaction History</h2>
          <p class="history-subtitle">
            {{ transactions.length }} transaction{{ transactions.length !== 1 ? 's' : '' }} recorded
          </p>
        </div>
      </div>
      <button
        class="refresh-btn"
        :disabled="loading"
        @click="$emit('refresh')"
        title="Refresh transactions"
      >
        <span :class="['refresh-icon', { 'refresh-icon--spinning': loading }]">↻</span>
        <span>Refresh</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && transactions.length === 0" class="history-loading">
      <div class="skeleton-row" v-for="i in 3" :key="i">
        <div class="skeleton-circle"></div>
        <div class="skeleton-lines">
          <div class="skeleton-bar skeleton-bar--md"></div>
          <div class="skeleton-bar skeleton-bar--sm"></div>
        </div>
        <div class="skeleton-bar skeleton-bar--amount"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && transactions.length === 0" class="history-empty">
      <div class="empty-illustration">💳</div>
      <h3 class="empty-title">No transactions yet</h3>
      <p class="empty-text">Make your first deposit or withdrawal to see your history here.</p>
    </div>

    <!-- Transaction List -->
    <div v-else class="history-list">
      <transition-group name="list" tag="div" class="list-inner">
        <div
          v-for="(tx, index) in sortedTransactions"
          :key="`${tx.timestamp}-${index}`"
          :class="['tx-row', `tx-row--${tx.type.toLowerCase()}`]"
        >
          <!-- Type Icon -->
          <div :class="['tx-icon', `tx-icon--${tx.type.toLowerCase()}`]">
            <span>{{ tx.type === 'DEPOSIT' ? '↑' : '↓' }}</span>
          </div>

          <!-- Details -->
          <div class="tx-details">
            <div class="tx-type">
              {{ tx.type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal' }}
            </div>
            <div class="tx-timestamp">{{ tx.timestamp }}</div>
          </div>

          <!-- Amounts -->
          <div class="tx-amounts">
            <div :class="['tx-amount', `tx-amount--${tx.type.toLowerCase()}`]">
              {{ tx.type === 'DEPOSIT' ? '+' : '-' }}${{ formatAmount(tx.amount) }}
            </div>
            <div class="tx-balance-after">
              Balance: ${{ formatAmount(tx.balanceAfter) }}
            </div>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Summary Footer -->
    <div v-if="transactions.length > 0" class="history-summary">
      <div class="summary-item">
        <span class="summary-dot summary-dot--deposit"></span>
        <span class="summary-label">Total Deposited:</span>
        <span class="summary-value summary-value--deposit">${{ formatAmount(totalDeposited) }}</span>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-item">
        <span class="summary-dot summary-dot--withdraw"></span>
        <span class="summary-label">Total Withdrawn:</span>
        <span class="summary-value summary-value--withdraw">${{ formatAmount(totalWithdrawn) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  transactions: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['refresh'])

const sortedTransactions = computed(() => {
  return [...props.transactions].reverse()
})

const totalDeposited = computed(() => {
  return props.transactions
    .filter(tx => tx.type === 'DEPOSIT')
    .reduce((sum, tx) => sum + tx.amount, 0)
})

const totalWithdrawn = computed(() => {
  return props.transactions
    .filter(tx => tx.type === 'WITHDRAWAL')
    .reduce((sum, tx) => sum + tx.amount, 0)
})

const formatAmount = (amount) => {
  return Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
</script>

<style scoped>
.history-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

/* ── Header ── */
.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
  gap: 12px;
}

.history-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.history-icon {
  font-size: 1.4rem;
}

.history-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.history-subtitle {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  margin: 2px 0 0;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: #f8fafc;
  color: var(--color-text-muted);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  font-family: inherit;
}

.refresh-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-icon {
  font-size: 1rem;
  display: inline-block;
  transition: transform 0.3s ease;
}

.refresh-icon--spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Loading Skeleton ── */
.history-loading {
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.skeleton-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e2e8f0;
  flex-shrink: 0;
  animation: shimmer 1.4s ease-in-out infinite;
}

.skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.skeleton-bar {
  background: #e2e8f0;
  border-radius: 4px;
  animation: shimmer 1.4s ease-in-out infinite;
}

.skeleton-bar--md {
  height: 14px;
  width: 60%;
}

.skeleton-bar--sm {
  height: 11px;
  width: 40%;
}

.skeleton-bar--amount {
  height: 20px;
  width: 80px;
  flex-shrink: 0;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* ── Empty State ── */
.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 52px 24px;
  text-align: center;
}

.empty-illustration {
  font-size: 3rem;
  margin-bottom: 14px;
  opacity: 0.5;
}

.empty-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 6px;
}

.empty-text {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  max-width: 300px;
  line-height: 1.6;
}

/* ── Transaction List ── */
.history-list {
  max-height: 420px;
  overflow-y: auto;
}

.list-inner {
  padding: 8px 0;
}

.tx-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 24px;
  border-bottom: 1px solid #f1f5f9;
  transition: background var(--transition);
}

.tx-row:last-child {
  border-bottom: none;
}

.tx-row:hover {
  background: #f8fafc;
}

.tx-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  flex-shrink: 0;
}

.tx-icon--deposit {
  background: var(--color-success-light);
  color: var(--color-deposit);
}

.tx-icon--withdrawal {
  background: var(--color-danger-light);
  color: var(--color-withdraw);
}

.tx-details {
  flex: 1;
  min-width: 0;
}

.tx-type {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
}

.tx-timestamp {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.tx-amounts {
  text-align: right;
  flex-shrink: 0;
}

.tx-amount {
  font-size: 0.95rem;
  font-weight: 700;
}

.tx-amount--deposit {
  color: var(--color-deposit);
}

.tx-amount--withdrawal {
  color: var(--color-withdraw);
}

.tx-balance-after {
  font-size: 0.73rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}

/* ── Summary Footer ── */
.history-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 14px 24px;
  border-top: 1px solid var(--color-border);
  background: #f8fafc;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.82rem;
}

.summary-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.summary-dot--deposit {
  background: var(--color-deposit);
}

.summary-dot--withdraw {
  background: var(--color-withdraw);
}

.summary-label {
  color: var(--color-text-muted);
  font-weight: 500;
}

.summary-value {
  font-weight: 700;
}

.summary-value--deposit {
  color: var(--color-deposit);
}

.summary-value--withdraw {
  color: var(--color-withdraw);
}

.summary-divider {
  width: 1px;
  height: 20px;
  background: var(--color-border);
}

/* ── List Transitions ── */
.list-enter-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-12px);
}

@media (max-width: 480px) {
  .tx-row {
    padding: 12px 16px;
  }

  .history-header {
    padding: 16px;
  }

  .history-summary {
    flex-direction: column;
    gap: 8px;
  }

  .summary-divider {
    width: 60px;
    height: 1px;
  }
}
</style>