<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <!-- Back button -->
    <button
      @click="$router.back()"
      class="flex items-center gap-2 text-starbucks-green hover:text-starbucks-dark-green mb-6 font-medium"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back to Menu
    </button>

    <!-- Loading -->
    <div v-if="menuStore.loading" class="animate-pulse space-y-4">
      <div class="h-64 bg-gray-200 rounded-2xl" />
      <div class="h-8 bg-gray-200 rounded w-1/2" />
      <div class="h-4 bg-gray-200 rounded w-3/4" />
    </div>

    <!-- Error -->
    <div v-else-if="menuStore.error" class="text-center py-20">
      <div class="text-6xl mb-4">😕</div>
      <h3 class="text-xl font-bold text-starbucks-brown mb-2">Drink not found</h3>
      <RouterLink to="/menu" class="btn-primary">Back to Menu</RouterLink>
    </div>

    <!-- Drink detail -->
    <div v-else-if="drink" class="grid md:grid-cols-2 gap-8">
      <!-- Image -->
      <div class="bg-starbucks-light-green rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
        <img
          v-if="imageUrl && !imgError"
          :src="imageUrl"
          :alt="drink.name"
          class="w-full h-full object-cover"
          @error="imgError = true"
        />
        <span v-else class="text-9xl">{{ drinkEmoji }}</span>
      </div>

      <!-- Info -->
      <div class="flex flex-col">
        <span class="badge bg-starbucks-light-green text-starbucks-green w-fit mb-3">
          {{ drink.category?.name }}
        </span>
        <h1 class="text-3xl font-black text-starbucks-brown mb-3">{{ drink.name }}</h1>
        <p v-if="drink.description" class="text-gray-600 mb-6 leading-relaxed">
          {{ drink.description }}
        </p>

        <div class="flex items-center gap-2 mb-6">
          <span class="text-3xl font-black text-starbucks-green">
            ${{ parseFloat(drink.base_price).toFixed(2) }}
          </span>
          <span class="text-gray-400 text-sm">starting price</span>
        </div>

        <!-- Availability -->
        <div
          v-if="!drink.is_available"
          class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
        >
          <p class="text-red-600 font-medium text-sm">
            ⚠️ This drink is currently unavailable
          </p>
        </div>

        <!-- Modifier preview -->
        <div v-if="drink.modifiers?.length" class="mb-6">
          <h3 class="font-bold text-starbucks-brown mb-3">Customization Options</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="mod in drink.modifiers.slice(0, 8)"
              :key="mod.id"
              class="badge bg-gray-100 text-gray-600"
            >
              {{ mod.name }}
            </span>
            <span v-if="drink.modifiers.length > 8" class="badge bg-gray-100 text-gray-400">
              +{{ drink.modifiers.length - 8 }} more
            </span>
          </div>
        </div>

        <!-- Add to cart button -->
        <button
          v-if="drink.is_available"
          @click="showCustomizer = true"
          class="btn-primary text-lg py-4 mt-auto"
        >
          Customize & Add to Cart
        </button>
      </div>
    </div>

    <!-- Customizer Modal -->
    <DrinkCustomizer
      :show="showCustomizer"
      :drink="drink"
      @close="showCustomizer = false"
      @added="handleAdded"
    />

    <!-- Added toast -->
    <Transition name="toast">
      <div
        v-if="showToast"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-starbucks-green text-white px-6 py-3 rounded-full shadow-lg font-medium z-50 flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Added to cart!
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import DrinkCustomizer from '@/components/DrinkCustomizer.vue'
import { useMenuStore } from '@/stores/menu.js'
import { getMediaUrl } from '@/api/index.js'

const route = useRoute()
const menuStore = useMenuStore()

const showCustomizer = ref(false)
const showToast = ref(false)
const imgError = ref(false)

const drink = computed(() => menuStore.currentDrink)

const imageUrl = computed(() => {
  if (imgError.value || !drink.value?.image_url) return null
  return getMediaUrl(drink.value.image_url)
})

const drinkEmoji = computed(() => {
  const name = drink.value?.category?.name?.toLowerCase() || ''
  if (name.includes('frappuccino')) return '🥤'
  if (name.includes('tea')) return '🍵'
  if (name.includes('refresher')) return '🍹'
  if (name.includes('cold')) return '🧊'
  return '☕'
})

function handleAdded() {
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2500)
}

onMounted(async () => {
  await menuStore.fetchDrink(route.params.id)
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>