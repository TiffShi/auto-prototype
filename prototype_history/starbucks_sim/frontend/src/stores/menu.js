import { defineStore } from 'pinia'
import { ref } from 'vue'
import { menuApi } from '@/api/index.js'

export const useMenuStore = defineStore('menu', () => {
  const categories = ref([])
  const drinks = ref([])
  const modifiers = ref([])
  const currentDrink = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchCategories() {
    try {
      const res = await menuApi.getCategories()
      categories.value = res.data
    } catch (err) {
      console.error('Failed to fetch categories', err)
    }
  }

  async function fetchDrinks(params = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await menuApi.getDrinks(params)
      drinks.value = res.data
    } catch (err) {
      error.value = 'Failed to load drinks'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchDrink(id) {
    loading.value = true
    error.value = null
    currentDrink.value = null
    try {
      const res = await menuApi.getDrink(id)
      currentDrink.value = res.data
      return res.data
    } catch (err) {
      error.value = 'Drink not found'
      console.error(err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchModifiers() {
    try {
      const res = await menuApi.getModifiers()
      modifiers.value = res.data
    } catch (err) {
      console.error('Failed to fetch modifiers', err)
    }
  }

  function getModifiersByType(type) {
    return modifiers.value.filter((m) => m.type === type)
  }

  return {
    categories,
    drinks,
    modifiers,
    currentDrink,
    loading,
    error,
    fetchCategories,
    fetchDrinks,
    fetchDrink,
    fetchModifiers,
    getModifiersByType
  }
})