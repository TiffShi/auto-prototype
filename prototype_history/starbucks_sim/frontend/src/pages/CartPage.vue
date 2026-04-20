<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-4xl font-black text-starbucks-brown mb-8">Your Cart</h1>

    <!-- Empty cart -->
    <div v-if="cartStore.isEmpty" class="text-center py-20">
      <div class="text-8xl mb-6">🛒</div>
      <h2 class="text-2xl font-bold text-starbucks-brown mb-3">Your cart is empty</h2>
      <p class="text-gray-500 mb-8">Add some drinks to get started!</p>
      <RouterLink to="/menu" class="btn-primary text-lg px-10">Browse Menu</RouterLink>
    </div>

    <!-- Cart content -->
    <div v-else class="grid md:grid-cols-3 gap-8">
      <!-- Items list -->
      <div class="md:col-span-2 space-y-4">
        <div
          v-for="item in cartStore.items"
          :key="item.cartItemId"
          class="card p-5 flex gap-4"
        >
          <!-- Image -->
          <div class="w-20 h-20 bg-starbucks-light-green rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img
              v-if="item.drinkImage"
              :src="getMediaUrl(item.drinkImage)"
              :alt="item.drinkName"
              class="w-full h-full object-cover"
              @error="$event.target.style.display='none'"
            />
            <span class="text-3xl">☕</span>
          </div>

          <!-- Details -->
          <div class="flex-1">
            <h3 class="font-bold text-starbucks-brown text-lg">{{ item.drinkName }}</h3>
            <p v-if="item.modifiers?.length" class="text-sm text-gray-500 mt-1">
              {{ item.modifiers.map(m => m.name).join(' · ') }}
            </p>
            <p class="text-xs text-gray-400 mt-1">
              ${{ item.totalPrice.toFixed(2) }} each
            </p>

            <div class="flex items-center justify-between mt-3">
              <!-- Quantity -->
              <div class="flex items-center gap-3">
                <button
                  @click="cartStore.updateQuantity(item.cartItemId, item.quantity - 1)"
                  class="w-8 h-8 rounded-full border-2 border-starbucks-green text-starbucks-green flex items-center justify-center hover:bg-starbucks-light-green transition-colors font-bold"
                >
                  −
                </button>
                <span class="font-bold text-starbucks-brown text-lg w-6 text-center">{{ item.quantity }}</span>
                <button
                  @click="cartStore.updateQuantity(item.cartItemId, item.quantity + 1)"
                  class="w-8 h-8 rounded-full border-2 border-starbucks-green text-starbucks-green flex items-center justify-center hover:bg-starbucks-light-green transition-colors font-bold"
                >
                  +
                </button>
              </div>

              <!-- Item total -->
              <div class="flex items-center gap-3">
                <span class="font-bold text-starbucks-green text-lg">
                  ${{ (item.totalPrice * item.quantity).toFixed(2) }}
                </span>
                <button
                  @click="cartStore.removeItem(item.cartItemId)"
                  class="text-gray-300 hover:text-red-400 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Continue shopping -->
        <RouterLink to="/menu" class="flex items-center gap-2 text-starbucks-green hover:text-starbucks-dark-green font-medium text-sm mt-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Continue Shopping
        </RouterLink>
      </div>

      <!-- Order summary -->
      <div class="md:col-span-1">
        <div class="card p-6 sticky top-24">
          <h2 class="text-xl font-bold text-starbucks-brown mb-4">Order Summary</h2>

          <div class="space-y-3 mb-4">
            <div class="flex justify-between text-sm text-gray-600">
              <span>Subtotal ({{ cartStore.itemCount }} items)</span>
              <span>${{ cartStore.subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm text-gray-600">
              <span>Tax (8%)</span>
              <span>${{ (cartStore.subtotal * 0.08).toFixed(2) }}</span>
            </div>
            <hr class="border-gray-100" />
            <div class="flex justify-between font-bold text-starbucks-brown text-lg">
              <span>Total</span>
              <span>${{ (cartStore.subtotal * 1.08).toFixed(2) }}</span>
            </div>
          </div>

          <RouterLink
            v-if="authStore.isAuthenticated"
            to="/checkout"
            class="btn-primary w-full text-center block py-3 text-base"
          >
            Proceed to Checkout
          </RouterLink>
          <RouterLink
            v-else
            to="/login"
            class="btn-primary w-full text-center block py-3 text-base"
          >
            Sign In to Checkout
          </RouterLink>

          <button
            @click="cartStore.clearCart()"
            class="w-full text-center text-xs text-red-400 hover:text-red-600 transition-colors mt-3 py-1"
          >
            Clear cart
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cart.js'
import { useAuthStore } from '@/stores/auth.js'
import { getMediaUrl } from '@/api/index.js'

const cartStore = useCartStore()
const authStore = useAuthStore()
</script>