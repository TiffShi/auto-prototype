<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <h1 class="text-4xl font-black text-starbucks-brown mb-8">Checkout</h1>

    <!-- Empty cart redirect -->
    <div v-if="cartStore.isEmpty" class="text-center py-20">
      <div class="text-6xl mb-4">🛒</div>
      <p class="text-gray-500 mb-6">Your cart is empty</p>
      <RouterLink to="/menu" class="btn-primary">Browse Menu</RouterLink>
    </div>

    <!-- Order review -->
    <div v-else class="space-y-6">
      <!-- Items -->
      <div class="card p-6">
        <h2 class="text-lg font-bold text-starbucks-brown mb-4">Order Review</h2>
        <div class="space-y-3">
          <div
            v-for="item in cartStore.items"
            :key="item.cartItemId"
            class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
          >
            <div>
              <p class="font-medium text-starbucks-brown">
                {{ item.quantity }}× {{ item.drinkName }}
              </p>
              <p v-if="item.modifiers?.length" class="text-xs text-gray-400 mt-0.5">
                {{ item.modifiers.map(m => m.name).join(', ') }}
              </p>
            </div>
            <span class="font-bold text-starbucks-green">
              ${{ (item.totalPrice * item.quantity).toFixed(2) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Pricing breakdown -->
      <div class="card p-6">
        <h2 class="text-lg font-bold text-starbucks-brown mb-4">Price Summary</h2>
        <div class="space-y-2">
          <div class="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${{ cartStore.subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>Tax (8%)</span>
            <span>${{ (cartStore.subtotal * 0.08).toFixed(2) }}</span>
          </div>
          <hr class="border-gray-100 my-2" />
          <div class="flex justify-between font-black text-starbucks-brown text-xl">
            <span>Total</span>
            <span>${{ (cartStore.subtotal * 1.08).toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Customer info -->
      <div class="card p-6">
        <h2 class="text-lg font-bold text-starbucks-brown mb-2">Ordering as</h2>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-starbucks-green rounded-full flex items-center justify-center text-white font-bold">
            {{ authStore.userName.charAt(0).toUpperCase() }}
          </div>
          <div>
            <p class="font-medium text-starbucks-brown">{{ authStore.userName }}</p>
            <p class="text-sm text-gray-500">{{ authStore.user?.email }}</p>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="orderStore.error" class="bg-red-50 border border-red-200 rounded-xl p-4">
        <p class="text-red-600 text-sm">{{ orderStore.error }}</p>
      </div>

      <!-- Place order button -->
      <button
        @click="handlePlaceOrder"
        :disabled="orderStore.loading"
        class="btn-primary w-full text-lg py-4"
      >
        <span v-if="orderStore.loading" class="flex items-center justify-center gap-2">
          <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Placing Order...
        </span>
        <span v-else>Place Order — ${{ (cartStore.subtotal * 1.08).toFixed(2) }}</span>
      </button>

      <RouterLink to="/cart" class="block text-center text-sm text-starbucks-green hover:underline">
        ← Back to Cart
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart.js'
import { useAuthStore } from '@/stores/auth.js'
import { useOrderStore } from '@/stores/order.js'

const cartStore = useCartStore()
const authStore = useAuthStore()
const orderStore = useOrderStore()
const router = useRouter()

async function handlePlaceOrder() {
  const payload = cartStore.toOrderPayload()
  const result = await orderStore.placeOrder(payload)
  if (result.success) {
    cartStore.clearCart()
    router.push(`/orders/${result.order.id}`)
  }
}
</script>