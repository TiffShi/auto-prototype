<template>
  <AppLayout>
    <div class="flex flex-col items-center justify-center min-h-full py-20 px-8">
      <!-- Welcome -->
      <div class="text-center max-w-lg">
        <div class="text-6xl mb-6">👋</div>
        <h1 class="text-3xl font-bold text-gray-900 mb-3">
          Welcome, {{ userName }}!
        </h1>
        <p class="text-gray-500 text-lg mb-8">
          Your workspace is ready. Create a new page to get started.
        </p>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            @click="createPage"
            :disabled="creating"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-60"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New page
          </button>

          <button
            @click="searchOpen = true"
            class="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search pages
          </button>
        </div>
      </div>

      <!-- Recent pages -->
      <div v-if="recentPages.length" class="mt-16 w-full max-w-2xl">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent pages</h2>
        <div class="grid gap-2">
          <router-link
            v-for="page in recentPages"
            :key="page.id"
            :to="{ name: 'Page', params: { id: page.id } }"
            class="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
          >
            <span class="text-2xl flex-shrink-0">{{ page.icon || '📄' }}</span>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 truncate">{{ page.title || 'Untitled' }}</p>
              <p class="text-xs text-gray-400 mt-0.5">
                {{ formatDate(page.updatedAt) }}
              </p>
            </div>
            <svg class="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>
      </div>
    </div>

    <SearchModal v-model="searchOpen" />
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { usePagesStore } from '@/stores/pages.js'
import AppLayout from '@/components/layout/AppLayout.vue'
import SearchModal from '@/components/ui/SearchModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const pagesStore = usePagesStore()

const creating = ref(false)
const searchOpen = ref(false)

const userName = computed(() => authStore.user?.username || 'there')

const recentPages = computed(() => {
  const allPages = []
  const flatten = (pages) => {
    pages.forEach(p => {
      allPages.push(p)
      if (p.children) flatten(p.children)
    })
  }
  flatten(pagesStore.pages)
  return allPages
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6)
})

async function createPage() {
  creating.value = true
  try {
    const page = await pagesStore.createPage()
    router.push({ name: 'Page', params: { id: page.id } })
  } finally {
    creating.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>