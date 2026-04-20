<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <!-- Back -->
    <RouterLink
      to="/orders"
      class="flex items-center gap-2 text-starbucks-green hover:text-starbucks-dark-green mb-6 font-medium"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back to Orders
    </RouterLink>

    <!-- Loading -->
    <div v-if="orderStore.loading" class="space-y-4 animate-pulse">
      <div class="h-8 bg-gray-200 rounded w-1/3" />
      <div class="card h-48 bg-gray-100" />
    </div>

    <!-- Error -->
    <div v-else-if="orderStore.error" class="text-center py-20">
      <div class="text-6xl mb-4">😕</div>
      <p class="text-gray-500">{{ orderStore.error }}</p>
    </div>

    <!-- Order detail -->
    <div v-else-if="order" class="space-y-6">
      <!-- Header -->
      <div class="card p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h1 class="text-2xl font-black text-starbucks-brown">Order #{{ order.id }}</h1>
            <p class="text-gray-500 text-sm mt-1">{{ formatDate(order.created_at) }}</p>
          </div>
          <OrderStatusBadge :status="order.status" />
        </div>

        <!-- Status progress -->
        <div class="mt-4">
          <div class="flex items-center justify-between mb-2">
            <div
              v-for="(step, idx) in statusSteps"
              :key="step.key"
              class="flex flex-col items-center flex-1"
            >
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                  isStepActive(step.key)
                    ? 'bg-starbucks-green text-white'
                    : isStepPast(step.key)
                    ? 'bg-starbucks-light-green text-starbucks-green'
                    : 'bg-gray-100 text-gray-400'
                ]"
              >
                {{ step.icon }}
              </div>
              <p class="text-xs mt-1 text-center" :class="isStepActive(step.key) ? 'text-starbucks-green font-bold' : 'text-gray-400'">
                {{ step.label }}
              </p>
            </div>
          </div>
          <!-- Progress line -->
          <div class="relative h-1 bg-gray-100 rounded-full mx-4 -mt-8 mb-8">
            <div
              class="absolute left-0 top-0 h-full bg-starbucks-green rounded-full transition-all duration-500"
              :style="{ width: progressWidth }"
            />
          </div>
        </div>

        <!-- Estimated time -->
        <div v-if="order.status === 'pending' || order.status === 'in_progress'" class="bg-starbucks-light-green/50 rounded-xl p-3 text-center">
          <p class="text-starbucks-green font-medium text-sm">
            ⏱ Estimated wait: 5–10 minutes
          </p>
        </div>
        <div v-else-if="order.status === 'ready'" class="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <p class="text-green-700 font-bold">
            🎉 Your order is ready! Please pick it up.
          </p>
        </div>
      </div>

      <!-- Items -->
      <div class="card p-6">
        <h2 class="text-lg font-bold text-starbucks-brown mb-4">Items Ordered</h2>
        <div class="space-y-4">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex items-start justify-between py-3 border-b border-gray-50 last:border-0"
          >
            <div class="flex-1">
              <p class="font-bold text-starbucks-brown">
                {{ item.quantity }}× {{ item.drink?.name || `Drink #${item.drink_id}` }}
              </p>
              <div v-if="item.modifiers?.length" class="mt-1 flex flex-wrap gap-1">
                <span
                  v-for="mod in item.modifiers"
                  :key="mod.modifier_id"
                  class="badge bg-gray-100 text-gray-500 text-xs"
                >
                  {{ mod.modifier?.name || `Modifier #${mod.modifier_id}` }}
                </span>
              </div>
            </div>
            <span class="font-bold text-starbucks-green ml-4">
              ${{ (parseFloat(item.unit_price) * item.quantity).toFixed(2) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Total -->
      <div class="card p-6">
        <div class="flex justify-between items-center">
          <span class="text-xl font-bold text-starbucks-brown">Total Paid</span>
          <span class="text-2xl font-black text-starbucks-green">
            ${{ parseFloat(order.total_price).toFixed(2) }}
          </span>
        </div>
      </div>

      <!-- Reorder button -->
      <button @click="handleReorder" class="btn-secondary w-full py-3">
        🔄 Reorder These Items
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import OrderStatusBadge from '@/components/OrderStatusBadge.vue'
import { useOrderStore } from '@/stores/order.js'
import { useCartStore } from '@/stores/cart.js'
import { useMenuStore } from '@/stores/menu.js'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const cartStore = useCartStore()
const menuStore = useMenuStore()

const order = computed(() => orderStore.currentOrder)

const statusSteps = [
  { key: 'pending', label: 'Pending', icon: '⏳' },
  { key: 'in_progress', label: 'Making', icon: '🔄' },
  { key: 'ready', label: 'Ready', icon: '✅' },
  { key: 'completed', label: 'Done', icon: '☕' }
]

const statusOrder = ['pending', 'in_progress', 'ready', 'completed']

function isStepActive(stepKey) {
  return order.value?.status === stepKey
}

function isStepPast(stepKey) {
  const currentIdx = statusOrder.indexOf(order.value?.status)
  const stepIdx = statusOrder.indexOf(stepKey)
  return stepIdx < currentIdx
}

const progressWidth = computed(() => {
  const idx = statusOrder.indexOf(order.value?.status)
  if (idx < 0) return '0%'
  return `${(idx / (statusOrder.length - 1)) * 100}%`
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function handleReorder() {
  if (!order.value?.items) return
  // Fetch drink details and re-add to cart
  for (const item of order.value.items) {
    const drink = await menuStore.fetchDrink(item.drink_id)
    if (drink) {
      const modifiers = (item.modifiers || [])
        .map((m) => m.modifier)
        .filter(Boolean)
      cartStore.addItem(drink, modifiers, item.quantity)
    }
  }
  router.push('/cart')
}

onMounted(async () => {
  await orderStore.fetchOrder(route.params.id)
})
</script>