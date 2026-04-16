<template>
  <div
    class="group relative"
    :class="{ 'opacity-50': isDragging && draggedIndex === index }"
    draggable="true"
    @dragstart="$emit('drag-start', index)"
    @dragover.prevent="$emit('drag-over', index)"
    @drop.prevent="$emit('drop', index)"
    @dragend="$emit('drag-end')"
  >
    <!-- Drag handle -->
    <div
      class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5"
    >
      <button
        class="p-0.5 rounded hover:bg-gray-100 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
        title="Drag to reorder"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 6a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4zm8-16a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      </button>
    </div>

    <!-- Drop indicator -->
    <div
      v-if="dragOverIndex === index && draggedIndex !== index"
      class="absolute top-0 left-0 right-0 h-0.5 bg-blue-400 rounded-full -translate-y-0.5 z-10"
    />

    <slot />
  </div>
</template>

<script setup>
defineProps({
  index: Number,
  isDragging: Boolean,
  draggedIndex: Number,
  dragOverIndex: Number
})

defineEmits(['drag-start', 'drag-over', 'drop', 'drag-end'])
</script>