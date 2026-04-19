<template>
  <RouterLink
    to="/notifications"
    class="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
    :class="{ 'text-blue-500': route.name === 'Notifications' }"
    title="Notifications"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
    <span
      v-if="notificationStore.unreadCount > 0"
      class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1"
    >
      {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
    </span>
  </RouterLink>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore.js'
import { useAuthStore } from '@/stores/authStore.js'

const route = useRoute()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isAuthenticated) {
    notificationStore.startPolling()
  }
})

onUnmounted(() => {
  notificationStore.stopPolling()
})
</script>