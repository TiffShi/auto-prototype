<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-starbucks-dark-green text-white py-20 px-4 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-10 text-9xl">☕</div>
        <div class="absolute bottom-10 right-10 text-9xl">🍵</div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl">🥤</div>
      </div>
      <div class="max-w-4xl mx-auto text-center relative z-10">
        <p class="text-starbucks-light-green text-sm font-medium tracking-widest uppercase mb-4">
          Welcome to
        </p>
        <h1 class="text-5xl md:text-7xl font-black mb-6 leading-tight">
          Starbucks<br />
          <span class="text-starbucks-gold">Order App</span>
        </h1>
        <p class="text-starbucks-light-green text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          Craft your perfect drink. Order ahead. Skip the line.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink to="/menu" class="btn-primary text-lg px-10 py-4">
            Order Now
          </RouterLink>
          <RouterLink
            v-if="!authStore.isAuthenticated"
            to="/register"
            class="btn-secondary text-lg px-10 py-4 border-white text-white hover:bg-white/10"
          >
            Join Rewards
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Featured Drinks -->
    <section class="max-w-7xl mx-auto px-4 py-16">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-3xl font-black text-starbucks-brown">Featured Drinks</h2>
          <p class="text-gray-500 mt-1">Our most popular picks</p>
        </div>
        <RouterLink to="/menu" class="btn-ghost hidden sm:flex items-center gap-1">
          View all
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </RouterLink>
      </div>

      <!-- Loading -->
      <div v-if="menuStore.loading" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="card h-64 animate-pulse bg-gray-100" />
      </div>

      <!-- Drinks grid -->
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <DrinkCard
          v-for="drink in featuredDrinks"
          :key="drink.id"
          :drink="drink"
        />
      </div>

      <div class="text-center mt-8 sm:hidden">
        <RouterLink to="/menu" class="btn-secondary">View All Drinks</RouterLink>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="bg-white py-16 px-4">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-3xl font-black text-starbucks-brown mb-8 text-center">Browse by Category</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <RouterLink
            v-for="cat in menuStore.categories"
            :key="cat.id"
            :to="`/menu?category=${cat.id}`"
            class="card p-6 text-center hover:border-starbucks-green border border-transparent group"
          >
            <div class="text-4xl mb-3">{{ categoryEmoji(cat.name) }}</div>
            <p class="font-bold text-starbucks-brown text-sm group-hover:text-starbucks-green transition-colors">
              {{ cat.name }}
            </p>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Why Order Online -->
    <section class="max-w-7xl mx-auto px-4 py-16">
      <h2 class="text-3xl font-black text-starbucks-brown mb-10 text-center">Why Order Online?</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="w-16 h-16 bg-starbucks-light-green rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            ⚡
          </div>
          <h3 class="font-bold text-starbucks-brown text-lg mb-2">Skip the Line</h3>
          <p class="text-gray-500 text-sm">Order ahead and pick up when it's ready. No waiting.</p>
        </div>
        <div class="text-center">
          <div class="w-16 h-16 bg-starbucks-light-green rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            🎨
          </div>
          <h3 class="font-bold text-starbucks-brown text-lg mb-2">Fully Customizable</h3>
          <p class="text-gray-500 text-sm">Choose your size, milk, and extras exactly how you like it.</p>
        </div>
        <div class="text-center">
          <div class="w-16 h-16 bg-starbucks-light-green rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            📱
          </div>
          <h3 class="font-bold text-starbucks-brown text-lg mb-2">Track Your Order</h3>
          <p class="text-gray-500 text-sm">Real-time status updates from pending to ready.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import DrinkCard from '@/components/DrinkCard.vue'
import { useMenuStore } from '@/stores/menu.js'
import { useAuthStore } from '@/stores/auth.js'

const menuStore = useMenuStore()
const authStore = useAuthStore()

const featuredDrinks = computed(() => menuStore.drinks.slice(0, 8))

onMounted(async () => {
  await Promise.all([
    menuStore.fetchCategories(),
    menuStore.fetchDrinks()
  ])
})

function categoryEmoji(name) {
  const map = {
    'Hot Coffees': '☕',
    'Cold Brews': '🧊',
    'Teas': '🍵',
    'Refreshers': '🍹',
    'Frappuccinos': '🥤'
  }
  return map[name] || '☕'
}
</script>