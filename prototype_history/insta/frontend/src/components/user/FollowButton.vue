<template>
  <button
    @click.prevent="handleClick"
    :disabled="loading"
    :class="[
      'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50',
      sizeClasses,
      isFollowing
        ? 'border border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-500 hover:border-red-300'
        : 'bg-blue-500 text-white hover:bg-blue-600'
    ]"
  >
    <span v-if="loading" class="flex items-center gap-1">
      <div class="spinner w-3 h-3"></div>
    </span>
    <span v-else>{{ isFollowing ? 'Following' : 'Follow' }}</span>
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore.js'

const props = defineProps({
  userId: { type: Number, required: true },
  isFollowing: { type: Boolean, default: false },
  size: { type: String, default: 'md' }
})

const emit = defineEmits(['update:isFollowing'])
const userStore = useUserStore()
const loading = ref(false)

const sizeClasses = props.size === 'sm' ? 'px-3 py-1 text-xs' : 'px-6 py-1.5 text-sm'

async function handleClick() {
  loading.value = true
  try {
    if (props.isFollowing) {
      await userStore.unfollowUser(props.userId)
      emit('update:isFollowing', false)
    } else {
      await userStore.followUser(props.userId)
      emit('update:isFollowing', true)
    }
  } catch (err) {
    console.error('Follow action failed:', err)
  } finally {
    loading.value = false
  }
}
</script>