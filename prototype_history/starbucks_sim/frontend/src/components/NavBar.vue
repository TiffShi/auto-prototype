<template>
  <nav class="bg-starbucks-dark-green text-white sticky top-0 z-40 shadow-lg">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div class="w-8 h-8 bg-starbucks-green rounded-full flex items-center justify-center text-lg">
            ☕
          </div>
          <span class="font-black text-xl tracking-tight">Starbucks</span>
        </RouterLink>

        <!-- Desktop Nav Links -->
        <div class="hidden md:flex items-center gap-6">
          <RouterLink
            to="/"
            class="text-sm font-medium hover:text-starbucks-light-green transition-colors"
            :class="{ 'text-starbucks-light-green': $route.name === 'Home' }"
          >
            Home
          </RouterLink>
          <RouterLink
            to="/menu"
            class="text-sm font-medium hover:text-starbucks-light-green transition-colors"
            :class="{ 'text-starbucks-light-green': $route.name === 'Menu' }"
          >
            Menu
          </RouterLink>
          <RouterLink
            v-if="authStore.isAuthenticated"
            to="/orders"
            class="text-sm font-medium hover:text-starbucks-light-green transition-colors"
            :class="{ 'text-starbucks-light-green': $route.name === 'OrderHistory' }"
          >
            My Orders
          </RouterLink>
          <RouterLink
            v-if="authStore.isAdmin"
            to="/admin"
            class="text-sm font-medium hover:text-starbucks-gold transition-colors text-starbucks-gold"
          >
            Admin
          </RouterLink>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-3">
          <!-- Cart Button -->
          <button
            @click="toggleCart"
            class="relative p-2 hover:bg-starbucks-green rounded-full transition-colors"
            aria-label="Open cart"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span
              v-if="cartStore.itemCount > 0"
              class="absolute -top-1 -right-1 bg-starbucks-gold text-starbucks-dark-green text-xs font-black w-5 h-5 rounded-full flex items-center justify-center"
            >
              {{ cartStore.itemCount > 9 ? '9+' : cartStore.itemCount }}
            </span>
          </button>

          <!-- Auth buttons -->
          <template v-if="!authStore.isAuthenticated">
            <RouterLink to="/login" class="btn-ghost text-white hover:bg-starbucks-green text-sm">
              Sign In
            </RouterLink>
            <RouterLink to="/register" class="hidden sm:block btn-primary text-sm py-2">
              Join Now
            </RouterLink>
          </template>

          <!-- User menu -->
          <div v-else class="relative" ref="userMenuRef">
            <button
              @click="userMenuOpen = !userMenuOpen"
              class="flex items-center gap-2 hover:bg-starbucks-green px-3 py-1.5 rounded-full transition-colors"
            >
              <div class="w-7 h-7 bg-starbucks-green rounded-full flex items-center justify-center text-sm font-bold">
                {{ authStore.userName.charAt(0).toUpperCase() }}
              </div>
              <span class="hidden sm:block text-sm font-medium">{{ authStore.userName }}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown -->
            <Transition name="dropdown">
              <div
                v-if="userMenuOpen"
                class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-50 border border-gray-100"
              >
                <RouterLink
                  to="/orders"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-starbucks-light-green"
                  @click="userMenuOpen = false"
                >
                  My Orders
                </RouterLink>
                <RouterLink
                  v-if="authStore.isAdmin"
                  to="/admin"
                  class="block px-4 py-2 text-sm text-starbucks-green font-medium hover:bg-starbucks-light-green"
                  @click="userMenuOpen = false"
                >
                  Admin Panel
                </RouterLink>
                <hr class="my-1" />
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            </Transition>
          </div>

          <!-- Mobile menu button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 hover:bg-starbucks-green rounded-full transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <Transition name="slide-down">
        <div v-if="mobileMenuOpen" class="md:hidden pb-4 border-t border-starbucks-green mt-1 pt-3">
          <div class="flex flex-col gap-2">
            <RouterLink to="/" class="text-sm font-medium py-2 hover:text-starbucks-light-green" @click="mobileMenuOpen = false">Home</RouterLink>
            <RouterLink to="/menu" class="text-sm font-medium py-2 hover:text-starbucks-light-green" @click="mobileMenuOpen = false">Menu</RouterLink>
            <RouterLink v-if="authStore.isAuthenticated" to="/orders" class="text-sm font-medium py-2 hover:text-starbucks-light-green" @click="mobileMenuOpen = false">My Orders</RouterLink>
            <RouterLink v-if="authStore.isAdmin" to="/admin" class="text-sm font-medium py-2 text-starbucks-gold" @click="mobileMenuOpen = false">Admin</RouterLink>
            <template v-if="!authStore.isAuthenticated">
              <RouterLink to="/login" class="text-sm font-medium py-2 hover:text-starbucks-light-green" @click="mobileMenuOpen = false">Sign In</RouterLink>
              <RouterLink to="/register" class="text-sm font-medium py-2 hover:text-starbucks-light-green" @click="mobileMenuOpen = false">Join Now</RouterLink>
            </template>
          </div>
        </div>
      </Transition>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { onClickOutside } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth.js'
import { useCartStore } from '@/stores/cart.js'

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

const userMenuOpen = ref(false)
const mobileMenuOpen = ref(false)
const userMenuRef = ref(null)
const cartOpen = ref(false)

onClickOutside(userMenuRef, () => {
  userMenuOpen.value = false
})

function toggleCart() {
  // Emit event to open cart drawer
  window.dispatchEvent(new CustomEvent('toggle-cart'))
}

function handleLogout() {
  authStore.logout()
  userMenuOpen.value = false
  router.push('/')
}
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>