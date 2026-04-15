<template>
  <div class="comment-form">
    <p class="form-label">
      Comment as <strong>u/{{ userStore.username }}</strong>
    </p>
    <textarea
      v-model="body"
      placeholder="What are your thoughts?"
      rows="4"
      class="comment-textarea"
      :class="{ 'comment-textarea--error': showError }"
      :disabled="submitting"
    ></textarea>
    <p v-if="showError" class="error-msg">Comment cannot be empty.</p>
    <p v-if="apiError" class="error-msg">{{ apiError }}</p>
    <div class="form-footer">
      <span class="char-count">{{ body.length }} / 5000</span>
      <button
        class="submit-btn"
        @click="handleSubmit"
        :disabled="submitting || body.length > 5000"
      >
        {{ submitting ? 'Posting…' : 'Comment' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/userStore.js'
import * as api from '../api/index.js'

const props = defineProps({
  postId: { type: String, required: true },
})

const emit = defineEmits(['commented'])

const userStore = useUserStore()
const body = ref('')
const submitting = ref(false)
const showError = ref(false)
const apiError = ref(null)

async function handleSubmit() {
  showError.value = false
  apiError.value = null

  if (!body.value.trim()) {
    showError.value = true
    return
  }

  submitting.value = true
  try {
    const res = await api.createComment(props.postId, {
      body: body.value.trim(),
      author: userStore.username,
    })
    body.value = ''
    emit('commented', res.data)
  } catch (e) {
    apiError.value = e?.response?.data?.detail || 'Failed to post comment.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.comment-form {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 16px;
}

.form-label {
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 10px;
}

.comment-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #edeff1;
  border-radius: 4px;
  font-size: 0.9rem;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s;
  background: #f6f7f8;
}

.comment-textarea:focus {
  border-color: #0079d3;
  background: #fff;
}

.comment-textarea--error {
  border-color: #e53e3e;
}

.comment-textarea:disabled {
  opacity: 0.6;
}

.error-msg {
  color: #e53e3e;
  font-size: 0.82rem;
  margin-top: 4px;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.char-count {
  font-size: 0.78rem;
  color: #878a8c;
}

.submit-btn {
  background: #ff4500;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 8px 20px;
  font-size: 0.875rem;
  font-weight: 700;
  transition: background 0.15s;
}

.submit-btn:hover:not(:disabled) {
  background: #e03d00;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>