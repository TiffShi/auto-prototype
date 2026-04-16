<template>
  <Modal v-model="isOpen" :max-width="'640px'">
    <template #header>
      <div class="flex items-center gap-3 w-full">
        <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref="searchInput"
          v-model="query"
          @input="handleSearch"
          type="text"
          placeholder="Search pages..."
          class="flex-1 text-base outline-none text-gray-900 placeholder-gray-400"
        />
        <kbd class="hidden sm:inline-flex items-center px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded">Esc</kbd>
      </div>
    </template>

    <div class="p-2 min-h-[200px]">
      <!-- Loading -->
      <div v-if="searching" class="flex items-center justify-center py-12">
        <div class="animate-spin w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full" />
      </div>

      <!-- Empty state -->
      <div v-else-if="query && !results.length" class="flex flex-col items-center justify-center py-12 text-gray-400">
        <svg class="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm">No pages found for "{{ query }}"</p>
      </div>

      <!-- Initial state -->
      <div v-else-if="!query" class="flex flex-col items-center justify-center py-12 text-gray-400">
        <p class="text-sm">Type to search your pages</p>
      </div>

      <!-- Results -->
      <div v-else class="space-y-0.5">
        <button
          v-for="page in results"
          :key="page.id"
          @click="navigateTo(page)"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group"
        >
          <span class="text-xl flex-shrink-0">{{ page.icon || '📄' }}</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ page.title || 'Untitled' }}</p>
          </div>
          <svg class="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePagesStore } from '@/stores/pages.js'
import Modal from './Modal.vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const router = useRouter()
const pagesStore = usePagesStore()

const isOpen = ref(props.modelValue)
const query = ref('')
const results = ref([])
const searching = ref(false)
const searchInput = ref(null)

let searchTimeout = null

watch(() => props.modelValue, (val) => {
  isOpen.value = val
  if (val) {
    query.value = ''
    results.value = []
    nextTick(() => searchInput.value?.focus())
  }
})

watch(isOpen, (val) => {
  emit('update:modelValue', val)
})

function handleSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (!query.value.trim()) {
    results.value = []
    return
  }
  searching.value = true
  searchTimeout = setTimeout(async () => {
    await pagesStore.searchPages(query.value)
    results.value = pagesStore.searchResults
    searching.value = false
  }, 300)
}

function navigateTo(page) {
  router.push({ name: 'Page', params: { id: page.id } })
  isOpen.value = false
}
</script>