<template>
  <aside class="sidebar" :class="{ collapsed }">
    <!-- Header -->
    <div class="sidebar-header">
      <div v-if="!collapsed" class="workspace-name">
        <span class="workspace-icon">📝</span>
        <span class="workspace-label">My Workspace</span>
      </div>
      <button class="toggle-btn" @click="$emit('toggle')" :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'">
        <svg v-if="collapsed" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6 3l5 5-5 5V3z"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M10 3l-5 5 5 5V3z"/>
        </svg>
      </button>
    </div>

    <template v-if="!collapsed">
      <!-- Search hint -->
      <div class="sidebar-search" @click="focusSearch">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style="opacity:0.5">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
        </svg>
        <span>Search pages…</span>
      </div>

      <!-- Page tree -->
      <div class="sidebar-pages">
        <div class="section-label">Pages</div>

        <div v-if="pageStore.loading && !pageStore.pageTree.length" class="sidebar-loading">
          Loading…
        </div>

        <div v-else-if="!pageStore.pageTree.length" class="sidebar-empty">
          No pages yet
        </div>

        <SidebarPageItem
          v-for="page in pageStore.pageTree"
          :key="page.id"
          :page="page"
          :depth="0"
          @delete="handleDelete"
        />
      </div>

      <!-- Add page button -->
      <SidebarAddButton @add="handleAddPage" />
    </template>

    <!-- Confirm delete modal -->
    <ConfirmModal
      v-if="deleteTarget"
      :title="`Delete '${deleteTarget.title}'?`"
      message="This will permanently delete this page and all its sub-pages. This cannot be undone."
      confirm-label="Delete"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePageStore } from '@/store/usePageStore.js';
import SidebarPageItem from './SidebarPageItem.vue';
import SidebarAddButton from './SidebarAddButton.vue';
import ConfirmModal from '@/components/UI/ConfirmModal.vue';

defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['toggle']);

const pageStore = usePageStore();
const router = useRouter();
const deleteTarget = ref(null);

async function handleAddPage() {
  const page = await pageStore.addPage(null);
  if (page) {
    router.push(`/page/${page.id}`);
  }
}

function handleDelete(page) {
  deleteTarget.value = page;
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  const id = deleteTarget.value.id;
  deleteTarget.value = null;
  await pageStore.removePage(id);
  // Navigate home if current page was deleted
  router.push('/');
}

function focusSearch() {
  // Could implement search overlay in future
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  min-width: 260px;
  height: 100vh;
  background: #f7f6f3;
  border-right: 1px solid #e9e9e7;
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease, min-width 0.2s ease;
  overflow: hidden;
  position: relative;
  z-index: 10;
}

.sidebar.collapsed {
  width: 48px;
  min-width: 48px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 8px 8px 12px;
  min-height: 48px;
}

.workspace-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #37352f;
  overflow: hidden;
  white-space: nowrap;
}

.workspace-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.workspace-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #9b9a97;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}

.toggle-btn:hover {
  background: #e9e9e7;
  color: #37352f;
}

.sidebar-search {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 8px 4px;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #9b9a97;
  transition: background 0.15s;
}

.sidebar-search:hover {
  background: #e9e9e7;
}

.sidebar-pages {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  color: #9b9a97;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 8px 16px 4px;
}

.sidebar-loading,
.sidebar-empty {
  font-size: 13px;
  color: #9b9a97;
  padding: 8px 16px;
}
</style>