<template>
  <div
    class="card p-5 cursor-pointer hover:border-starbucks-green border border-transparent transition-all"
    @click="$router.push(`/orders/${order.id}`)"
  >
    <div class="flex items-start justify-between mb-3">
      <div>
        <p class="text-xs text-gray-400 font-medium">Order #{{ order.id }}</p>
        <p class="text-sm text-gray-500 mt-0.5">{{ formatDate(order.created_at) }}</p>
      </div>
      <OrderStatusBadge :status="order.status" />
    </div>

    <!-- Items preview -->
    <div class="space-y-1 mb-3">
      <p
        v-for="item in previewItems"
        :key="item.id"
        class="text-sm text-starbucks-brown"
      >
        <span class="font-medium">{{ item.quantity }}×</span>
        {{ item.drink?.name || `Drink #${item.drink_id}` }}
      </p>
      <p v-if="order.items?.length > 2" class="text-xs text-gray-400">
        +{{ order.items.length - 2 }} more item{{ order.items.length - 2 > 1 ? 's' : '' }}
      </p>
    </div>

    <div class="flex items-center justify-between">
      <span class="text-starbucks-green font-bold">
        ${{ parseFloat(order.total_price).toFixed(2) }}
      </span>
      <span class="text-xs text-starbucks-green font-medium flex items-center gap-1">
        View details
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import OrderStatusBadge from './OrderStatusBadge.vue'

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

const previewItems = computed(() => (props.order.items || []).slice(0, 2))

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>