<template>
  <div class="page-item-wrapper">
    <div
      class="page-item"
      :class="{ active: isActive, 'has-children': page.children?.length }"
      :style="{ paddingLeft: `${12 + depth * 16}px` }"
      @click="navigate"
    >
      <!-- Expand/collapse toggle -->
      <button
        class="expand-btn"
        @click.stop="toggleExpanded"
        v-if="page.children?.length"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          :style="{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }"
        >
          <path d="M4 2l4 4-4 4V2z"/>
        </svg>
      </button>
      <span v-else class="expand-placeholder"></span>

      <!-- Page icon -->
      <span class="page-icon">📄</span>

      <!-- Title (editable inline) -->
      <span
        v-if="!renaming"
        class="page-title"
        @dblclick.stop="startRename"
      >{{ page.title || 'Untitled' }}</span>

      <input
        v-else
        ref="renameInput"
        class="rename-input"
        v-model="renameValue"
        @blur="commitRename"
        @keydown.enter.prevent="commitRename"
        @keydown.escape.prevent="cancelRename"
        @click.stop
      />

      <!-- Actions -->
      <div class="page-actions" @click.stop>
        <button class="action-btn" title="Add sub-page" @click="addSubPage">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2H9v4a1 1 0 1 1-2 0V9H3a1 1 0 1 1 0-2h4V3a1 1 0 0 1 1-1z"/>
          </svg>
        </button>
        <button class="action-btn action-btn--danger" title="Delete page" @click="$emit('delete', page)">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2h3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Children -->
    <div v-if="expanded && page.children?.length" class="children">
      <SidebarPageItem
        v-for="child in page.children"
        :key="child.id"
        :page="child"
        :depth="depth + 1"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePageStore } from '@/store/usePageStore.js';

const props = defineProps({
  page: {
    type: Object,
    required: true,
  },
  depth: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['delete']);

const router = useRouter();
const route = useRoute();
const pageStore = usePageStore();

const expanded = ref(true);
const renaming = ref(false);
const renameValue = ref('');
const renameInput = ref(null);

const isActive = computed(() => route.params.id === props.page.id);

function navigate() {
  if (!renaming.value) {
    router.push(`/page/${props.page.id}`);
  }
}

function toggleExpanded() {
  expanded.value = !expanded.value;
}

async function addSubPage() {
  const newPage = await pageStore.addPage(props.page.id);
  if (newPage) {
    expanded.value = true;
    router.push(`/page/${newPage.id}`);
  }
}

async function startRename() {
  renameValue.value = props.page.title;
  renaming.value = true;
  await nextTick();
  renameInput.value?.focus();
  renameInput.value?.select();
}

async function commitRename() {
  if (!renaming.value) return;
  renaming.value = false;
  const trimmed = renameValue.value.trim();
  if (trimmed && trimmed !== props.page.title) {
    await pageStore.renamePage(props.page.id, trimmed);
  }
}

function cancelRename() {
  renaming.value = false;
  renameValue.value = props.page.title;
}
</script>

<style scoped>
.page-item-wrapper {
  user-select: none;
}

.page-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-top: 2px;
  padding-bottom: 2px;
  padding-right: 8px;
  cursor: pointer;
  border-radius: 4px;
  margin: 1px 4px;
  min-height: 30px;
  transition: background 0.1s;
  position: relative;
}

.page-item:hover {
  background: #e9e9e7;
}

.page-item.active {
  background: #e3e2df;
}

.page-item:hover .page-actions {
  opacity: 1;
}

.expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #9b9a97;
  padding: 2px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  transition: background 0.1s;
}

.expand-btn:hover {
  background: #d3d2cf;
  color: #37352f;
}

.expand-placeholder {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.page-icon {
  font-size: 13px;
  flex-shrink: 0;
}

.page-title {
  flex: 1;
  font-size: 13.5px;
  color: #37352f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.rename-input {
  flex: 1;
  font-size: 13.5px;
  color: #37352f;
  background: #ffffff;
  border: 1px solid #2383e2;
  border-radius: 3px;
  padding: 1px 4px;
  outline: none;
  min-width: 0;
}

.page-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.1s;
  flex-shrink: 0;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #9b9a97;
  padding: 3px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s, color 0.1s;
}

.action-btn:hover {
  background: #d3d2cf;
  color: #37352f;
}

.action-btn--danger:hover {
  background: #fde8e8;
  color: #e03e3e;
}

.children {
  /* children rendered at increased depth via paddingLeft */
}
</style>