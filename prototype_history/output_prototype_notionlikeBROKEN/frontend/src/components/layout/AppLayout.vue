<template>
  <div class="flex h-screen overflow-hidden bg-white">
    <!-- Sidebar -->
    <Sidebar
      :is-collapsed="sidebarCollapsed"
      @toggle-collapse="sidebarCollapsed = true"
      @open-search="searchOpen = true"
    />

    <!-- Main content -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <TopBar
        :is-sidebar-collapsed="sidebarCollapsed"
        @toggle-sidebar="sidebarCollapsed = false"
        @open-search="searchOpen = true"
      />

      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>

    <!-- Search Modal -->
    <SearchModal v-model="searchOpen" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from './Sidebar.vue'
import TopBar from './TopBar.vue'
import SearchModal from '@/components/ui/SearchModal.vue'
import { usePagesStore } from '@/stores/pages.js'

const pagesStore = usePagesStore()
const sidebarCollapsed = ref(false)
const searchOpen = ref(false)

onMounted(async () => {
  await pagesStore.fetchRootPages()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

function handleKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    searchOpen.value = !searchOpen.value
  }
}
</script>