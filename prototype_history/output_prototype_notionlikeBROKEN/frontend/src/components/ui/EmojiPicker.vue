<template>
  <div class="bg-white rounded-xl shadow-xl border border-gray-100 p-3 w-72">
    <input
      v-model="search"
      type="text"
      placeholder="Search emoji..."
      class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 mb-3"
    />
    <div class="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
      <button
        v-for="emoji in filteredEmojis"
        :key="emoji"
        @click="$emit('select', emoji)"
        class="w-8 h-8 flex items-center justify-center text-xl rounded hover:bg-gray-100 transition-colors"
        :title="emoji"
      >
        {{ emoji }}
      </button>
    </div>
    <div class="mt-2 pt-2 border-t border-gray-100 flex gap-2">
      <button
        @click="$emit('select', null)"
        class="flex-1 text-xs text-gray-500 hover:text-gray-700 py-1 hover:bg-gray-50 rounded transition-colors"
      >
        Remove icon
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineEmits(['select'])

const search = ref('')

const emojis = [
  '📄', '📝', '📋', '📌', '📍', '🗒️', '🗓️', '📅', '📆', '📊',
  '📈', '📉', '📁', '📂', '🗂️', '🗃️', '🗄️', '📦', '📫', '📬',
  '💡', '🔍', '🔎', '🔑', '🔒', '🔓', '⚙️', '🛠️', '🔧', '🔨',
  '💻', '🖥️', '📱', '⌨️', '🖱️', '🖨️', '📡', '🔋', '💾', '💿',
  '🎯', '🎨', '🎭', '🎬', '🎤', '🎵', '🎶', '🎸', '🎹', '🎺',
  '🌟', '⭐', '✨', '💫', '🌙', '☀️', '🌈', '⚡', '🔥', '💧',
  '🌱', '🌿', '🍀', '🌸', '🌺', '🌻', '🌹', '🍁', '🍂', '🍃',
  '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏧', '🏨', '🏩',
  '🚀', '✈️', '🚂', '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😒', '😞', '😔',
  '📚', '📖', '📗', '📘', '📙', '📕', '📓', '📔', '📒', '📃',
  '🏆', '🥇', '🥈', '🥉', '🎖️', '🏅', '🎗️', '🎫', '🎟️', '🎪'
]

const filteredEmojis = computed(() => {
  if (!search.value) return emojis
  return emojis.filter(e => e.includes(search.value))
})
</script>