<template>
  <div class="flex gap-3 py-4 border-b border-gray-100 last:border-0">
    <!-- Image -->
    <div class="w-14 h-14 bg-starbucks-light-green rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
      <img
        v-if="item.drinkImage && !imgError"
        :src="getMediaUrl(item.drinkImage)"
        :alt="item.drinkName"
        class="w-full h-full object-cover"
        @error="imgError = true"
      />
      <span v-else class="text-2xl">☕</span>
    </div>

    <!-- Details -->
    <div class="flex-1 min-w-0">
      <h4 class="font-bold text-starbucks-brown text-sm truncate">{{ item.drinkName }}</h4>
      <p v-if="item.modifiers?.length" class="text-xs text-gray-500 mt-0.5 line-clamp-2">
        {{ item.modifiers.map(m => m.name).join(', ') }}
      </p>
      <div class="flex items-center justify-between mt-2">
        <!-- Quantity controls -->
        <div class="flex items-center gap-2">
          <button
            @click="$emit('update-quantity', item.quantity - 1)"
            class="w-6 h-6 rounded-full border border-starbucks-green text-starbucks-green flex items-center justify-center hover:bg-starbucks-light-green transition-colors text-sm font-bold"
          >
            −
          </button>
          <span class="text-sm font-bold text-starbucks-brown w-4 text-center">{{ item.quantity }}</span>
          <button
            @click="$emit('update-quantity', item.quantity + 1)"
            class="w-6 h-6 rounded-full border border-starbucks-green text-starbucks-green flex items-center justify-center hover:bg-starbucks-light-green transition-colors text-sm font-bold"
          >
            +
          </button>
        </div>
        <!-- Price -->
        <span class="font-bold text-starbucks-green text-sm">
          ${{ (item.totalPrice * item.quantity).toFixed(2) }}
        </span>
      </div>
    </div>

    <!-- Remove -->
    <button
      @click="$emit('remove')"
      class="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors mt-1"
      aria-label="Remove item"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getMediaUrl } from '@/api/index.js'

defineProps({
  item: {
    type: Object,
    required: true
  }
})

defineEmits(['update-quantity', 'remove'])

const imgError = ref(false)
</script>