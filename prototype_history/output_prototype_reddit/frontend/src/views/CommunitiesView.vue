<template>
  <div class="communities-view">
    <div class="main-col">
      <h1 class="page-title">📋 All Communities</h1>

      <div v-if="communityStore.loading" class="state-msg">
        Loading communities…
      </div>
      <div
        v-else-if="communityStore.error"
        class="state-msg state-msg--error"
      >
        {{ communityStore.error }}
      </div>
      <div
        v-else-if="communityStore.communities.length === 0"
        class="state-msg"
      >
        No communities yet. Create one!
      </div>
      <div v-else class="community-grid">
        <router-link
          v-for="c in communityStore.communities"
          :key="c.id"
          :to="`/communities/${c.id}`"
          class="community-card"
        >
          <div class="community-card-icon">🏘</div>
          <div class="community-card-info">
            <h3 class="community-card-name">r/{{ c.name }}</h3>
            <p class="community-card-desc">
              {{ c.description || 'No description.' }}
            </p>
            <span class="community-card-date">
              Created {{ formatDate(c.created_at) }}
            </span>
          </div>
        </router-link>
      </div>
    </div>

    <aside class="sidebar">
      <div class="sidebar-card">
        <h3 class="sidebar-title">➕ Create Community</h3>
        <form @submit.prevent="handleCreate" class="create-form">
          <label class="field-label">Name</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="e.g. programming"
            maxlength="100"
            class="field-input"
            :class="{ 'field-input--error': errors.name }"
          />
          <p v-if="errors.name" class="error-msg">{{ errors.name }}</p>

          <label class="field-label">Description</label>
          <textarea
            v-model="form.description"
            placeholder="What is this community about?"
            rows="3"
            maxlength="500"
            class="field-textarea"
          ></textarea>

          <p v-if="apiError" class="error-msg">{{ apiError }}</p>

          <button type="submit" class="create-btn" :disabled="submitting">
            {{ submitting ? 'Creating…' : 'Create Community' }}
          </button>
        </form>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useCommunityStore } from '../stores/communityStore.js'

const communityStore = useCommunityStore()

const form = reactive({ name: '', description: '' })
const errors = reactive({ name: '' })
const submitting = ref(false)
const apiError = ref(null)

onMounted(() => communityStore.fetchCommunities())

async function handleCreate() {
  errors.name = ''
  apiError.value = null

  if (!form.name.trim()) {
    errors.name = 'Community name is required.'
    return
  }

  submitting.value = true
  try {
    await communityStore.addCommunity({
      name: form.name.trim(),
      description: form.description.trim(),
    })
    form.name = ''
    form.description = ''
  } catch (e) {
    apiError.value = e?.response?.data?.detail || 'Failed to create community.'
  } finally {
    submitting.value = false
  }
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<style scoped>
.communities-view {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.main-col {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1c1c1c;
}

.state-msg {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 32px;
  text-align: center;
  color: #555;
}

.state-msg--error {
  color: #c0392b;
  border-color: #f5c6cb;
  background: #fff5f5;
}

.community-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.community-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 16px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s;
}

.community-card:hover {
  border-color: #898989;
}

.community-card-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.community-card-info {
  flex: 1;
  min-width: 0;
}

.community-card-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1c1c1c;
  margin-bottom: 4px;
}

.community-card-desc {
  font-size: 0.875rem;
  color: #555;
  line-height: 1.4;
  margin-bottom: 6px;
}

.community-card-date {
  font-size: 0.75rem;
  color: #878a8c;
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
  margin-bottom: 14px;
  color: #1c1c1c;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #555;
}

.field-input,
.field-textarea {
  width: 100%;
  padding: 9px 11px;
  border: 1px solid #edeff1;
  border-radius: 4px;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s;
  background: #f6f7f8;
  resize: vertical;
}

.field-input:focus,
.field-textarea:focus {
  border-color: #0079d3;
  background: #fff;
}

.field-input--error {
  border-color: #e53e3e;
}

.error-msg {
  color: #e53e3e;
  font-size: 0.8rem;
}

.create-btn {
  background: #ff4500;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 9px;
  font-size: 0.875rem;
  font-weight: 700;
  margin-top: 4px;
  transition: background 0.15s;
}

.create-btn:hover:not(:disabled) {
  background: #e03d00;
}

.create-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .communities-view {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
  }
}
</style>