<template>
  <div class="relative" ref="searchRef">
    <div class="relative">
      <svg
        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"
      >
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        v-model="query"
        @input="handleSearch"
        @focus="showResults = true"
        type="text"
        placeholder="Search users..."
        class="w-full pl-9 pr-4 py-1.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
      />
      <button
        v-if="query"
        @click="clearSearch"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Search Results Dropdown -->
    <Transition name="fade">
      <div
        v-if="showResults && (userStore.searchResults.length > 0 || (query && !userStore.loading))"
        class="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto"
      >
        <div v-if="userStore.loading" class="p-4 text-center">
          <div class="spinner w-5 h-5 mx-auto"></div>
        </div>
        <div v-else-if="userStore.searchResults.length === 0 && query" class="p-4 text-center text-gray-500 text-sm">
          No users found for "{{ query }}"
        </div>
        <div v-else>
          <RouterLink
            v-for="user in userStore.searchResults"
            :key="user.id"
            :to="`/profile/${user.username}`"
            class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            @click="clearSearch"
          >
            <UserAvatar :src="user.avatarUrl" :username="user.username" size="sm" />
            <div>
              <p class="font-semibold text-sm">{{ user.username }}</p>
              <p class="text-xs text-gray-500">{{ user.followerCount }} followers</p>
            </div>
          </RouterLink>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useUserStore } from '@/stores/userStore.js'
import UserAvatar from './UserAvatar.vue'

const userStore = useUserStore()
const query = ref('')
const showResults = ref(false)
const searchRef = ref(null)
let searchTimeout = null

onClickOutside(searchRef, () => {
  showResults.value = false
})

function handleSearch() {
  clearTimeout(searchTimeout)
  if (!query.value.trim()) {
    userStore.searchResults = []
    return
  }
  searchTimeout = setTimeout(() => {
    userStore.searchUsers(query.value)
  }, 300)
}

function clearSearch() {
  query.value = ''
  userStore.searchResults = []
  showResults.value = false
}
</script>