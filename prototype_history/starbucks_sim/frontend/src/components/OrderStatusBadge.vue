<template>
  <span :class="['badge', statusConfig.classes]">
    <span class="mr-1">{{ statusConfig.icon }}</span>
    {{ statusConfig.label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const statusConfig = computed(() => {
  const configs = {
    pending: {
      label: 'Pending',
      icon: '⏳',
      classes: 'bg-yellow-100 text-yellow-800'
    },
    in_progress: {
      label: 'In Progress',
      icon: '🔄',
      classes: 'bg-blue-100 text-blue-800'
    },
    ready: {
      label: 'Ready',
      icon: '✅',
      classes: 'bg-green-100 text-green-800'
    },
    completed: {
      label: 'Completed',
      icon: '☕',
      classes: 'bg-starbucks-light-green text-starbucks-green'
    },
    cancelled: {
      label: 'Cancelled',
      icon: '❌',
      classes: 'bg-red-100 text-red-800'
    }
  }
  return configs[props.status] || { label: props.status, icon: '•', classes: 'bg-gray-100 text-gray-800' }
})
</script>