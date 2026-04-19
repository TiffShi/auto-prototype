<template>
  <header class="h-12 flex items-center gap-2 px-4 border-b border-notion-border bg-white flex-shrink-0">
    <!-- Sidebar toggle -->
    <button
      v-if="isSidebarCollapsed"
      @click="$emit('toggle-sidebar')"
      class="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
      title="Open sidebar"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
      </svg>
    </button>

    <!-- Breadcrumb -->
    <PageBreadcrumb v-if="currentPage" :page="currentPage" />

    <!-- Spacer -->
    <div class="flex-1" />

    <!-- Save indicator -->
    <Transition name="fade">
      <span v-if="editorStore.saving" class="text-xs text-gray-400 flex items-center gap-1">
        <div class="animate-spin w-3 h-3 border border-gray-300 border-t-gray-500 rounded-full" />
        Saving...
      </span>
    </Transition>

    <!-- Actions -->
    <div class="flex items-center gap-1">
      <button
        @click="$emit('open-search')"
        class="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        title="Search (⌘K)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { usePagesStore } from '@/stores/pages.js'
import { useEditorStore } from '@/stores/editor.js'
import PageBreadcrumb from '@/components/page/PageBreadcrumb.vue'

defineProps({
  isSidebarCollapsed: Boolean
})

defineEmits(['toggle-sidebar', 'open-search'])

const pagesStore = usePagesStore()
const editorStore = useEditorStore()

const currentPage = computed(() => pagesStore.currentPage)
</script>