<template>
  <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
      <h3 class="text-lg font-bold text-starbucks-brown">All Orders</h3>
      <button @click="$emit('refresh')" class="btn-ghost text-sm">
        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>
    </div>

    <div v-if="loading" class="p-8 text-center text-gray-400">Loading orders...</div>

    <div v-else-if="orders.length === 0" class="p-8 text-center text-gray-400">
      No orders yet.
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
          <tr>
            <th class="px-6 py-3 text-left">Order ID</th>
            <th class="px-6 py-3 text-left">Customer</th>
            <th class="px-6 py-3 text-left">Items</th>
            <th class="px-6 py-3 text-left">Total</th>
            <th class="px-6 py-3 text-left">Date</th>
            <th class="px-6 py-3 text-left">Status</th>
            <th class="px-6 py-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 font-mono font-bold text-starbucks-brown">#{{ order.id }}</td>
            <td class="px-6 py-4 text-gray-600">User #{{ order.user_id }}</td>
            <td class="px-6 py-4 text-gray-600">{{ order.items?.length || 0 }} item(s)</td>
            <td class="px-6 py-4 font-bold text-starbucks-green">
              ${{ parseFloat(order.total_price).toFixed(2) }}
            </td>
            <td class="px-6 py-4 text-gray-500 text-xs">{{ formatDate(order.created_at) }}</td>
            <td class="px-6 py-4">
              <OrderStatusBadge :status="order.status" />
            </td>
            <td class="px-6 py-4">
              <select
                :value="order.status"
                @change="$emit('update-status', order.id, $event.target.value)"
                class="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-starbucks-green"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import OrderStatusBadge from './OrderStatusBadge.vue'

defineProps({
  orders: {
    type: Array,
    default: () => []
  },
  loading: Boolean
})

defineEmits(['update-status', 'refresh'])

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>