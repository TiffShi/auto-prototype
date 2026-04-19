import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationApi } from '@/api/notificationApi.js'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const pollingInterval = ref(null)

  const hasUnread = computed(() => unreadCount.value > 0)

  async function fetchNotifications() {
    loading.value = true
    try {
      const response = await notificationApi.getNotifications()
      notifications.value = response.data
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchUnreadCount() {
    try {
      const response = await notificationApi.getUnreadCount()
      unreadCount.value = response.data.count
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }

  async function markAllAsRead() {
    try {
      await notificationApi.markAllAsRead()
      unreadCount.value = 0
      notifications.value = notifications.value.map(n => ({ ...n, read: true }))
    } catch (err) {
      console.error('Failed to mark notifications as read:', err)
    }
  }

  function startPolling() {
    fetchUnreadCount()
    pollingInterval.value = setInterval(fetchUnreadCount, 30000)
  }

  function stopPolling() {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    hasUnread,
    fetchNotifications,
    fetchUnreadCount,
    markAllAsRead,
    startPolling,
    stopPolling
  }
})