<template>
  <div class="history-card">
    <div class="history-card__header">
      <div class="history-card__title-group">
        <h3 class="history-card__title">Transaction History</h3>
        <span v-if="!loading" class="history-card__count">
          {{ transactions.length }} record{{ transactions.length !== 1 ? 's' : '' }}
        </span>
      </div>
      <div class="history-card__legend">
        <span class="legend-item legend-item--deposit">
          <span class="legend-dot deposit"></span> Deposit
        </span>
        <span class="legend-item legend-item--withdraw">
          <span class="legend-dot withdraw"></span> Withdrawal
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="history-card__loading">
      <div class="skeleton-row" v-for="i in 3" :key="i">
        <div class="skeleton-icon"></div>
        <div class="skeleton-content">
          <div class="skeleton-bar medium"></div>
          <div class="skeleton-bar short"></div>
        </div>
        <div class="skeleton-bar amount"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="transactions.length === 0" class="history-card__empty">
      <div class="empty-icon">📋</div>
      <p class="empty-title">No transactions yet</p>
      <p class="empty-subtitle">Your deposits and withdrawals will appear here.</p>
    </div>

    <!-- Transaction List -->
    <div v-else class="history-card__list">
      <transition-group name="list" tag="div">
        <div
          v-for="tx in transactions"
          :key="tx.id"
          class="transaction-item"
          :class="tx.type === 'DEPOSIT' ? 'transaction-item--deposit' : 'transaction-item--withdraw'"
        >
          <!-- Icon -->
          <div class="transaction-item__icon">
            <span>{{ tx.type === 'DEPOSIT' ? '↑' : '↓' }}</span>
          </div>

          <!-- Details -->
          <div class="transaction-item__details">
            <span class="transaction-item__type">
              {{ tx.type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal' }}
            </span>
            <span class="transaction-item__time">{{ formatTimestamp(tx.timestamp) }}</span>
          </div>

          <!-- Amount -->
          <div class="transaction-item__amount" :class="tx.type === 'DEPOSIT' ? 'amount--positive' : 'amount--negative'">
            <span class="amount-sign">{{ tx.type === 'DEPOSIT' ? '+' : '-' }}</span>
            <span>${{ formatAmount(tx.amount) }}</span>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  transactions: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const formatAmount = (amount) => {
  return Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const formatTimestamp = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}
</script>

<style scoped>
.history-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.75rem;
  transition: border-color 0.2s;
}

.history-card:hover {
  border-color: rgba(255, 255, 255, 0.12);
}

/* Header */
.history-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.history-card__title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.history-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: #f1f5f9;
}

.history-card__count {
  background: rgba(255, 255, 255, 0.07);
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 500;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
}

.history-card__legend {
  display: flex;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: #475569;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-dot.deposit {
  background: #4ade80;
}

.legend-dot.withdraw {
  background: #f87171;
}

/* Loading Skeleton */
.history-card__loading {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.skeleton-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.skeleton-bar {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 25%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.04) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-bar.medium { width: 55%; }
.skeleton-bar.short { width: 35%; }
.skeleton-bar.amount { width: 70px; flex-shrink: 0; }

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Empty State */
.history-card__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 0.4rem;
}

.empty-subtitle {
  font-size: 0.8rem;
  color: #334155;
}

/* Transaction List */
.history-card__list {
  display: flex;
  flex-direction: column;
  max-height: 420px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.history-card__list::-webkit-scrollbar {
  width: 4px;
}

.history-card__list::-webkit-scrollbar-track {
  background: transparent;
}

.history-card__list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

/* Transaction Item */
.transaction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.15s;
  border-radius: 8px;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.transaction-item__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  flex-shrink: 0;
}

.transaction-item--deposit .transaction-item__icon {
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.transaction-item--withdraw .transaction-item__icon {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.transaction-item__details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.transaction-item__type {
  font-size: 0.88rem;
  font-weight: 500;
  color: #e2e8f0;
}

.transaction-item__time {
  font-size: 0.75rem;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.transaction-item__amount {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  font-weight: 600;
  flex-shrink: 0;
  gap: 0.05rem;
}

.amount--positive {
  color: #4ade80;
}

.amount--negative {
  color: #f87171;
}

.amount-sign {
  font-size: 0.85rem;
}

/* List Transition */
.list-enter-active {
  transition: all 0.35s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-16px);
}
</style>