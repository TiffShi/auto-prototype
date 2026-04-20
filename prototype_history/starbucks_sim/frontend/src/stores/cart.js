import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref(
    localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : []
  )

  function persist() {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0)
  )

  const isEmpty = computed(() => items.value.length === 0)

  function addItem(drink, selectedModifiers, quantity = 1) {
    // Calculate total price for this item
    const modifierDelta = selectedModifiers.reduce(
      (sum, mod) => sum + parseFloat(mod.price_delta || 0),
      0
    )
    const totalPrice = parseFloat(drink.base_price) + modifierDelta

    // Check if identical item already exists
    const existingIndex = items.value.findIndex((item) => {
      if (item.drinkId !== drink.id) return false
      const existingModIds = item.modifiers.map((m) => m.id).sort()
      const newModIds = selectedModifiers.map((m) => m.id).sort()
      return JSON.stringify(existingModIds) === JSON.stringify(newModIds)
    })

    if (existingIndex >= 0) {
      items.value[existingIndex].quantity += quantity
    } else {
      items.value.push({
        cartItemId: Date.now() + Math.random(),
        drinkId: drink.id,
        drinkName: drink.name,
        drinkImage: drink.image_url,
        basePrice: parseFloat(drink.base_price),
        modifiers: selectedModifiers,
        totalPrice,
        quantity
      })
    }
    persist()
  }

  function updateQuantity(cartItemId, quantity) {
    const idx = items.value.findIndex((i) => i.cartItemId === cartItemId)
    if (idx >= 0) {
      if (quantity <= 0) {
        items.value.splice(idx, 1)
      } else {
        items.value[idx].quantity = quantity
      }
      persist()
    }
  }

  function removeItem(cartItemId) {
    items.value = items.value.filter((i) => i.cartItemId !== cartItemId)
    persist()
  }

  function clearCart() {
    items.value = []
    persist()
  }

  function toOrderPayload() {
    return {
      items: items.value.map((item) => ({
        drink_id: item.drinkId,
        quantity: item.quantity,
        unit_price: item.totalPrice,
        modifier_ids: item.modifiers.map((m) => m.id),
        customization_notes: {
          modifiers: item.modifiers.map((m) => m.name)
        }
      }))
    }
  }

  return {
    items,
    itemCount,
    subtotal,
    isEmpty,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    toOrderPayload
  }
})