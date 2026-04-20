<template>
  <div
    class="card cursor-pointer group overflow-hidden"
    @click="$router.push(`/menu/${drink.id}`)"
  >
    <!-- Image -->
    <div class="relative h-48 bg-starbucks-light-green overflow-hidden">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="drink.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        @error="imageError = true"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-6xl">
        {{ drinkEmoji }}
      </div>
      <!-- Category badge -->
      <span class="absolute top-2 left-2 badge bg-starbucks-green text-white text-xs">
        {{ drink.category?.name }}
      </span>
      <!-- Unavailable overlay -->
      <div
        v-if="!drink.is_available"
        class="absolute inset-0 bg-black/50 flex items-center justify-center"
      >
        <span class="text-white font-bold text-sm bg-black/70 px-3 py-1 rounded-full">
          Unavailable
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <h3 class="font-bold text-starbucks-brown text-base leading-tight mb-1 group-hover:text-starbucks-green transition-colors">
        {{ drink.name }}
      </h3>
      <p v-if="drink.description" class="text-gray-500 text-xs line-clamp-2 mb-3">
        {{ drink.description }}
      </p>
      <div class="flex items-center justify-between">
        <span class="text-starbucks-green font-bold text-lg">
          ${{ parseFloat(drink.base_price).toFixed(2) }}
        </span>
        <button
          v-if="drink.is_available"
          @click.stop="$router.push(`/menu/${drink.id}`)"
          class="bg-starbucks-green text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-starbucks-dark-green transition-colors"
          aria-label="Customize and add"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getMediaUrl } from '@/api/index.js'

const props = defineProps({
  drink: {
    type: Object,
    required: true
  }
})

const imageError = ref(false)

const imageUrl = computed(() => {
  if (imageError.value || !props.drink.image_url) return null
  return getMediaUrl(props.drink.image_url)
})

const drinkEmoji = computed(() => {
  const name = props.drink.category?.name?.toLowerCase() || ''
  if (name.includes('frappuccino')) return '🥤'
  if (name.includes('tea')) return '🍵'
  if (name.includes('refresher')) return '🍹'
  if (name.includes('cold')) return '🧊'
  return '☕'
})
</script>