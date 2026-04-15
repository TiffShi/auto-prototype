<template>
  <div class="app-wrapper">
    <!-- Header -->
    <header class="app-header">
      <div class="header-inner">
        <div class="header-brand">
          <span class="brand-icon">🏦</span>
          <span class="brand-name">VaultBank</span>
        </div>
        <div class="header-tagline">Your simple, secure banking companion</div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="app-main">
      <!-- Global Notification Banner -->
      <transition name="slide-down">
        <div
          v-if="notification.visible"
          :class="['notification-banner', `notification-banner--${notification.type}`]"
        >
          <span class="notification-icon">{{ notificationIcon }}</span>
          <span class="notification-text">{{ notification.message }}</span>
          <button class="notification-close" @click="clearNotification">✕</button>
        </div>
      </transition>

      <!-- Loading Overlay -->
      <div v-if="initialLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Loading your account…</p>
      </div>

      <template v-else>
        <!-- Balance Display -->
        <BalanceDisplay :balance="balance" :loading="balanceLoading" />

        <!-- Action Cards -->
        <div class="action-grid">
          <DepositForm
            :loading="depositLoading"
            @deposit="handleDeposit"
          />
          <WithdrawForm
            :balance="balance"
            :loading="withdrawLoading"
            @withdraw="handleWithdraw"
          />
        </div>

        <!-- Transaction History -->
        <TransactionHistory
          :transactions="transactions"
          :loading="transactionsLoading"
          @refresh="fetchTransactions"
        />
      </template>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <p>© 2024 VaultBank · All transactions are stored in-memory and reset on server restart.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BalanceDisplay from './components/BalanceDisplay.vue'
import DepositForm from './components/DepositForm.vue'
import WithdrawForm from './components/WithdrawForm.vue'
import TransactionHistory from './components/TransactionHistory.vue'
import { getBalance, deposit, withdraw, getTransactions } from './services/api.js'

// ── State ──────────────────────────────────────────────
const balance = ref(0)
const transactions = ref([])

const initialLoading = ref(true)
const balanceLoading = ref(false)
const depositLoading = ref(false)
const withdrawLoading = ref(false)
const transactionsLoading = ref(false)

const notification = ref({
  visible: false,
  message: '',
  type: 'success' // 'success' | 'error' | 'warning'
})

let notificationTimer = null

// ── Computed ───────────────────────────────────────────
const notificationIcon = computed(() => {
  const icons = { success: '✅', error: '❌', warning: '⚠️' }
  return icons[notification.value.type] || '💬'
})

// ── Notification Helpers ───────────────────────────────
const showNotification = (message, type = 'success') => {
  if (notificationTimer) clearTimeout(notificationTimer)
  notification.value = { visible: true, message, type }
  notificationTimer = setTimeout(() => {
    notification.value.visible = false
  }, 4500)
}

const clearNotification = () => {
  notification.value.visible = false
  if (notificationTimer) clearTimeout(notificationTimer)
}

// ── API Calls ──────────────────────────────────────────
const fetchBalance = async () => {
  balanceLoading.value = true
  try {
    const data = await getBalance()
    balance.value = data.balance
  } catch (err) {
    showNotification(err.message || 'Failed to fetch balance.', 'error')
  } finally {
    balanceLoading.value = false
  }
}

const fetchTransactions = async () => {
  transactionsLoading.value = true
  try {
    const data = await getTransactions()
    transactions.value = data
  } catch (err) {
    showNotification(err.message || 'Failed to fetch transactions.', 'error')
  } finally {
    transactionsLoading.value = false
  }
}

const handleDeposit = async (amount) => {
  depositLoading.value = true
  try {
    const data = await deposit(amount)
    balance.value = data.balance
    showNotification(data.message, 'success')
    await fetchTransactions()
  } catch (err) {
    showNotification(err.message || 'Deposit failed.', 'error')
  } finally {
    depositLoading.value = false
  }
}

const handleWithdraw = async (amount) => {
  withdrawLoading.value = true
  try {
    const data = await withdraw(amount)
    balance.value = data.balance
    showNotification(data.message, 'success')
    await fetchTransactions()
  } catch (err) {
    showNotification(err.message || 'Withdrawal failed.', 'error')
  } finally {
    withdrawLoading.value = false
  }
}

// ── Lifecycle ──────────────────────────────────────────
onMounted(async () => {
  try {
    await Promise.all([fetchBalance(), fetchTransactions()])
  } finally {
    initialLoading.value = false
  }
})
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Header ── */
.app-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  color: #fff;
  padding: 0;
  box-shadow: var(--shadow-md);
}

.header-inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-icon {
  font-size: 1.8rem;
}

.brand-name {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.header-tagline {
  font-size: 0.85rem;
  opacity: 0.8;
  font-weight: 300;
}

/* ── Main ── */
.app-main {
  flex: 1;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ── Notification Banner ── */
.notification-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-radius: var(--radius-md);
  font-size: 0.92rem;
  font-weight: 500;
  box-shadow: var(--shadow-sm);
  position: relative;
}

.notification-banner--success {
  background: var(--color-success-light);
  color: var(--color-success);
  border: 1px solid #bbf7d0;
}

.notification-banner--error {
  background: var(--color-danger-light);
  color: var(--color-danger);
  border: 1px solid #fecaca;
}

.notification-banner--warning {
  background: var(--color-warning-light);
  color: var(--color-warning);
  border: 1px solid #fde68a;
}

.notification-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.notification-text {
  flex: 1;
}

.notification-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  opacity: 0.6;
  padding: 2px 6px;
  border-radius: 4px;
  transition: opacity var(--transition);
  color: inherit;
}

.notification-close:hover {
  opacity: 1;
}

/* ── Action Grid ── */
.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 640px) {
  .action-grid {
    grid-template-columns: 1fr;
  }

  .header-inner {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* ── Loading Overlay ── */
.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 20px;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Footer ── */
.app-footer {
  text-align: center;
  padding: 18px 20px;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  border-top: 1px solid var(--color-border);
  background: var(--color-card);
}

/* ── Transitions ── */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>