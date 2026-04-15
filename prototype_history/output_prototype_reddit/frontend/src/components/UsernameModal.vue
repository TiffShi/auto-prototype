<template>
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-icon">👋</span>
        <h2>Welcome to VueReddit!</h2>
        <p>Choose a username to get started. It will be saved in your browser.</p>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <input
          v-model="inputValue"
          type="text"
          placeholder="Enter your username..."
          maxlength="30"
          autofocus
          class="modal-input"
          :class="{ 'modal-input--error': showError }"
        />
        <p v-if="showError" class="error-msg">
          Username must be at least 2 characters.
        </p>
        <button type="submit" class="modal-btn">Set Username</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/userStore.js'

const userStore = useUserStore()
const inputValue = ref('')
const showError = ref(false)

function handleSubmit() {
  if (inputValue.value.trim().length < 2) {
    showError.value = true
    return
  }
  showError.value = false
  userStore.setUsername(inputValue.value)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  backdrop-filter: blur(2px);
}

.modal {
  background: #fff;
  border-radius: 12px;
  padding: 40px 36px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: pop-in 0.2s ease;
}

@keyframes pop-in {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-header {
  text-align: center;
  margin-bottom: 28px;
}

.modal-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 12px;
}

.modal-header h2 {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1c1c1c;
}

.modal-header p {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.15s;
}

.modal-input:focus {
  border-color: #ff4500;
}

.modal-input--error {
  border-color: #e53e3e;
}

.error-msg {
  color: #e53e3e;
  font-size: 0.82rem;
  margin-top: -4px;
}

.modal-btn {
  background: #ff4500;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.15s;
}

.modal-btn:hover {
  background: #e03d00;
}
</style>