<template>
  <div class="toolbar">
    <div class="toolbar-label">Tools</div>
    <div class="tool-grid">
      <button
        v-for="tool in tools"
        :key="tool.id"
        class="tool-btn"
        :class="{ active: store.activeTool === tool.id }"
        :title="tool.label"
        @click="store.setActiveTool(tool.id)"
      >
        <span class="tool-icon">{{ tool.icon }}</span>
        <span class="tool-label">{{ tool.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { usePaintStore } from '../stores/paintStore';

const store = usePaintStore();

const tools = [
  { id: 'pencil', icon: '✏️', label: 'Pencil' },
  { id: 'brush', icon: '🖌️', label: 'Brush' },
  { id: 'eraser', icon: '🧹', label: 'Eraser' },
  { id: 'fill', icon: '🪣', label: 'Fill' },
  { id: 'eyedropper', icon: '💉', label: 'Eyedropper' },
  { id: 'line', icon: '📏', label: 'Line' },
  { id: 'rect', icon: '⬜', label: 'Rectangle' },
  { id: 'circle', icon: '⭕', label: 'Circle' },
];
</script>

<style scoped>
.toolbar {
  background: #0f3460;
  border-radius: 10px;
  padding: 12px;
}

.toolbar-label {
  font-size: 11px;
  font-weight: 700;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
}

.tool-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 8px 4px;
  background: #16213e;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #cbd5e0;
}

.tool-btn:hover {
  background: #1a2a4a;
  border-color: #e94560;
  transform: translateY(-1px);
}

.tool-btn.active {
  background: #e94560;
  border-color: #e94560;
  color: #fff;
}

.tool-icon {
  font-size: 18px;
  line-height: 1;
}

.tool-label {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>