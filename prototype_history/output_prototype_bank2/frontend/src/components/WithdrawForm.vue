<template>
  <div class="form-card form-card--withdraw">
    <div class="form-card__header">
      <div class="form-card__icon withdraw-icon">↓</div>
      <div>
        <h3 class="form-card__title">Withdraw Cash</h3>
        <p class="form-card__subtitle">Take funds from your account</p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="form-card__form">
      <div class="input-group" :class="{ 'input-group--error': localError }">
        <label class="input-group__label" for="withdraw-amount">Amount</label>
        <div class="input-group__wrapper">
          <span class="input-group__prefix">$</span>
          <input
            id="withdraw-amount"
            v-model="amountInput"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            class="input-group__field"
            :disabled="loading"
            @input="localError = null"
          />
        </div>
        <transition name="error-fade">
          <p v-if="localError" class="input-group__error">{{ localError }}</p>
        </transition>
      </div>

      <!-- Available balance hint -->
      <div class="balance-hint">
        <span class="balance-hint__label">Available:</span>
        <span class="balance-hint__value">${{ formattedBalance }}</span>
      </div>

      <transition name="success-fade">
        <div v-if="successMessage" class="success-message">
          <span>✓</span> {{ successMessage }}
        </div>
      </transition>

      <button
        type="submit"
        class="btn btn--withdraw"
        :disabled="loading || !amountInput || balance <= 0"
      >
        <span v-if="loading" class="btn__spinner"></span>
        <span v-else class="btn__icon">↓</span>
        <span>{{ loading ? 'Processing...' : 'Withdraw Funds' }}</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  balance: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['withdraw'])

const amountInput = ref('')
const localError = ref(null)
const successMessage = ref(null)

const formattedBalance = computed(() => {
  return props.balance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
})

const handleSubmit = () => {
  localError.value = null
  successMessage.value = null

  const amount = parseFloat(amountInput.value)

  if (!amountInput.value || isNaN(amount)) {
    localError.value = 'Please enter a valid amount.'
    return
  }

  if (amount <= 0) {
    localError.value = 'Amount must be greater than $0.00.'
    return
  }

  if (amount > props.balance) {
    localError.value = `Insufficient funds. Available balance: $${formattedBalance.value}`
    return
  }

  emit('withdraw', amount)

  successMessage.value = `$${amount.toFixed(2)} withdrawn successfully!`
  amountInput.value = ''

  setTimeout(() => {
    successMessage.value = null
  }, 3000)
}
</script>

<style scoped>
.form-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.75rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-card:hover {
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

/* Header */
.form-card__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 700;
  flex-shrink: 0;
}

.withdraw-icon {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.form-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 0.2rem;
}

.form-card__subtitle {
  font-size: 0.78rem;
  color: #64748b;
}

/* Input Group */
.input-group {
  margin-bottom: 0.75rem;
}

.input-group__label {
  display: block;
  font-size: 0.78rem;
  font-weight: 500;
  color: #94a3b8;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.input-group__wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-group__wrapper:focus-within {
  border-color: #f87171;
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.1);
}

.input-group--error .input-group__wrapper {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-group__prefix {
  padding: 0 0.75rem;
  color: #64748b;
  font-size: 1rem;
  font-weight: 500;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  height: 100%;
  display: flex;
  align-items: center;
  align-self: stretch;
}

.input-group__field {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  padding: 0.75rem 1rem;
  color: #f1f5f9;
  font-size: 1rem;
  font-family: inherit;
  width: 100%;
}

.input-group__field::placeholder {
  color: #334155;
}

.input-group__field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-group__field::-webkit-outer-spin-button,
.input-group__field::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-group__field[type='number'] {
  -moz-appearance: textfield;
}

.input-group__error {
  font-size: 0.78rem;
  color: #f87171;
  margin-top: 0.4rem;
  padding-left: 0.25rem;
}

/* Balance Hint */
.balance-hint {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  margin-bottom: 1rem;
  padding: 0 0.25rem;
}

.balance-hint__label {
  color: #475569;
}

.balance-hint__value {
  color: #94a3b8;
  font-weight: 500;
}

/* Success Message */
.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.25);
  color: #4ade80;
  font-size: 0.85rem;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

/* Button */
.btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.85rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.btn--withdraw {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: #fff;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.btn--withdraw:hover:not(:disabled) {
  background: linear-gradient(135deg, #b91c1c, #991b1b);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
  transform: translateY(-1px);
}

.btn--withdraw:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn__icon {
  font-size: 1rem;
  font-weight: 700;
}

.btn__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Transitions */
.error-fade-enter-active,
.error-fade-leave-active,
.success-fade-enter-active,
.success-fade-leave-active {
  transition: all 0.25s ease;
}

.error-fade-enter-from,
.error-fade-leave-to,
.success-fade-enter-from,
.success-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>