<template>
  <nav class="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 h-14">
    <div class="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2">
        <div class="w-8 h-8 instagram-gradient rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke-width="2"/>
            <circle cx="12" cy="12" r="4" stroke-width="2"/>
            <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
          </svg>
        </div>
        <span class="font-bold text-lg hidden sm:block tracking-tight">Instagram</span>
      </RouterLink>

      <!-- Search Bar -->
      <div class="hidden md:block flex-1 max-w-xs mx-8">
        <SearchBar />
      </div>

      <!-- Nav Icons -->
      <div class="flex items-center gap-1">
        <RouterLink
          to="/"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          :class="{ 'text-blue-500': route.name === 'Home' }"
          title="Home"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </RouterLink>

        <RouterLink
          to="/explore"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          :class="{ 'text-blue-500': route.name === 'Explore' }"
          title="Explore"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </RouterLink>

        <!-- Create Post -->
        <button
          @click="showCreateModal = true"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Create Post"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M12 8v8M8 12h8"/>
          </svg>
        </button>

        <!-- Notifications -->
        <NotificationBell />

        <!-- Profile -->
        <div class="relative" ref="profileMenuRef">
          <button
            @click="showProfileMenu = !showProfileMenu"
            class="p-1 rounded-full hover:ring-2 hover:ring-gray-300 transition-all"
          >
            <UserAvatar
              :src="authStore.currentUser?.avatarUrl"
              :username="authStore.currentUser?.username"
              size="sm"
            />
          </button>

          <Transition name="fade">
            <div
              v-if="showProfileMenu"
              class="absolute right-0 top-12 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50"
            >
              <RouterLink
                :to="`/profile/${authStore.currentUser?.username}`"
                class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm"
                @click="showProfileMenu = false"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Profile
              </RouterLink>
              <RouterLink
                to="/profile/edit"
                class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm"
                @click="showProfileMenu = false"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Profile
              </RouterLink>
              <hr class="my-1 border-gray-100" />
              <button
                @click="handleLogout"
                class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm text-red-500 w-full text-left"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Mobile Search -->
    <div class="md:hidden px-4 pb-2">
      <SearchBar />
    </div>
  </nav>

  <!-- Create Post Modal -->
  <PostModal v-if="showCreateModal" @close="showCreateModal = false" />
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { onClickOutside } from '@vueuse/core'
import { useAuthStore } from '@/stores/authStore.js'
import SearchBar from '@/components/user/SearchBar.vue'
import UserAvatar from '@/components/user/UserAvatar.vue'
import NotificationBell from '@/components/notifications/NotificationBell.vue'
import PostModal from '@/components/post/PostModal.vue'

const route = useRoute()
const authStore = useAuthStore()
const showProfileMenu = ref(false)
const showCreateModal = ref(false)
const profileMenuRef = ref(null)

onClickOutside(profileMenuRef, () => {
  showProfileMenu.value = false
})

function handleLogout() {
  showProfileMenu.value = false
  authStore.logout()
}
</script>