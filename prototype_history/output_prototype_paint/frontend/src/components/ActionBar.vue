<template>
  <div class="action-bar">
    <button
      class="action-btn"
      :disabled="!canUndo"
      title="Undo (Ctrl+Z)"
      @click="$emit('undo')"
    >
      ↩ Undo
    </button>
    <button
      class="action-btn"
      :disabled="!canRedo"
      title="Redo (Ctrl+Y)"
      @click="$emit('redo')"
    >
      ↪ Redo
    </button>
    <div class="divider" />
    <button
      class="action-btn danger"
      title="Clear Canvas"
      @click="confirmClear"
    >
      🗑 Clear
    </button>
    <button
      class="action-btn success"
      title="Save Drawing"
      @click="$emit('save')"
    >
      💾 Save
    </button>
    <button
      class="action-btn gallery"
      title="Open Gallery"
      @click="$emit('open-gallery')"
    >
      🖼 Gallery
    </button>
  </div>
</template>

<script setup>
import { usePaintStore } from '../stores/paintStore';
import { useHistory } from '../composables/useHistory';
import { storeToRefs } from 'pinia';

const emit = defineEmits(['undo', 'redo', 'clear', 'save', 'open-gallery']);
const { canUndo, canRedo } = useHistory();

function confirmClear() {
  if (confirm('Clear the canvas? This cannot be undone easily.')) {
    emit('clear');
  }
}
</script>

<style scoped>
.action-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  background: #0f3460;
  border: 1px solid #ffffff20;
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.action-btn:hover:not(:disabled) {
  background: #1a4a80;
  border-color: #e94560;
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.action-btn.danger:hover:not(:disabled) {
  background: #c0392b;
  border-color: #e74c3c;
}

.action-btn.success:hover:not(:disabled) {
  background: #27ae60;
  border-color: #2ecc71;
}

.action-btn.gallery:hover:not(:disabled) {
  background: #8e44ad;
  border-color: #9b59b6;
}

.divider {
  width: 1px;
  height: 28px;
  background: #ffffff20;
  margin: 0 4px;
}
</style>