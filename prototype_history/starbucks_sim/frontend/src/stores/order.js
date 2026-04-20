import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ordersApi } from '@/api/index.js'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const currentOrder = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function placeOrder(payload) {
    loading.value = true
    error.value = null
    try {
      const res = await ordersApi.placeOrder(payload)
      currentOrder.value = res.data
      return { success: true, order: res.data }
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to place order'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function fetchOrders() {
    loading.value = true
    error.value = null
    try {
      const res = await ordersApi.getOrders()
      orders.value = res.data
    } catch (err) {
      error.value = 'Failed to load orders'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchOrder(id) {
    loading.value = true
    error.value = null
    try {
      const res = await ordersApi.getOrder(id)
      currentOrder.value = res.data
      return res.data
    } catch (err) {
      error.value = 'Order not found'
      console.error(err)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    orders,
    currentOrder,
    loading,
    error,
    placeOrder,
    fetchOrders,
    fetchOrder
  }
})