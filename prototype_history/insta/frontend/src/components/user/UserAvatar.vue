<template>
  <div
    :class="[sizeClasses, 'rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0 flex items-center justify-center']"
  >
    <img
      v-if="resolvedSrc"
      :src="resolvedSrc"
      :alt="username"
      class="w-full h-full object-cover"
      @error="handleError"
    />
    <span v-else class="text-white font-semibold" :class="textSizeClass">
      {{ initials }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: null
  },
  username: {
    type: String,
    default: 'U'
  },
  size: {
    type: String,
    default: 'md', // xs, sm, md, lg, xl
    validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v)
  }
})

const imgError = ref(false)
const API_URL = import.meta.env.VITE_API_URL

const resolvedSrc = computed(() => {
  if (imgError.value || !props.src) return null
  if (props.src.startsWith('http')) return props.src
  return `${API_URL}${props.src}`
})

const initials = computed(() => {
  return props.username ? props.username.charAt(0).toUpperCase() : 'U'
})

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }
  return sizes[props.size]
})

const textSizeClass = computed(() => {
  const sizes = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-xl',
    xl: 'text-3xl'
  }
  return sizes[props.size]
})

function handleError() {
  imgError.value = true
}
</script>