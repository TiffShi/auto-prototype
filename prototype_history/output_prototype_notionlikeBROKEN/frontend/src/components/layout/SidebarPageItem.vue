<template>
  <div>
    <div
      :class="[
        'group flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer transition-colors relative',
        isActive ? 'bg-gray-200' : 'hover:bg-gray-100'
      ]"
      :style="{ paddingLeft: `${8 + depth * 16}px` }"
      @click="navigateTo"
      @contextmenu.prevent="showContextMenu"
    >
      <!-- Expand toggle -->
      <button
        @click.stop="toggleExpand"
        class="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400"
      >
        <svg
          v-if="hasChildren || page.hasChildren"
          :class="['w-3 h-3 transition-transform', isExpanded ? 'rotate-90' : '']"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Icon -->
      <span class="flex-shrink-0 text-base leading-none">
        {{ page.icon || '📄' }}
      </span>

      <!-- Title -->
      <span class="flex-1 text-sm text-gray-700 truncate min-w-0">
        {{ page.title || 'Untitled' }}
      </span>

      <!-- Actions (visible on hover) -->
      <div class="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
        <button
          @click.stop="createSubPage"
          class="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
          title="Add sub-page"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          @click.stop="showContextMenu"
          class="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
          title="More options"
        >
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Children -->
    <div v-if="isExpanded && children.length">
      <SidebarPageItem
        v-for="child in children"
        :key="child.id"
        :page="child"
        :depth="depth + 1"
      />
    </div>

    <!-- Context Menu -->
    <ContextMenu
      :visible="contextMenuVisible"
      :x="contextMenuX"
      :y="contextMenuY"
      :items="contextMenuItems"
      @close="contextMenuVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePagesStore } from '@/stores/pages.js'
import ContextMenu from '@/components/ui/ContextMenu.vue'

const props = defineProps({
  page: {
    type: Object,
    required: true
  },
  depth: {
    type: Number,
    default: 0
  }
})

const router = useRouter()
const route = useRoute()
const pagesStore = usePagesStore()

const isExpanded = ref(false)
const children = ref(props.page.children || [])
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)

const isActive = computed(() => route.params.id === props.page.id)
const hasChildren = computed(() => children.value.length > 0)

watch(() => props.page.children, (val) => {
  if (val) children.value = val
})

async function toggleExpand() {
  if (!isExpanded.value && (props.page.hasChildren || hasChildren.value)) {
    const fetched = await pagesStore.fetchChildPages(props.page.id)
    children.value = fetched
  }
  isExpanded.value = !isExpanded.value
}

function navigateTo() {
  router.push({ name: 'Page', params: { id: props.page.id } })
}

async function createSubPage() {
  const newPage = await pagesStore.createPage({ parentId: props.page.id })
  if (!isExpanded.value) {
    isExpanded.value = true
  }
  const fetched = await pagesStore.fetchChildPages(props.page.id)
  children.value = fetched
  router.push({ name: 'Page', params: { id: newPage.id } })
}

function showContextMenu(event) {
  if (event instanceof MouseEvent) {
    contextMenuX.value = event.clientX
    contextMenuY.value = event.clientY
  }
  contextMenuVisible.value = true
}

const contextMenuItems = computed(() => [
  {
    label: 'Open page',
    icon: '📄',
    action: navigateTo
  },
  {
    label: 'Add sub-page',
    icon: '➕',
    action: createSubPage
  },
  { divider: true },
  {
    label: 'Delete',
    icon: '🗑️',
    danger: true,
    action: async () => {
      await pagesStore.deletePage(props.page.id)
      if (isActive.value) {
        router.push({ name: 'Home' })
      }
    }
  }
])
</script>