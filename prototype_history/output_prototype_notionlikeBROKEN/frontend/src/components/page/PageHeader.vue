<template>
  <div class="relative">
    <!-- Cover Image -->
    <div
      v-if="page.coverUrl"
      class="w-full h-48 bg-cover bg-center relative group"
      :style="{ backgroundImage: `url(${page.coverUrl})` }"
    >
      <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <button
        @click="removeCover"
        class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white text-gray-600 text-xs px-2 py-1 rounded shadow"
      >
        Remove cover
      </button>
    </div>

    <!-- Page header content -->
    <div
      :class="[
        'px-16 pt-8 pb-4',
        !page.coverUrl ? 'pt-16' : 'pt-6'
      ]"
    >
      <!-- Icon area -->
      <div class="relative group/icon mb-3">
        <button
          v-if="page.icon"
          @click="showEmojiPicker = !showEmojiPicker"
          class="text-5xl leading-none hover:opacity-80 transition-opacity"
          title="Change icon"
        >
          {{ page.icon }}
        </button>

        <!-- Add icon / cover buttons (shown on hover when no icon) -->
        <div v-if="!page.icon" class="flex items-center gap-2 opacity-0 group-hover/icon:opacity-100 transition-opacity">
          <button
            @click="showEmojiPicker = !showEmojiPicker"
            class="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
          >
            😊 Add icon
          </button>
          <button
            v-if="!page.coverUrl"
            @click="addCover"
            class="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
          >
            🖼️ Add cover
          </button>
        </div>

        <!-- Emoji Picker -->
        <div
          v-if="showEmojiPicker"
          class="absolute top-full left-0 mt-2 z-20"
          v-click-outside="() => showEmojiPicker = false"
        >
          <EmojiPicker @select="handleIconSelect" />
        </div>
      </div>

      <!-- Title -->
      <div class="relative">
        <textarea
          ref="titleRef"
          v-model="localTitle"
          @input="handleTitleInput"
          @keydown.enter.prevent="$emit('focus-editor')"
          placeholder="Untitled"
          rows="1"
          class="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 bg-transparent border-none outline-none resize-none overflow-hidden leading-tight"
          style="min-height: 52px;"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { usePagesStore } from '@/stores/pages.js'
import { useAutoSave } from '@/composables/useAutoSave.js'
import EmojiPicker from '@/components/ui/EmojiPicker.vue'

const props = defineProps({
  page: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['focus-editor', 'updated'])

const pagesStore = usePagesStore()
const titleRef = ref(null)
const localTitle = ref(props.page.title || '')
const showEmojiPicker = ref(false)

watch(() => props.page.title, (val) => {
  if (val !== localTitle.value) localTitle.value = val
})

const { triggerSave } = useAutoSave(async (title) => {
  await pagesStore.updatePage(props.page.id, { title })
  emit('updated')
}, 800)

function handleTitleInput() {
  autoResize()
  triggerSave(localTitle.value)
}

function autoResize() {
  if (titleRef.value) {
    titleRef.value.style.height = 'auto'
    titleRef.value.style.height = titleRef.value.scrollHeight + 'px'
  }
}

onMounted(() => {
  nextTick(autoResize)
})

async function handleIconSelect(emoji) {
  showEmojiPicker.value = false
  await pagesStore.updatePage(props.page.id, { icon: emoji || '' })
  emit('updated')
}

async function addCover() {
  const covers = [
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80',
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'
  ]
  const randomCover = covers[Math.floor(Math.random() * covers.length)]
  await pagesStore.updatePage(props.page.id, { coverUrl: randomCover })
  emit('updated')
}

async function removeCover() {
  await pagesStore.updatePage(props.page.id, { coverUrl: '' })
  emit('updated')
}

// Click outside directive
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (e) => {
      if (!el.contains(e.target)) binding.value(e)
    }
    document.addEventListener('mousedown', el._clickOutside)
  },
  unmounted(el) {
    document.removeEventListener('mousedown', el._clickOutside)
  }
}
</script>