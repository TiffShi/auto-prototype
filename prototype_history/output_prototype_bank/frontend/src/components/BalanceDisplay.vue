<template>
  <div class="balance-card">
    <div class="balance-card__header">
      <span class="balance-card__label">Current Balance</span>
      <span class="balance-card__badge">Checking Account</span>
    </div>

    <div class="balance-card__body">
      <transition name="balance-update" mode="out-in">
        <div v-if="loading" key="loading" class="balance-skeleton">
          <div class="skeleton-bar skeleton-bar--lg"></div>
        </div>
        <div v-else key="balance" class="balance-amount">
          <span class="balance-currency">$</span>
          <span class="balance-integer">{{ integerPart }}</span>
          <span class="balance-decimal">.{{ decimalPart }}</span>
        </div>
      </transition>
    </div>

    <div class="balance-card__footer">
      <div class="balance-stat">
        <span class="stat-dot stat-dot--green"></span>
        <span>Account Active</span>
      </div>
      <div class="balance-stat">
        <span>In-Memory Storage</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const formattedBalance = computed(() => {
  return props.balance.toFixed(2)
})

const integerPart = computed(() => {
  return Math.floor(props.balance).toLocaleString('en-US')
})

const decimalPart = computed(() => {
  return props.balance.toFixed(2).split('.')[1]
})
</script>

<style scoped>
.balance-card {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%);
  border-radius: var(--radius-lg);
  padding: 32px 36px;
  color: #fff;
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
}

.balance-card::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 180px;
  height: 180px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 50%;
}

.balance-card::after {
  content: '';
  position: absolute;
  bottom: -60px;
  right: 60px;
  width: 240px;
  height: 240px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 50%;
}

.balance-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.balance-card__label {
  font-size: 0.9rem;
  font-weight: 500;
  opacity: 0.85;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.balance-card__badge {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  padding: 3px 12px;
  font-size: 0.75rem;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

.balance-card__body {
  position: relative;
  z-index: 1;
  min-height: 72px;
  display: flex;
  align-items: center;
}

.balance-amount {
  display: flex;
  align-items: flex-start;
  gap: 2px;
  line-height: 1;
}

.balance-currency {
  font-size: 2rem;
  font-weight: 600;
  margin-top: 8px;
  opacity: 0.9;
}

.balance-integer {
  font-size: 4rem;
  font-weight: 700;
  letter-spacing: -2px;
}

.balance-decimal {
  font-size: 2rem;
  font-weight: 500;
  margin-top: 10px;
  opacity: 0.75;
}

.balance-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 0.8rem;
  opacity: 0.75;
  position: relative;
  z-index: 1;
}

.balance-stat {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.stat-dot--green {
  background: #4ade80;
  box-shadow: 0 0 6px #4ade80;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Skeleton */
.balance-skeleton {
  width: 100%;
}

.skeleton-bar {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  animation: shimmer 1.4s ease-in-out infinite;
}

.skeleton-bar--lg {
  height: 64px;
  width: 280px;
  max-width: 100%;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

/* Transition */
.balance-update-enter-active,
.balance-update-leave-active {
  transition: all 0.25s ease;
}

.balance-update-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.balance-update-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 480px) {
  .balance-card {
    padding: 24px 20px;
  }

  .balance-integer {
    font-size: 3rem;
  }

  .balance-currency,
  .balance-decimal {
    font-size: 1.6rem;
  }
}
</style>