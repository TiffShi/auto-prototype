<template>
  <div class="form-card form-card--withdraw">
    <div class="form-card__header">
      <div class="form-icon form-icon--withdraw">
        <span>↓</span>
      </div>
      <div>
        <h2 class="form-title">Withdraw</h2>
        <p class="form-subtitle">Take funds from your account</p>
      </div>
    </div>

    <form class="form-body" @submit.prevent="handleSubmit" novalidate>
      <div class="input-group">
        <label class="input-label" for="withdraw-amount">Amount</label>
        <div :class="['input-wrapper', { 'input-wrapper--error': errorMessage }]">
          <span class="input-prefix">$</span>
          <input
            id="withdraw-amount"
            ref="inputRef"
            v-model="rawInput"
            type="number"
            class="input-field"
            placeholder="0.00"
            min="0.01"
            step="0.01"
            :disabled="loading"
            @input="clearError"
            @keydown.enter.prevent="handleSubmit"
          />
        </div>
        <transition name="fade">
          <p v-if="errorMessage" class="input-error">{{ errorMessage }}</p>
        </transition>
      </div>

      <!-- Available Balance Hint -->
      <div class="balance-hint">
        <span class="balance-hint__label">Available:</span>
        <span class="balance-hint__value">${{ formattedBalance }}</span>
        <button
          type="button"
          class="balance-hint__max"
          :disabled="loading || balance <= 0"
          @click="setMaxAmount"
        >
          Max
        </button>
      </div>

      <!-- Quick Amount Buttons -->
      <div class="quick-amounts">
        <button
          v-for="amount in quickAmounts"
          :key="amount"
          type="button"
          class="quick-btn"
          :disabled="loading || balance < amount"
          @click="setQuickAmount(amount)"
        >
          ${{ amount }}
        </button>
      </div>

      <button
        type="submit"
        :class="['submit-btn', 'submit-btn--withdraw', { 'submit-btn--loading': loading }]"
        :disabled="loading"
      >
        <span v-if="loading" class="btn-spinner"></span>
        <span v-else class="btn-icon">↓</span>
        <span>{{ loading ? 'Processing…' : 'Withdraw Funds' }}</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['withdraw'])

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

const rawInput = ref('')
const errorMessage = ref('')
const inputRef = ref(null)

const quickAmounts = [10, 50, 100, 500]

const formattedBalance = computed(() => {
  return props.balance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
})

const clearError = () => {
  errorMessage.value = ''
}

const setQuickAmount = (amount) => {
  rawInput.value = amount.toString()
  clearError()
  inputRef.value?.focus()
}

const setMaxAmount = () => {
  rawInput.value = props.balance.toFixed(2)
  clearError()
  inputRef.value?.focus()
}

const validate = (value) => {
  if (!value || value.toString().trim() === '') {
    return 'Please enter an amount.'
  }
  const num = parseFloat(value)
  if (isNaN(num)) {
    return 'Please enter a valid number.'
  }
  if (num <= 0) {
    return 'Amount must be greater than $0.00.'
  }
  if (num > props.balance) {
    return `Insufficient funds. Available balance: $${formattedBalance.value}.`
  }
  const decimalStr = value.toString().split('.')
  if (decimalStr[1] && decimalStr[1].length > 2) {
    return 'Amount cannot have more than 2 decimal places.'
  }
  return null
}

const handleSubmit = () => {
  const error = validate(rawInput.value)
  if (error) {
    errorMessage.value = error
    inputRef.value?.focus()
    return
  }
  const amount = parseFloat(parseFloat(rawInput.value).toFixed(2))
  emit('withdraw', amount)
  rawInput.value = ''
  errorMessage.value = ''
}
</script>

<style scoped>
.form-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: box-shadow var(--transition);
}

.form-card:hover {
  box-shadow: var(--shadow-lg);
}

.form-card--withdraw {
  border-top: 4px solid var(--color-withdraw);
}

.form-card__header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px 0;
}

.form-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 700;
  flex-shrink: 0;
}

.form-icon--withdraw {
  background: var(--color-danger-light);
  color: var(--color-withdraw);
}

.form-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.form-subtitle {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin: 2px 0 0;
}

.form-body {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color var(--transition), box-shadow var(--transition);
  background: #fff;
}

.input-wrapper:focus-within {
  border-color: var(--color-withdraw);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.input-wrapper--error {
  border-color: var(--color-danger);
}

.input-wrapper--error:focus-within {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12);
}

.input-prefix {
  padding: 0 12px;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-muted);
  background: #f8fafc;
  border-right: 2px solid var(--color-border);
  height: 100%;
  display: flex;
  align-items: center;
  align-self: stretch;
}

.input-field {
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 14px;
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--color-text);
  background: transparent;
  font-family: inherit;
  width: 100%;
}

.input-field::placeholder {
  color: #cbd5e1;
}

.input-field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-field::-webkit-outer-spin-button,
.input-field::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.input-field[type=number] {
  -moz-appearance: textfield;
}

.input-error {
  font-size: 0.8rem;
  color: var(--color-danger);
  font-weight: 500;
}

/* Balance Hint */
.balance-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.83rem;
  color: var(--color-text-muted);
  background: #f8fafc;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 7px 12px;
}

.balance-hint__label {
  font-weight: 500;
}

.balance-hint__value {
  font-weight: 700;
  color: var(--color-text);
  flex: 1;
}

.balance-hint__max {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition);
  font-family: inherit;
}

.balance-hint__max:hover:not(:disabled) {
  background: var(--color-primary);
  color: #fff;
}

.balance-hint__max:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Quick Amounts */
.quick-amounts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-btn {
  flex: 1;
  min-width: 52px;
  padding: 7px 4px;
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

.quick-btn:hover:not(:disabled) {
  border-color: var(--color-withdraw);
  color: var(--color-withdraw);
  background: var(--color-danger-light);
}

.quick-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Submit Button */
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px 20px;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  font-family: inherit;
  letter-spacing: 0.01em;
}

.submit-btn--withdraw {
  background: var(--color-withdraw);
  color: #fff;
}

.submit-btn--withdraw:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35);
}

.submit-btn--withdraw:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 1rem;
  font-weight: 700;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>