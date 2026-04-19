<template>
  <aside
    :class="[
      'flex flex-col h-full bg-notion-sidebar border-r border-notion-border transition-all duration-200',
      isCollapsed ? 'w-0 overflow-hidden' : 'w-64'
    ]"
  >
    <!-- User section -->
    <div class="flex items-center gap-2 px-3 py-3 border-b border-notion-border">
      <div class="w-7 h-7 rounded-md bg-gray-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {{ userInitial }}
      </div>
      <span class="flex-1 text-sm font-medium text-gray-800 truncate">{{ userName }}</span>
      <button
        @click="$emit('toggle-collapse')"
        class="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
        title="Close sidebar"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
    </div>

    <!-- Quick actions -->
    <div class="px-2 py-2 space-y-0.5">
      <button
        @click="$emit('open-search')"
        class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 text-gray-600 text-sm transition-colors"
      >
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Search
        <kbd class="ml-auto text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">⌘K</kbd>
      </button>

      <router-link
        to="/"
        class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 text-gray-600 text-sm transition-colors"
        active-class="bg-gray-200"
      >
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Home
      </router-link>

      <router-link
        to="/trash"
        class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 text-gray-600 text-sm transition-colors"
        active-class="bg-gray-200"
      >
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Trash
      </router-link>
    </div>

    <!-- Pages section -->
    <div class="flex-1 overflow-y-auto px-2 py-2">
      <div class="flex items-center justify-between px-2 mb-1">
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pages</span>
        <button
          @click="createNewPage"
          class="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
          title="New page"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="pagesStore.loading" class="px-2 py-4 flex items-center justify-center">
        <div class="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
      </div>

      <!-- Empty state -->
      <div v-else-if="!pagesStore.pages.length" class="px-2 py-4 text-center">
        <p class="text-xs text-gray-400">No pages yet</p>
        <button
          @click="createNewPage"
          class="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Create your first page
        </button>
      </div>

      <!-- Page tree -->
      <div v-else class="space-y-0.5">
        <SidebarPageItem
          v-for="page in pagesStore.pages"
          :key="page.id"
          :page="page"
          :depth="0"
        />
      </div>
    </div>

    <!-- Bottom actions -->
    <div class="px-2 py-2 border-t border-notion-border">
      <button
        @click="createNewPage"
        class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 text-gray-600 text-sm transition-colors"
      >
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New page
      </button>

      <button
        @click="authStore.logout"
        class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 text-gray-600 text-sm transition-colors"
      >
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sign out
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { usePagesStore } from '@/stores/pages.js'
import SidebarPageItem from './SidebarPageItem.vue'

defineProps({
  isCollapsed: Boolean
})

defineEmits(['toggle-collapse', 'open-search'])

const router = useRouter()
const authStore = useAuthStore()
const pagesStore = usePagesStore()

const userName = computed(() => authStore.user?.username || authStore.user?.email || 'User')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

async function createNewPage() {
  const page = await pagesStore.createPage()
  router.push({ name: 'Page', params: { id: page.id } })
}
</script>