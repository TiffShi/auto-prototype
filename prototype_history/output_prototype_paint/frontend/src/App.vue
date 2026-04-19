<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-logo">
        <span class="logo-icon">🎨</span>
        <span class="logo-text">Paint App</span>
      </div>
      <ActionBar
        @undo="handleUndo"
        @redo="handleRedo"
        @clear="handleClear"
        @save="handleSave"
        @open-gallery="showGallery = true"
      />
    </header>

    <div class="app-body">
      <aside class="sidebar-left">
        <Toolbar />
        <ColorPicker />
        <BrushSettings />
      </aside>

      <main class="canvas-area">
        <PaintCanvas ref="paintCanvasRef" />
      </main>
    </div>

    <GalleryModal
      v-if="showGallery"
      @close="showGallery = false"
      @load-drawing="handleLoadDrawing"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import PaintCanvas from './components/PaintCanvas.vue';
import Toolbar from './components/Toolbar.vue';
import ColorPicker from './components/ColorPicker.vue';
import BrushSettings from './components/BrushSettings.vue';
import ActionBar from './components/ActionBar.vue';
import GalleryModal from './components/GalleryModal.vue';

const paintCanvasRef = ref(null);
const showGallery = ref(false);

function handleUndo() {
  paintCanvasRef.value?.undo();
}

function handleRedo() {
  paintCanvasRef.value?.redo();
}

function handleClear() {
  paintCanvasRef.value?.clearCanvas();
}

function handleSave() {
  paintCanvasRef.value?.saveDrawing();
}

function handleLoadDrawing(imageUrl) {
  paintCanvasRef.value?.loadImageFromUrl(imageUrl);
  showGallery.value = false;
}
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: #1a1a2e;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  background: #16213e;
  border-bottom: 2px solid #0f3460;
  flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #e94560;
  letter-spacing: 1px;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar-left {
  width: 220px;
  background: #16213e;
  border-right: 2px solid #0f3460;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;
  padding: 12px;
  gap: 12px;
}

.canvas-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f0f23;
  overflow: hidden;
  padding: 20px;
}
</style>