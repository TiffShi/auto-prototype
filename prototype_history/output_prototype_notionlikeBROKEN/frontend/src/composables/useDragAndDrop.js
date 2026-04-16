import { ref } from 'vue'

export function useDragAndDrop(onReorder) {
  const draggedIndex = ref(null)
  const dragOverIndex = ref(null)
  const isDragging = ref(false)

  function onDragStart(index) {
    draggedIndex.value = index
    isDragging.value = true
  }

  function onDragOver(index) {
    if (draggedIndex.value === null || draggedIndex.value === index) return
    dragOverIndex.value = index
  }

  function onDrop(index, items) {
    if (draggedIndex.value === null || draggedIndex.value === index) {
      reset()
      return
    }

    const newItems = [...items]
    const [removed] = newItems.splice(draggedIndex.value, 1)
    newItems.splice(index, 0, removed)

    onReorder(newItems)
    reset()
  }

  function onDragEnd() {
    reset()
  }

  function reset() {
    draggedIndex.value = null
    dragOverIndex.value = null
    isDragging.value = false
  }

  return {
    draggedIndex,
    dragOverIndex,
    isDragging,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd
  }
}