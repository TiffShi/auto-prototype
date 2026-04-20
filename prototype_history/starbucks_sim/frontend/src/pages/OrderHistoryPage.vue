<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-4xl font-black text-starbucks-brown">My Orders</h1>
        <p class="text-gray-500 mt-1">Your order history</p>
      </div>
      <RouterLink to="/menu" class="btn-secondary text-sm">Order Again</RouterLink>
    </div>

    <!-- Loading -->
    <div v-if="orderStore.loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="card h-32 animate-pulse bg-gray-100" />
    </div>

    <!-- Empty state -->
    <div v-else-if="orderStore.orders.length === 0" class="text-center py-20">
      <div class="text-8xl mb-6">📋</div>
      <h2 class="text-2xl font-bold text-starbucks-brown mb-3">No orders yet</h2>
      <p class="text-gray-500 mb-8">Your order history will appear here</p>
      <RouterLink to="/menu" class="btn-primary text-lg px-10">Start Ordering</RouterLink>
    </div>

    <!-- Orders list -->
    <div v-else class="space-y-4">
      <OrderHistoryCard
        v-for="order in orderStore.orders"
        :key="order.id"
        :order="order"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import OrderHistoryCard from '@/components/OrderHistoryCard.vue'
import { useOrderStore } from '@/stores/order.js'

const orderStore = useOrderStore()

onMounted(async () => {
  await orderStore.fetchOrders()
})
</script>