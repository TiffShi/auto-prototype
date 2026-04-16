import { usePaintStore } from '../stores/paintStore';

export function useTools() {
  const store = usePaintStore();

  function setTool(toolId) {
    store.setActiveTool(toolId);
  }

  function isActive(toolId) {
    return store.activeTool === toolId;
  }

  return { setTool, isActive, activeTool: store.activeTool };
}