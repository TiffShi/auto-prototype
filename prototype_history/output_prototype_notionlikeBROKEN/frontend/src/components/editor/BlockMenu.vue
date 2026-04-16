<template>
  <Teleport to="body">
    <Transition name="slide">
      <div
        v-if="visible"
        ref="menuRef"
        class="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-100 w-72 max-h-80 overflow-y-auto"
        :style="{ top: `${y}px`, left: `${x}px` }"
      >
        <div class="p-2">
          <p class="text-xs text-gray-400 px-2 py-1 font-medium uppercase tracking-wider">Basic blocks</p>
          <button
            v-for="item in filteredItems"
            :key="item.type"
            @click="selectItem(item)"
            class="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left group"
          >
            <div class="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-lg flex-shrink-0 group-hover:border-gray-300 transition-colors">
              {{ item.icon }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800">{{ item.label }}</p>
              <p class="text-xs text-gray-400 truncate">{{ item.description }}</p>
            </div>
          </button>

          <div v-if="!filteredItems.length" class="px-2 py-4 text-center text-sm text-gray-400">
            No blocks found
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  x: Number,
  y: Number,
  query: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select', 'close'])
const menuRef = ref(null)

const blockItems = [
  { type: 'paragraph', label: 'Text', icon: '📝', description: 'Just start writing with plain text' },
  { type: 'heading1', label: 'Heading 1', icon: 'H1', description: 'Big section heading' },
  { type: 'heading2', label: 'Heading 2', icon: 'H2', description: 'Medium section heading' },
  { type: 'heading3', label: 'Heading 3', icon: 'H3', description: 'Small section heading' },
  { type: 'bulletList', label: 'Bullet List', icon: '•', description: 'Create a simple bulleted list' },
  { type: 'orderedList', label: 'Numbered List', icon: '1.', description: 'Create a list with numbering' },
  { type: 'taskList', label: 'To-do List', icon: '☑️', description: 'Track tasks with a to-do list' },
  { type: 'blockquote', label: 'Quote', icon: '❝', description: 'Capture a quote' },
  { type: 'codeBlock', label: 'Code', icon: '</>', description: 'Capture a code snippet' },
  { type: 'horizontalRule', label: 'Divider', icon: '—', description: 'Visually divide blocks' }
]

const filteredItems = computed(() => {
  if (!props.query) return blockItems
  const q = props.query.toLowerCase()
  return blockItems.filter(item =>
    item.label.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q)
  )
})

function selectItem(item) {
  emit('select', item)
  emit('close')
}

function handleOutsideClick(e) {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    emit('close')
  }
}

function handleEsc(e) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick)
  document.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
  document.removeEventListener('keydown', handleEsc)
})
</script>