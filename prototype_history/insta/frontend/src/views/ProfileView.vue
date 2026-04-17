<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <!-- Loading -->
    <div v-if="userStore.loading && !userStore.profileUser" class="animate-pulse">
      <div class="flex items-center gap-8 mb-8">
        <div class="w-24 h-24 rounded-full bg-gray-200"></div>
        <div class="space-y-3">
          <div class="w-40 h-5 bg-gray-200 rounded"></div>
          <div class="w-60 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <p class="text-gray-500">{{ error }}</p>
      <RouterLink to="/" class="btn-primary mt-4 inline-block">Go Home</RouterLink>
    </div>

    <!-- Profile Content -->
    <div v-else-if="userStore.profileUser">
      <!-- Profile Header -->
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
        <!-- Avatar -->
        <div class="flex-shrink-0">
          <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-full instagram-gradient p-0.5 shadow-md">
            <div class="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
              <UserAvatar
                :src="userStore.profileUser.avatarUrl"
                :username="userStore.profileUser.username"
                size="xl"
                class="w-full h-full"
              />
            </div>
          </div>
        </div>

        <!-- Info -->
        <div class="flex-1 text-center sm:text-left">
          <div class="flex flex-col sm:flex-row items-center sm:items-center gap-3 mb-4">
            <h1 class="text-xl font-light">{{ userStore.profileUser.username }}</h1>
            <div class="flex gap-2">
              <template v-if="isOwnProfile">
                <RouterLink to="/profile/edit" class="btn-outline text-sm px-4 py-1.5">
                  Edit profile
                </RouterLink>
              </template>
              <template v-else>
                <FollowButton
                  :userId="userStore.profileUser.id"
                  :isFollowing="userStore.profileUser.isFollowing"
                  @update:isFollowing="handleFollowUpdate"
                />
                <button class="btn-outline text-sm px-4 py-1.5">Message</button>
              </template>
            </div>
          </div>

          <!-- Stats -->
          <div class="flex justify-center sm:justify-start gap-6 mb-4">
            <div class="text-center sm:text-left">
              <span class="font-semibold">{{ userStore.profileUser.postCount }}</span>
              <span class="text-gray-500 ml-1 text-sm">posts</span>
            </div>
            <div class="text-center sm:text-left">
              <span class="font-semibold">{{ userStore.profileUser.followerCount }}</span>
              <span class="text-gray-500 ml-1 text-sm">followers</span>
            </div>
            <div class="text-center sm:text-left">
              <span class="font-semibold">{{ userStore.profileUser.followingCount }}</span>
              <span class="text-gray-500 ml-1 text-sm">following</span>
            </div>
          </div>

          <!-- Bio -->
          <div v-if="userStore.profileUser.bio" class="text-sm">
            <p class="whitespace-pre-wrap">{{ userStore.profileUser.bio }}</p>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-gray-200 mb-1">
        <div class="flex justify-center gap-8">
          <button class="flex items-center gap-1 py-3 text-xs font-semibold tracking-widest uppercase border-t border-gray-800 -mt-px">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            Posts
          </button>
        </div>
      </div>

      <!-- Posts Grid -->
      <div v-if="userStore.loading" class="grid grid-cols-3 gap-0.5">
        <div v-for="i in 9" :key="i" class="bg-gray-200 animate-pulse" style="aspect-ratio: 1;"></div>
      </div>
      <div v-else-if="userStore.userPosts.length === 0" class="text-center py-16">
        <svg class="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <p class="text-gray-400 font-medium">No posts yet</p>
        <p v-if="isOwnProfile" class="text-gray-400 text-sm mt-1">Share your first photo!</p>
      </div>
      <PostGrid v-else :posts="userStore.userPosts" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'
import { useUserStore } from '@/stores/userStore.js'
import UserAvatar from '@/components/user/UserAvatar.vue'
import FollowButton from '@/components/user/FollowButton.vue'
import PostGrid from '@/components/post/PostGrid.vue'

const route = useRoute()
const authStore = useAuthStore()
const userStore = useUserStore()
const error = ref(null)

const isOwnProfile = computed(() =>
  authStore.currentUser?.username === route.params.username
)

async function loadProfile() {
  error.value = null
  userStore.clearProfile()
  try {
    await userStore.fetchUserProfile(route.params.username)
    await userStore.fetchUserPosts(route.params.username)
  } catch (err) {
    error.value = err.response?.data?.message || 'User not found'
  }
}

onMounted(loadProfile)
watch(() => route.params.username, loadProfile)

function handleFollowUpdate(isFollowing) {
  if (userStore.profileUser) {
    userStore.profileUser = {
      ...userStore.profileUser,
      isFollowing,
      followerCount: isFollowing
        ? userStore.profileUser.followerCount + 1
        : Math.max(0, userStore.profileUser.followerCount - 1)
    }
  }
}
</script>