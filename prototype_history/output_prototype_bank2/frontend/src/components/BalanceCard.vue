<template>
  <div class="balance-card">
    <div class="balance-card__header">
      <div class="balance-card__label">
        <span class="label-dot"></span>
        Current Balance
      </div>
      <div class="balance-card__badge">Live</div>
    </div>

    <div class="balance-card__amount-wrapper">
      <transition name="fade-up" mode="out-in">
        <div v-if="loading" class="balance-card__skeleton" key="loading">
          <div class="skeleton-bar wide"></div>
        </div>
        <div v-else class="balance-card__amount" key="amount">
          <span class="currency">$</span>
          <span class="amount-integer">{{ integerPart }}</span>
          <span class="amount-decimal">.{{ decimalPart }}</span>
        </div>
      </transition>
    </div>

    <div class="balance-card__footer">
      <div class="balance-card__stat">
        <span class="stat-icon">🔒</span>
        <span>FDIC Insured (Demo)</span>
      </div>
      <div class="balance-card__stat">
        <span class="stat-icon">⚡</span>
        <span>Instant Transfers</span>
      </div>
    </div>

    <!-- Decorative elements -->
    <div class="balance-card__glow"></div>
    <div class="balance-card__circles">
      <div class="circle circle--1"></div>
      <div class="circle circle--2"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const formattedBalance = computed(() => {
  return props.balance.toFixed(2)
})

const integerPart = computed(() => {
  const parts = formattedBalance.value.split('.')
  return Number(parts[0]).toLocaleString('en-US')
})

const decimalPart = computed(() => {
  return formattedBalance.value.split('.')[1] || '00'
})
</script>

<style scoped>
.balance-card {
  position: relative;
  background: linear-gradient(135deg, #1e3a5f 0%, #1a1f4e 50%, #2d1b69 100%);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 20px;
  padding: 2.5rem 2.5rem 2rem;
  overflow: hidden;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
}

/* Header */
.balance-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
}

.balance-card__label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.label-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 8px #22c55e;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.85); }
}

.balance-card__badge {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #4ade80;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Amount */
.balance-card__amount-wrapper {
  position: relative;
  z-index: 2;
  min-height: 80px;
  display: flex;
  align-items: center;
}

.balance-card__amount {
  display: flex;
  align-items: baseline;
  gap: 0.15rem;
}

.currency {
  font-size: 2rem;
  font-weight: 300;
  color: #94a3b8;
  margin-right: 0.1rem;
}

.amount-integer {
  font-size: 4rem;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1;
  letter-spacing: -0.02em;
}

.amount-decimal {
  font-size: 2rem;
  font-weight: 400;
  color: #94a3b8;
}

/* Skeleton */
.balance-card__skeleton {
  width: 100%;
}

.skeleton-bar {
  height: 56px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 200% 100%;
  border-radius: 8px;
  animation: shimmer 1.5s infinite;
}

.skeleton-bar.wide {
  width: 60%;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Footer */
.balance-card__footer {
  display: flex;
  gap: 1.5rem;
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  position: relative;
  z-index: 2;
}

.balance-card__stat {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: #475569;
}

.stat-icon {
  font-size: 0.85rem;
}

/* Decorative */
.balance-card__glow {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

.balance-card__circles {
  position: absolute;
  bottom: 0;
  right: 0;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.circle--1 {
  width: 180px;
  height: 180px;
  bottom: -60px;
  right: -60px;
}

.circle--2 {
  width: 280px;
  height: 280px;
  bottom: -120px;
  right: -120px;
}

/* Transitions */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s ease;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>