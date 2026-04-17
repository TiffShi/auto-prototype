<template>
  <div class="sticky top-20 space-y-6">
    <!-- Current User -->
    <div class="flex items-center justify-between">
      <RouterLink :to="`/profile/${authStore.currentUser?.username}`" class="flex items-center gap-3">
        <UserAvatar :src="authStore.currentUser?.avatarUrl" :username="authStore.currentUser?.username" size="md" />
        <div>
          <p class="font-semibold text-sm">{{ authStore.currentUser?.username }}</p>
          <p class="text-xs text-gray-400">{{ authStore.currentUser?.email }}</p>
        </div>
      </RouterLink>
      <button @click="authStore.logout()" class="text-xs font-semibold text-blue-500 hover:text-blue-700">
        Switch
      </button>
    </div>

    <!-- Suggestions -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <p class="text-sm font-semibold text-gray-500">Suggestions For You</p>
        <RouterLink to="/explore" class="text-xs font-semibold hover:text-gray-500">See All</RouterLink>
      </div>

      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="flex items-center gap-3 animate-pulse">
          <div class="w-8 h-8 rounded-full bg-gray-200"></div>
          <div class="flex-1 space-y-1">
            <div class="w-24 h-3 bg-gray-200 rounded"></div>
            <div class="w-16 h-2 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      <div v-else class="space-y-1">
        <UserCard
          v-for="user in suggestions"
          :key="user.id"
          :user="user"
          :showFollow="true"
        />
      </div>
    </div>

    <!-- Footer -->
    <div class="text-xs text-gray-400 space-y-2">
      <div class="flex flex-wrap gap-x-2 gap-y-1">
        <a href="#" class="hover:underline">About</a>
        <a href="#" class="hover:underline">Help</a>
        <a href="#" class="hover:underline">Press</a>
        <a href="#" class="hover:underline">API</a>
        <a href="#" class="hover:underline">Jobs</a>
        <a href="#" class="hover:underline">Privacy</a>
        <a href="#" class="hover:underline">Terms</a>
      </div>
      <p>© 2024 Instagram Clone</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore.js'
import { userApi } from '@/api/userApi.js'
import UserAvatar from '@/components/user/UserAvatar.vue'
import UserCard from '@/components/user/UserCard.vue'

const authStore = useAuthStore()
const suggestions = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    // Search for some users as suggestions
    const response = await userApi.searchUsers('')
    suggestions.value = response.data
      .filter(u => u.username !== authStore.currentUser?.username && !u.isFollowing)
      .slice(0, 5)
  } catch (err) {
    console.error('Failed to load suggestions:', err)
  } finally {
    loading.value = false
  }
})
</script>