<template>
  <div class="empty-state">
    <div class="empty-icon">📝</div>
    <h2 class="empty-title">{{ message || 'Select a page to get started' }}</h2>
    <p class="empty-subtitle">
      Choose a page from the sidebar, or create a new one.
    </p>
    <button class="empty-btn" @click="createPage">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 2a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2H9v4a1 1 0 1 1-2 0V9H3a1 1 0 1 1 0-2h4V3a1 1 0 0 1 1-1z"/>
      </svg>
      New Page
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { usePageStore } from '@/store/usePageStore.js';

defineProps({
  message: {
    type: String,
    default: '',
  },
});

const router = useRouter();
const pageStore = usePageStore();

async function createPage() {
  const page = await pageStore.addPage(null);
  if (page) {
    router.push(`/page/${page.id}`);
  }
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
  gap: 12px;
  padding: 40px;
  text-align: center;
}

.empty-icon {
  font-size: 56px;
  margin-bottom: 8px;
  opacity: 0.6;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #37352f;
}

.empty-subtitle {
  font-size: 14px;
  color: #9b9a97;
  max-width: 300px;
  line-height: 1.5;
}

.empty-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 10px 20px;
  background: #37352f;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}

.empty-btn:hover {
  background: #1a1a1a;
  transform: translateY(-1px);
}

.empty-btn:active {
  transform: translateY(0);
}
</style>