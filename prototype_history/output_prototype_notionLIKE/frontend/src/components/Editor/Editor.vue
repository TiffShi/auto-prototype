<template>
  <div class="editor" v-if="pageStore.currentPage">
    <!-- Page header area -->
    <div class="editor-header">
      <PageTitle
        :title="pageStore.currentPage.title"
        @update="handleTitleUpdate"
      />
    </div>

    <!-- Block list -->
    <div class="editor-body">
      <BlockList
        :page-id="pageId"
        :blocks="pageStore.currentBlocks"
      />
    </div>
  </div>
</template>

<script setup>
import { usePageStore } from '@/store/usePageStore.js';
import PageTitle from './PageTitle.vue';
import BlockList from './BlockList.vue';
import * as api from '@/api/index.js';

const props = defineProps({
  pageId: {
    type: String,
    required: true,
  },
});

const pageStore = usePageStore();

// Debounce helper
let titleTimer = null;
function handleTitleUpdate(newTitle) {
  if (pageStore.currentPage) {
    pageStore.currentPage.title = newTitle;
  }
  clearTimeout(titleTimer);
  titleTimer = setTimeout(async () => {
    await api.updatePage(props.pageId, { title: newTitle });
    await pageStore.fetchPages(); // refresh sidebar
  }, 500);
}
</script>

<style scoped>
.editor {
  max-width: 900px;
  margin: 0 auto;
  padding: 60px 96px 200px;
  min-height: 100%;
}

@media (max-width: 768px) {
  .editor {
    padding: 40px 24px 120px;
  }
}

.editor-header {
  margin-bottom: 8px;
}

.editor-body {
  /* block list fills remaining space */
}
</style>