<template>
  <AppLayout>
    <div v-if="pagesStore.loading && !currentPage" class="flex items-center justify-center min-h-full">
      <div class="animate-spin w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full" />
    </div>

    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-full py-20">
      <div class="text-5xl mb-4">😕</div>
      <h2 class="text-xl font-semibold text-gray-700 mb-2">Page not found</h2>
      <p class="text-gray-400 mb-6">This page may have been deleted or doesn't exist.</p>
      <router-link to="/" class="text-gray-600 hover:text-gray-900 underline text-sm">
        Go home
      </router-link>
    </div>

    <div v-else-if="currentPage" class="min-h-full">
      <!-- Page Header -->
      <PageHeader
        :page="currentPage"
        @focus-editor="focusEditor"
        @updated="refreshPage"
      />

      <!-- Block Editor -->
      <BlockEditor
        ref="blockEditorRef"
        :page-id="currentPage.id"
      />
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePagesStore } from '@/stores/pages.js'
import { useEditorStore } from '@/stores/editor.js'
import AppLayout from '@/components/layout/AppLayout.vue'
import PageHeader from '@/components/page/PageHeader.vue'
import BlockEditor from '@/components/editor/BlockEditor.vue'

const route = useRoute()
const router = useRouter()
const pagesStore = usePagesStore()
const editorStore = useEditorStore()

const blockEditorRef = ref(null)
const error = ref(false)

const currentPage = computed(() => pagesStore.currentPage)

async function loadPage(id) {
  error.value = false
  try {
    await pagesStore.fetchPage(id)
  } catch {
    error.value = true
  }
}

async function refreshPage() {
  if (route.params.id) {
    await pagesStore.fetchPage(route.params.id)
  }
}

watch(() => route.params.id, async (id) => {
  if (id) {
    editorStore.clearBlocks()
    await loadPage(id)
  }
}, { immediate: true })

function focusEditor() {
  // Focus first block or create one
}
</script>