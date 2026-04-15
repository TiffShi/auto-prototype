<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="dashboard__header">
      <div class="header__inner">
        <div class="header__logo">
          <span class="logo-icon">🏦</span>
          <span class="logo-text">VaultBank</span>
        </div>
        <div class="header__subtitle">Personal Banking Dashboard</div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="dashboard__main">
      <!-- Global Error Banner -->
      <transition name="slide-down">
        <div v-if="globalError" class="error-banner">
          <span class="error-banner__icon">⚠️</span>
          <span class="error-banner__text">{{ globalError }}</span>
          <button class="error-banner__close" @click="globalError = null">✕</button>
        </div>
      </transition>

      <!-- Loading Overlay -->
      <div v-if="initialLoading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Loading your account...</p>
      </div>

      <template v-else>
        <!-- Balance Card -->
        <BalanceCard :balance="balance" :loading="balanceLoading" />

        <!-- Action Forms -->
        <div class="dashboard__actions">
          <DepositForm
            :loading="depositLoading"
            @deposit="handleDeposit"
          />
          <WithdrawForm
            :loading="withdrawLoading"
            :balance="balance"
            @withdraw="handleWithdraw"
          />
        </div>

        <!-- Transaction History -->
        <TransactionHistory
          :transactions="transactions"
          :loading="transactionsLoading"
        />
      </template>
    </main>

    <!-- Footer -->
    <footer class="dashboard__footer">
      <p>© 2024 VaultBank · Secured In-Memory Banking</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BalanceCard from '../components/BalanceCard.vue'
import DepositForm from '../components/DepositForm.vue'
import WithdrawForm from '../components/WithdrawForm.vue'
import TransactionHistory from '../components/TransactionHistory.vue'
import {
  getBalance,
  deposit,
  withdraw,
  getTransactions,
} from '../api/bankingApi.js'

const balance = ref(0)
const transactions = ref([])
const globalError = ref(null)

const initialLoading = ref(true)
const balanceLoading = ref(false)
const depositLoading = ref(false)
const withdrawLoading = ref(false)
const transactionsLoading = ref(false)

const extractErrorMessage = (error) => {
  if (error.response && error.response.data) {
    const data = error.response.data
    if (data.message) return data.message
    if (data.error) return data.error
  }
  return 'An unexpected error occurred. Please try again.'
}

const fetchBalance = async () => {
  balanceLoading.value = true
  try {
    const data = await getBalance()
    balance.value = data.balance
  } catch (error) {
    globalError.value = extractErrorMessage(error)
  } finally {
    balanceLoading.value = false
  }
}

const fetchTransactions = async () => {
  transactionsLoading.value = true
  try {
    const data = await getTransactions()
    transactions.value = data
  } catch (error) {
    globalError.value = extractErrorMessage(error)
  } finally {
    transactionsLoading.value = false
  }
}

const refreshAll = async () => {
  await Promise.all([fetchBalance(), fetchTransactions()])
}

const handleDeposit = async (amount) => {
  globalError.value = null
  depositLoading.value = true
  try {
    const data = await deposit(amount)
    balance.value = data.balance
    await fetchTransactions()
  } catch (error) {
    globalError.value = extractErrorMessage(error)
  } finally {
    depositLoading.value = false
  }
}

const handleWithdraw = async (amount) => {
  globalError.value = null
  withdrawLoading.value = true
  try {
    const data = await withdraw(amount)
    balance.value = data.balance
    await fetchTransactions()
  } catch (error) {
    globalError.value = extractErrorMessage(error)
  } finally {
    withdrawLoading.value = false
  }
}

onMounted(async () => {
  await refreshAll()
  initialLoading.value = false
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

/* Header */
.dashboard__header {
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  padding: 1.25rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header__inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header__logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.logo-icon {
  font-size: 1.6rem;
}

.logo-text {
  font-size: 1.4rem;
  font-weight: 700;
  background: linear-gradient(90deg, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header__subtitle {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 400;
}

/* Main */
.dashboard__main {
  flex: 1;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  color: #fca5a5;
}

.error-banner__icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.error-banner__text {
  flex: 1;
  font-size: 0.9rem;
  line-height: 1.4;
}

.error-banner__close {
  background: none;
  border: none;
  color: #fca5a5;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  transition: background 0.2s;
  flex-shrink: 0;
}

.error-banner__close:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Loading Overlay */
.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 5rem 2rem;
  color: #64748b;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 3px solid rgba(56, 189, 248, 0.15);
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Actions Grid */
.dashboard__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 680px) {
  .dashboard__actions {
    grid-template-columns: 1fr;
  }

  .header__subtitle {
    display: none;
  }
}

/* Footer */
.dashboard__footer {
  text-align: center;
  padding: 1.5rem;
  color: #334155;
  font-size: 0.78rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>