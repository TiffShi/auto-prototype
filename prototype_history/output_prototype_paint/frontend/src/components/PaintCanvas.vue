<template>
  <div class="canvas-wrapper">
    <canvas
      ref="canvasRef"
      class="paint-canvas"
      :style="{ cursor: cursorStyle }"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseLeave"
      @touchstart.prevent="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend.prevent="onTouchEnd"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePaintStore } from '../stores/paintStore';
import { useHistory } from '../composables/useHistory';
import { useDrawings } from '../composables/useDrawings';
import { floodFill, drawShape } from '../utils/canvasHelpers';
import { canvasToBase64 } from '../utils/imageUtils';

const store = usePaintStore();
const { pushState, undo: historyUndo, redo: historyRedo, canUndo, canRedo } = useHistory();
const { saveDrawingToServer } = useDrawings();

const canvasRef = ref(null);
let ctx = null;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let shapeStartX = 0;
let shapeStartY = 0;
let shapeSnapshot = null;

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 620;

const cursorStyle = computed(() => {
  switch (store.activeTool) {
    case 'eraser': return 'cell';
    case 'fill': return 'crosshair';
    case 'eyedropper': return 'copy';
    default: return 'crosshair';
  }
});

onMounted(() => {
  const canvas = canvasRef.value;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  ctx = canvas.getContext('2d');
  clearToWhite();
  pushState(ctx, canvas);
});

function clearToWhite() {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
}

function getPos(e) {
  const rect = canvasRef.value.getBoundingClientRect();
  const scaleX = canvasRef.value.width / rect.width;
  const scaleY = canvasRef.value.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}

function getTouchPos(e) {
  const touch = e.touches[0] || e.changedTouches[0];
  return getPos(touch);
}

function startDraw(x, y) {
  isDrawing = true;
  lastX = x;
  lastY = y;
  shapeStartX = x;
  shapeStartY = y;

  const tool = store.activeTool;

  if (tool === 'fill') {
    pushState(ctx, canvasRef.value);
    floodFill(ctx, canvasRef.value, Math.round(x), Math.round(y), store.color);
    return;
  }

  if (tool === 'eyedropper') {
    pickColor(x, y);
    isDrawing = false;
    return;
  }

  if (['rect', 'circle', 'line'].includes(tool)) {
    shapeSnapshot = ctx.getImageData(0, 0, canvasRef.value.width, canvasRef.value.height);
    return;
  }

  // For pencil/brush/eraser — start a path
  ctx.beginPath();
  ctx.moveTo(x, y);
  applyBrushStyle();
  ctx.lineTo(x + 0.1, y + 0.1);
  ctx.stroke();
}

function continueDraw(x, y) {
  if (!isDrawing) return;
  const tool = store.activeTool;

  if (['rect', 'circle', 'line'].includes(tool)) {
    // Restore snapshot and redraw shape preview
    ctx.putImageData(shapeSnapshot, 0, 0);
    applyBrushStyle();
    drawShape(ctx, tool, shapeStartX, shapeStartY, x, y);
    return;
  }

  if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
    applyBrushStyle();
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastX = x;
    lastY = y;
  }
}

function endDraw(x, y) {
  if (!isDrawing) return;
  isDrawing = false;

  const tool = store.activeTool;

  if (['rect', 'circle', 'line'].includes(tool)) {
    ctx.putImageData(shapeSnapshot, 0, 0);
    applyBrushStyle();
    drawShape(ctx, tool, shapeStartX, shapeStartY, x, y);
    shapeSnapshot = null;
  }

  if (!['fill', 'eyedropper'].includes(tool)) {
    pushState(ctx, canvasRef.value);
  }
}

function applyBrushStyle() {
  const tool = store.activeTool;
  ctx.lineWidth = store.brushSize;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = store.color;
    ctx.globalAlpha = store.opacity;
  }

  if (tool === 'brush') {
    ctx.lineWidth = store.brushSize * 2.5;
    ctx.globalAlpha = store.opacity * 0.7;
  }
}

function pickColor(x, y) {
  const pixel = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
  const hex = '#' + [pixel[0], pixel[1], pixel[2]]
    .map(v => v.toString(16).padStart(2, '0'))
    .join('');
  store.setColor(hex);
  store.setActiveTool('pencil');
}

// Mouse events
function onMouseDown(e) {
  const { x, y } = getPos(e);
  startDraw(x, y);
}

function onMouseMove(e) {
  const { x, y } = getPos(e);
  continueDraw(x, y);
}

function onMouseUp(e) {
  const { x, y } = getPos(e);
  endDraw(x, y);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

function onMouseLeave() {
  if (isDrawing) {
    isDrawing = false;
    pushState(ctx, canvasRef.value);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
}

// Touch events
function onTouchStart(e) {
  const { x, y } = getTouchPos(e);
  startDraw(x, y);
}

function onTouchMove(e) {
  const { x, y } = getTouchPos(e);
  continueDraw(x, y);
}

function onTouchEnd(e) {
  const { x, y } = getTouchPos(e);
  endDraw(x, y);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// Exposed methods
function undo() {
  const imageData = historyUndo();
  if (imageData) ctx.putImageData(imageData, 0, 0);
}

function redo() {
  const imageData = historyRedo();
  if (imageData) ctx.putImageData(imageData, 0, 0);
}

function clearCanvas() {
  pushState(ctx, canvasRef.value);
  clearToWhite();
  pushState(ctx, canvasRef.value);
}

async function saveDrawing() {
  const base64 = canvasToBase64(canvasRef.value);
  // Local download
  const link = document.createElement('a');
  link.download = `drawing-${Date.now()}.png`;
  link.href = base64;
  link.click();
  // Server save
  try {
    await saveDrawingToServer(base64);
  } catch (err) {
    console.error('Failed to save to server:', err);
  }
}

function loadImageFromUrl(url) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    pushState(ctx, canvasRef.value);
    clearToWhite();
    ctx.drawImage(img, 0, 0, canvasRef.value.width, canvasRef.value.height);
    pushState(ctx, canvasRef.value);
  };
  img.src = url;
}

defineExpose({ undo, redo, clearCanvas, saveDrawing, loadImageFromUrl });
</script>

<style scoped>
.canvas-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.paint-canvas {
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.6);
  max-width: 100%;
  max-height: 100%;
  display: block;
}
</style>