<template>
  <div class="form-card form-card--deposit">
    <div class="form-card__header">
      <div class="form-icon form-icon--deposit">
        <span>↑</span>
      </div>
      <div>
        <h2 class="form-title">Deposit</h2>
        <p class="form-subtitle">Add funds to your account</p>
      </div>
    </div>

    <form class="form-body" @submit.prevent="handleSubmit" novalidate>
      <div class="input-group">
        <label class="input-label" for="deposit-amount">Amount</label>
        <div :class="['input-wrapper', { 'input-wrapper--error': errorMessage }]">
          <span class="input-prefix">$</span>
          <input
            id="deposit-amount"
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

      <!-- Quick Amount Buttons -->
      <div class="quick-amounts">
        <button
          v-for="amount in quickAmounts"
          :key="amount"
          type="button"
          class="quick-btn"
          :disabled="loading"
          @click="setQuickAmount(amount)"
        >
          ${{ amount }}
        </button>
      </div>

      <button
        type="submit"
        :class="['submit-btn', 'submit-btn--deposit', { 'submit-btn--loading': loading }]"
        :disabled="loading"
      >
        <span v-if="loading" class="btn-spinner"></span>
        <span v-else class="btn-icon">↑</span>
        <span>{{ loading ? 'Processing…' : 'Deposit Funds' }}</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['deposit'])

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const rawInput = ref('')
const errorMessage = ref('')
const inputRef = ref(null)

const quickAmounts = [10, 50, 100, 500]

const clearError = () => {
  errorMessage.value = ''
}

const setQuickAmount = (amount) => {
  rawInput.value = amount.toString()
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
  if (num > 1_000_000) {
    return 'Amount cannot exceed $1,000,000 per transaction.'
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
  emit('deposit', amount)
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

.form-card--deposit {
  border-top: 4px solid var(--color-deposit);
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

.form-icon--deposit {
  background: var(--color-success-light);
  color: var(--color-deposit);
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
  gap: 16px;
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
  border-color: var(--color-deposit);
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
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

/* Remove number input arrows */
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
  border-color: var(--color-deposit);
  color: var(--color-deposit);
  background: var(--color-success-light);
}

.quick-btn:disabled {
  opacity: 0.5;
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

.submit-btn--deposit {
  background: var(--color-deposit);
  color: #fff;
}

.submit-btn--deposit:hover:not(:disabled) {
  background: #15803d;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.35);
}

.submit-btn--deposit:active:not(:disabled) {
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

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>