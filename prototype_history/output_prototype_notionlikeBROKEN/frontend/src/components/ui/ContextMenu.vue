<template>
  <Teleport to="body">
    <Transition name="slide">
      <div
        v-if="visible"
        ref="menuRef"
        class="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-100 py-1 min-w-[180px]"
        :style="{ top: `${y}px`, left: `${x}px` }"
      >
        <template v-for="item in items" :key="item.label">
          <div v-if="item.divider" class="my-1 border-t border-gray-100" />
          <button
            v-else
            @click="handleClick(item)"
            :class="[
              'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left',
              item.danger
                ? 'text-red-600 hover:bg-red-50'
                : 'text-gray-700 hover:bg-gray-50'
            ]"
          >
            <span v-if="item.icon" class="text-base">{{ item.icon }}</span>
            {{ item.label }}
          </button>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  visible: Boolean,
  x: Number,
  y: Number,
  items: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'select'])
const menuRef = ref(null)

function handleClick(item) {
  if (item.action) item.action()
  emit('select', item)
  emit('close')
}

function handleOutsideClick(e) {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick)
  document.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
  document.removeEventListener('keydown', handleEsc)
})

function handleEsc(e) {
  if (e.key === 'Escape') emit('close')
}
</script>