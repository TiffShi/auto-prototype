<template>
  <div class="flex items-center justify-between p-3">
    <RouterLink :to="`/profile/${user.username}`" class="flex items-center gap-3 flex-1 min-w-0">
      <UserAvatar :src="user.avatarUrl" :username="user.username" size="md" />
      <div class="min-w-0">
        <p class="font-semibold text-sm truncate">{{ user.username }}</p>
        <p class="text-xs text-gray-500 truncate">{{ user.followerCount }} followers</p>
      </div>
    </RouterLink>
    <FollowButton
      v-if="showFollow && !isOwnProfile"
      :userId="user.id"
      :isFollowing="user.isFollowing"
      size="sm"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore.js'
import UserAvatar from './UserAvatar.vue'
import FollowButton from './FollowButton.vue'

const props = defineProps({
  user: { type: Object, required: true },
  showFollow: { type: Boolean, default: true }
})

const authStore = useAuthStore()
const isOwnProfile = computed(() => authStore.currentUser?.username === props.user.username)
</script>