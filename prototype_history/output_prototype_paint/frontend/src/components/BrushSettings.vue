<template>
  <div class="brush-settings">
    <div class="section-label">Brush</div>

    <div class="setting-row">
      <label class="setting-label">Size <span class="value-badge">{{ store.brushSize }}px</span></label>
      <input
        class="slider"
        type="range"
        min="1"
        max="80"
        :value="store.brushSize"
        @input="e => store.setBrushSize(Number(e.target.value))"
      />
    </div>

    <div class="setting-row">
      <label class="setting-label">Opacity <span class="value-badge">{{ Math.round(store.opacity * 100) }}%</span></label>
      <input
        class="slider"
        type="range"
        min="0.01"
        max="1"
        step="0.01"
        :value="store.opacity"
        @input="e => store.setOpacity(Number(e.target.value))"
      />
    </div>

    <!-- Brush preview -->
    <div class="brush-preview-area">
      <div
        class="brush-dot"
        :style="{
          width: previewSize + 'px',
          height: previewSize + 'px',
          background: store.activeTool === 'eraser' ? '#888' : store.color,
          opacity: store.opacity,
          borderRadius: '50%'
        }"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePaintStore } from '../stores/paintStore';

const store = usePaintStore();

const previewSize = computed(() => {
  const size = store.activeTool === 'brush'
    ? store.brushSize * 2.5
    : store.brushSize;
  return Math.min(Math.max(size, 4), 80);
});
</script>

<style scoped>
.brush-settings {
  background: #0f3460;
  border-radius: 10px;
  padding: 12px;
}

.section-label {
  font-size: 11px;
  font-weight: 700;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
}

.setting-row {
  margin-bottom: 12px;
}

.setting-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #cbd5e0;
  margin-bottom: 5px;
}

.value-badge {
  background: #16213e;
  color: #e94560;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.slider {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: #16213e;
  outline: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #e94560;
  cursor: pointer;
  border: 2px solid #fff;
}

.slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #e94560;
  cursor: pointer;
  border: 2px solid #fff;
}

.brush-preview-area {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  background: #16213e;
  border-radius: 8px;
  border: 1px solid #ffffff10;
}

.brush-dot {
  transition: all 0.1s ease;
}
</style>