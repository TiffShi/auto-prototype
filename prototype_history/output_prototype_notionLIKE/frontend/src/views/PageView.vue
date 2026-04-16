<template>
  <div class="page-view">
    <div v-if="pageStore.loading && !pageStore.currentPage" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Loading page…</span>
    </div>
    <div v-else-if="!pageStore.currentPage && !pageStore.loading" class="not-found">
      <EmptyState message="Page not found or was deleted." />
    </div>
    <Editor v-else :page-id="id" />
  </div>
</template>

<script setup>
import { watch, onMounted } from 'vue';
import { usePageStore } from '@/store/usePageStore.js';
import Editor from '@/components/Editor/Editor.vue';
import EmptyState from '@/components/UI/EmptyState.vue';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const pageStore = usePageStore();

const loadPage = (id) => {
  pageStore.fetchPage(id);
};

onMounted(() => loadPage(props.id));
watch(() => props.id, (newId) => loadPage(newId));
</script>

<style scoped>
.page-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: #9b9a97;
  font-size: 14px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e9e9e7;
  border-top-color: #37352f;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.not-found {
  height: 100%;
}
</style>