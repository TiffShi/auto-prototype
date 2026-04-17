<template>
  <button
    @click="handleLike"
    :disabled="loading"
    class="p-1 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
    :class="post.likedByCurrentUser ? 'text-red-500' : 'text-gray-700 hover:text-gray-500'"
  >
    <svg
      class="w-6 h-6 transition-all duration-200"
      :fill="post.likedByCurrentUser ? 'currentColor' : 'none'"
      stroke="currentColor"
      viewBox="0 0 24 24"
      stroke-width="2"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { usePostStore } from '@/stores/postStore.js'

const props = defineProps({
  post: { type: Object, required: true }
})

const emit = defineEmits(['liked'])
const postStore = usePostStore()
const loading = ref(false)

async function handleLike() {
  loading.value = true
  try {
    await postStore.toggleLike(props.post)
    emit('liked')
  } catch (err) {
    console.error('Like failed:', err)
  } finally {
    loading.value = false
  }
}
</script>