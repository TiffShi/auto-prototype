<template>
  <div class="color-picker">
    <div class="section-label">Color</div>

    <!-- Current color preview -->
    <div class="color-preview-row">
      <div
        class="color-preview"
        :style="{ background: store.color }"
        title="Current color"
      />
      <input
        class="hex-input"
        type="text"
        :value="store.color"
        maxlength="7"
        placeholder="#000000"
        @change="onHexChange"
        @keyup.enter="onHexChange"
      />
    </div>

    <!-- Native color input -->
    <input
      class="native-color"
      type="color"
      :value="store.color"
      @input="e => store.setColor(e.target.value)"
    />

    <!-- Swatches -->
    <div class="swatches">
      <button
        v-for="swatch in swatches"
        :key="swatch"
        class="swatch"
        :class="{ active: store.color === swatch }"
        :style="{ background: swatch }"
        :title="swatch"
        @click="store.setColor(swatch)"
      />
    </div>
  </div>
</template>

<script setup>
import { usePaintStore } from '../stores/paintStore';

const store = usePaintStore();

const swatches = [
  '#000000', '#ffffff', '#ff0000', '#00ff00',
  '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#ff8800', '#8800ff', '#00ff88', '#ff0088',
  '#884400', '#004488', '#448800', '#880044',
  '#cccccc', '#888888', '#444444', '#222222',
  '#ffcccc', '#ccffcc', '#ccccff', '#ffffcc',
];

function onHexChange(e) {
  const val = e.target.value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(val)) {
    store.setColor(val);
  }
}
</script>

<style scoped>
.color-picker {
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

.color-preview-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.color-preview {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 2px solid #ffffff30;
  flex-shrink: 0;
  cursor: pointer;
}

.hex-input {
  flex: 1;
  background: #16213e;
  border: 1px solid #ffffff20;
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 12px;
  font-family: monospace;
  padding: 6px 8px;
  outline: none;
  width: 0;
}

.hex-input:focus {
  border-color: #e94560;
}

.native-color {
  width: 100%;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: none;
  padding: 0;
  margin-bottom: 8px;
}

.swatches {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
}

.swatch {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 4px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.1s, border-color 0.1s;
  padding: 0;
}

.swatch:hover {
  transform: scale(1.15);
  border-color: #ffffff80;
}

.swatch.active {
  border-color: #e94560;
  transform: scale(1.15);
}
</style>