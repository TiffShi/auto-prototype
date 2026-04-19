<template>
  <div class="space-y-1">
    <div v-if="loading" class="flex justify-center py-8">
      <div class="spinner w-8 h-8"></div>
    </div>
    <div v-else-if="notifications.length === 0" class="text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <p class="text-gray-400 font-medium">No notifications yet</p>
    </div>
    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-gray-50"
      :class="{ 'bg-blue-50': !notification.read }"
    >
      <RouterLink :to="`/profile/${notification.actorUsername}`" class="flex-shrink-0">
        <UserAvatar :src="notification.actorAvatarUrl" :username="notification.actorUsername" size="md" />
      </RouterLink>
      <div class="flex-1 min-w-0">
        <p class="text-sm">
          <RouterLink :to="`/profile/${notification.actorUsername}`" class="font-semibold">
            {{ notification.actorUsername }}
          </RouterLink>
          {{ notificationText(notification) }}
        </p>
        <p class="text-xs text-gray-400 mt-0.5">{{ timeAgo(notification.createdAt) }}</p>
      </div>
      <RouterLink
        v-if="notification.postId"
        :to="`/posts/${notification.postId}`"
        class="flex-shrink-0"
      >
        <div class="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
          <svg class="w-full h-full text-gray-300 p-2" fill="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
          </svg>
        </div>
      </RouterLink>
      <div v-else class="w-3 h-3 rounded-full flex-shrink-0" :class="notification.read ? 'bg-transparent' : 'bg-blue-500'"></div>
    </div>
  </div>
</template>

<script setup>
import UserAvatar from '@/components/user/UserAvatar.vue'
import { timeAgo } from '@/utils/dateUtils.js'

defineProps({
  notifications: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

function notificationText(notification) {
  switch (notification.type) {
    case 'LIKE': return ' liked your post'
    case 'COMMENT': return ' commented on your post'
    case 'FOLLOW': return ' started following you'
    default: return notification.message
  }
}
</script>