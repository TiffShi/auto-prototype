<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="$emit('update:modelValue', false)"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('update:modelValue', false)" />
        <div
          class="relative bg-white rounded-xl shadow-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          :style="{ maxWidth: maxWidth }"
        >
          <!-- Header -->
          <div v-if="title || $slots.header" class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <slot name="header">
              <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
            </slot>
            <button
              @click="$emit('update:modelValue', false)"
              class="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="overflow-y-auto flex-1">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  title: String,
  maxWidth: {
    type: String,
    default: '560px'
  }
})

defineEmits(['update:modelValue'])
</script>