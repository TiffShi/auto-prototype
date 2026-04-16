import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePaintStore = defineStore('paint', () => {
  const color = ref('#000000');
  const brushSize = ref(6);
  const opacity = ref(1);
  const activeTool = ref('pencil');

  function setColor(newColor) {
    color.value = newColor;
  }

  function setBrushSize(size) {
    brushSize.value = Math.min(Math.max(size, 1), 80);
  }

  function setOpacity(val) {
    opacity.value = Math.min(Math.max(val, 0.01), 1);
  }

  function setActiveTool(tool) {
    activeTool.value = tool;
  }

  return {
    color,
    brushSize,
    opacity,
    activeTool,
    setColor,
    setBrushSize,
    setOpacity,
    setActiveTool
  };
});