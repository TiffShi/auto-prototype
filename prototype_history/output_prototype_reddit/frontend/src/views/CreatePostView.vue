<template>
  <div class="create-post-view">
    <div class="form-container">
      <h1 class="page-title">✏️ Create a Post</h1>

      <form @submit.prevent="handleSubmit" class="post-form">
        <!-- Community selector -->
        <div class="field-group">
          <label class="field-label">Community *</label>
          <select
            v-model="form.community_id"
            class="field-select"
            :class="{ 'field-input--error': errors.community_id }"
          >
            <option value="" disabled>Choose a community…</option>
            <option
              v-for="c in communityStore.communities"
              :key="c.id"
              :value="c.id"
            >
              r/{{ c.name }}
            </option>
          </select>
          <p v-if="errors.community_id" class="error-msg">
            {{ errors.community_id }}
          </p>
          <p v-if="communityStore.communities.length === 0" class="hint-msg">
            No communities yet.
            <router-link to="/communities">Create one first.</router-link>
          </p>
        </div>

        <!-- Title -->
        <div class="field-group">
          <label class="field-label">Title *</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="An interesting title…"
            maxlength="300"
            class="field-input"
            :class="{ 'field-input--error': errors.title }"
          />
          <div class="field-footer">
            <p v-if="errors.title" class="error-msg">{{ errors.title }}</p>
            <span class="char-count">{{ form.title.length }} / 300</span>
          </div>
        </div>

        <!-- Body -->
        <div class="field-group">
          <label class="field-label">Body</label>
          <textarea
            v-model="form.body"
            placeholder="Share your thoughts… (optional)"
            rows="8"
            maxlength="10000"
            class="field-textarea"
          ></textarea>
          <div class="field-footer">
            <span></span>
            <span class="char-count">{{ form.body.length }} / 10000</span>
          </div>
        </div>

        <p v-if="apiError" class="error-msg api-error">{{ apiError }}</p>

        <div class="form-actions">
          <router-link to="/" class="cancel-btn">Cancel</router-link>
          <button
            type="submit"
            class="submit-btn"
            :disabled="submitting || !userStore.hasUsername"
          >
            {{ submitting ? 'Posting…' : 'Post' }}
          </button>
        </div>

        <p v-if="!userStore.hasUsername" class="hint-msg">
          You need to set a username before posting.
        </p>
      </form>
    </div>

    <aside class="sidebar">
      <div class="sidebar-card">
        <h3 class="sidebar-title">📝 Posting Tips</h3>
        <ul class="tips-list">
          <li>Choose the right community for your post.</li>
          <li>Write a clear, descriptive title.</li>
          <li>Add context in the body to spark discussion.</li>
          <li>Be respectful and constructive.</li>
        </ul>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePostStore } from '../stores/postStore.js'
import { useCommunityStore } from '../stores/communityStore.js'
import { useUserStore } from '../stores/userStore.js'

const router = useRouter()
const route = useRoute()
const postStore = usePostStore()
const communityStore = useCommunityStore()
const userStore = useUserStore()

const form = reactive({
  title: '',
  body: '',
  community_id: route.query.community || '',
})

const errors = reactive({ title: '', community_id: '' })
const submitting = ref(false)
const apiError = ref(null)

onMounted(() => communityStore.fetchCommunities())

async function handleSubmit() {
  errors.title = ''
  errors.community_id = ''
  apiError.value = null

  let valid = true
  if (!form.title.trim()) {
    errors.title = 'Title is required.'
    valid = false
  }
  if (!form.community_id) {
    errors.community_id = 'Please select a community.'
    valid = false
  }
  if (!valid) return

  submitting.value = true
  try {
    const post = await postStore.addPost({
      title: form.title.trim(),
      body: form.body.trim(),
      author: userStore.username,
      community_id: form.community_id,
    })
    router.push(`/posts/${post.id}`)
  } catch (e) {
    apiError.value = e?.response?.data?.detail || 'Failed to create post.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-post-view {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.form-container {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1c1c1c;
}

.post-form {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
}

.field-input,
.field-select,
.field-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #edeff1;
  border-radius: 4px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.15s;
  background: #f6f7f8;
  resize: vertical;
}

.field-input:focus,
.field-select:focus,
.field-textarea:focus {
  border-color: #0079d3;
  background: #fff;
}

.field-input--error {
  border-color: #e53e3e !important;
}

.field-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 0.75rem;
  color: #878a8c;
  margin-left: auto;
}

.error-msg {
  color: #e53e3e;
  font-size: 0.82rem;
}

.api-error {
  background: #fff5f5;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 10px 12px;
}

.hint-msg {
  font-size: 0.82rem;
  color: #878a8c;
}

.hint-msg a {
  color: #ff4500;
  text-decoration: underline;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  align-items: center;
}

.cancel-btn {
  padding: 9px 20px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
  color: #555;
  border: 1px solid #ccc;
  text-decoration: none;
  transition: background 0.15s;
}

.cancel-btn:hover {
  background: #f0f0f0;
}

.submit-btn {
  background: #ff4500;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 9px 24px;
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

/* Sidebar */
.sidebar {
  width: 312px;
  flex-shrink: 0;
}

.sidebar-card {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 16px;
}

.sidebar-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #1c1c1c;
}

.tips-list {
  list-style: disc;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tips-list li {
  font-size: 0.85rem;
  color: #555;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .create-post-view {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
  }
}
</style>