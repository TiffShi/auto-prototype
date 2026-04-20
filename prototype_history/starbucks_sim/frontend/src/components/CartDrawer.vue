<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex justify-end">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="close" />

        <!-- Drawer -->
        <div class="relative bg-white w-full max-w-md h-full flex flex-col shadow-2xl z-10">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="text-xl font-black text-starbucks-brown">
              Your Order
              <span v-if="cartStore.itemCount > 0" class="text-starbucks-green ml-1">
                ({{ cartStore.itemCount }})
              </span>
            </h2>
            <button
              @click="close"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Empty state -->
          <div v-if="cartStore.isEmpty" class="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div class="text-6xl mb-4">🛒</div>
            <h3 class="text-lg font-bold text-starbucks-brown mb-2">Your cart is empty</h3>
            <p class="text-gray-500 text-sm mb-6">Add some drinks to get started!</p>
            <button @click="goToMenu" class="btn-primary">Browse Menu</button>
          </div>

          <!-- Cart items -->
          <div v-else class="flex-1 overflow-y-auto px-4 py-2">
            <CartItem
              v-for="item in cartStore.items"
              :key="item.cartItemId"
              :item="item"
              @update-quantity="cartStore.updateQuantity(item.cartItemId, $event)"
              @remove="cartStore.removeItem(item.cartItemId)"
            />
          </div>

          <!-- Footer -->
          <div v-if="!cartStore.isEmpty" class="border-t border-gray-100 px-6 py-4 space-y-4">
            <!-- Subtotal -->
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Subtotal</span>
              <span class="font-bold text-starbucks-brown text-lg">
                ${{ cartStore.subtotal.toFixed(2) }}
              </span>
            </div>

            <!-- Actions -->
            <div class="space-y-2">
              <button @click="goToCheckout" class="btn-primary w-full py-3 text-base">
                Proceed to Checkout
              </button>
              <button @click="goToCart" class="btn-secondary w-full py-2.5 text-sm">
                View Full Cart
              </button>
            </div>

            <!-- Clear cart -->
            <button
              @click="confirmClear"
              class="w-full text-center text-xs text-red-400 hover:text-red-600 transition-colors py-1"
            >
              Clear cart
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart.js'
import CartItem from './CartItem.vue'

const cartStore = useCartStore()
const router = useRouter()
const isOpen = ref(false)

function open() { isOpen.value = true }
function close() { isOpen.value = false }

function handleToggle() {
  isOpen.value = !isOpen.value
}

onMounted(() => {
  window.addEventListener('toggle-cart', handleToggle)
})

onUnmounted(() => {
  window.removeEventListener('toggle-cart', handleToggle)
})

function goToMenu() {
  close()
  router.push('/menu')
}

function goToCart() {
  close()
  router.push('/cart')
}

function goToCheckout() {
  close()
  router.push('/checkout')
}

function confirmClear() {
  if (confirm('Remove all items from your cart?')) {
    cartStore.clearCart()
  }
}
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.3s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from .relative,
.drawer-leave-to .relative {
  transform: translateX(100%);
}
</style>