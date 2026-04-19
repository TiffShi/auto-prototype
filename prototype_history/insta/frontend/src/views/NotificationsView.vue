<template>
  <div class="max-w-2xl mx-auto px-4 py-6">
    <div class="card overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h1 class="font-semibold text-base">Notifications</h1>
        <button
          v-if="notificationStore.unreadCount > 0"
          @click="notificationStore.markAllAsRead()"
          class="text-blue-500 text-sm font-semibold hover:text-blue-700"
        >
          Mark all read
        </button>
      </div>

      <div class="p-4">
        <NotificationList
          :notifications="notificationStore.notifications"
          :loading="notificationStore.loading"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore.js'
import NotificationList from '@/components/notifications/NotificationList.vue'

const notificationStore = useNotificationStore()

onMounted(async () => {
  await notificationStore.fetchNotifications()
  await notificationStore.markAllAsRead()
})
</script>