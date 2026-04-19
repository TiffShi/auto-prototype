import { ref, computed } from 'vue';

const MAX_HISTORY = 20;

// Singleton history state shared across composable calls
const history = ref([]);
const historyIndex = ref(-1);

export function useHistory() {
  const canUndo = computed(() => historyIndex.value > 0);
  const canRedo = computed(() => historyIndex.value < history.value.length - 1);

  function pushState(ctx, canvas) {
    // Truncate any redo states
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1);
    }

    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    history.value.push(snapshot);

    // Enforce max history
    if (history.value.length > MAX_HISTORY) {
      history.value.shift();
    } else {
      historyIndex.value++;
    }
  }

  function undo() {
    if (!canUndo.value) return null;
    historyIndex.value--;
    return history.value[historyIndex.value];
  }

  function redo() {
    if (!canRedo.value) return null;
    historyIndex.value++;
    return history.value[historyIndex.value];
  }

  function reset() {
    history.value = [];
    historyIndex.value = -1;
  }

  return { pushState, undo, redo, reset, canUndo, canRedo };
}