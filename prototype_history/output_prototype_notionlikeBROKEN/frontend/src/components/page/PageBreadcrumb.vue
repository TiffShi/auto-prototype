<template>
  <nav class="flex items-center gap-1 text-sm text-gray-500 min-w-0">
    <template v-for="(crumb, index) in breadcrumbs" :key="crumb.id">
      <span v-if="index > 0" class="text-gray-300 flex-shrink-0">/</span>
      <router-link
        :to="{ name: 'Page', params: { id: crumb.id } }"
        :class="[
          'flex items-center gap-1 px-1 py-0.5 rounded hover:bg-gray-100 transition-colors truncate max-w-[150px]',
          index === breadcrumbs.length - 1 ? 'text-gray-800 font-medium' : 'text-gray-500 hover:text-gray-700'
        ]"
      >
        <span v-if="crumb.icon" class="text-sm flex-shrink-0">{{ crumb.icon }}</span>
        <span class="truncate">{{ crumb.title || 'Untitled' }}</span>
      </router-link>
    </template>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { usePagesStore } from '@/stores/pages.js'

const props = defineProps({
  page: {
    type: Object,
    required: true
  }
})

const pagesStore = usePagesStore()

const breadcrumbs = computed(() => {
  return pagesStore.getBreadcrumbs(props.page.id)
})
</script>