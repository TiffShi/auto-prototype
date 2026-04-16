<template>
  <AppLayout>
    <div class="max-w-3xl mx-auto px-8 py-12">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Trash
          </h1>
          <p class="text-gray-400 text-sm mt-1">Pages you've deleted</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="pagesStore.loading" class="flex items-center justify-center py-20">
        <div class="animate-spin w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full" />
      </div>

      <!-- Empty state -->
      <div v-else-if="!pagesStore.trashedPages.length" class="text-center py-20">
        <div class="text-5xl mb-4">🗑️</div>
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Trash is empty</h2>
        <p class="text-gray-400 text-sm">Pages you delete will appear here</p>
      </div>

      <!-- Trashed pages -->
      <div v-else class="space-y-2">
        <div
          v-for="page in pagesStore.trashedPages"
          :key="page.id"
          class="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all group"
        >
          <span class="text-2xl flex-shrink-0">{{ page.icon || '📄' }}</span>

          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-900 truncate">{{ page.title || 'Untitled' }}</p>
            <p class="text-xs text-gray-400 mt-0.5">
              Deleted {{ formatDate(page.updatedAt) }}
            </p>
          </div>

          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              @click="restorePage(page.id)"
              :disabled="restoringId === page.id"
              class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Restore
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePagesStore } from '@/stores/pages.js'
import AppLayout from '@/components/layout/AppLayout.vue'

const pagesStore = usePagesStore()
const restoringId = ref(null)

onMounted(async () => {
  await pagesStore.fetchTrashedPages()
})

async function restorePage(id) {
  restoringId.value = id
  try {
    await pagesStore.restorePage(id)
  } finally {
    restoringId.value = null
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>