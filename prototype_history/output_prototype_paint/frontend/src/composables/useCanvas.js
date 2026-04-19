import { ref } from 'vue';

/**
 * Provides canvas ref and basic context utilities.
 * The actual drawing logic lives in PaintCanvas.vue for direct DOM access.
 */
export function useCanvas() {
  const canvasRef = ref(null);

  function getContext() {
    return canvasRef.value?.getContext('2d') ?? null;
  }

  function getCanvasSize() {
    if (!canvasRef.value) return { width: 0, height: 0 };
    return {
      width: canvasRef.value.width,
      height: canvasRef.value.height
    };
  }

  return { canvasRef, getContext, getCanvasSize };
}