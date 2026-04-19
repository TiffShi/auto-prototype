import apiClient from './axios.js'

export const notificationApi = {
  getNotifications() {
    return apiClient.get('/api/notifications')
  },

  getUnreadCount() {
    return apiClient.get('/api/notifications/unread-count')
  },

  markAllAsRead() {
    return apiClient.put('/api/notifications/read')
  }
}