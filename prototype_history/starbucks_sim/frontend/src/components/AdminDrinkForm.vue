<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm">
    <h3 class="text-lg font-bold text-starbucks-brown mb-6">
      {{ isEditing ? 'Edit Drink' : 'Add New Drink' }}
    </h3>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input v-model="form.name" type="text" class="input-field" required placeholder="e.g. Caffè Latte" />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          v-model="form.description"
          class="input-field resize-none"
          rows="3"
          placeholder="Describe the drink..."
        />
      </div>

      <!-- Price & Category -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Base Price *</label>
          <input
            v-model="form.base_price"
            type="number"
            step="0.01"
            min="0"
            class="input-field"
            required
            placeholder="4.25"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select v-model="form.category_id" class="input-field" required>
            <option value="" disabled>Select category</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Available toggle -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="form.is_available = !form.is_available"
          :class="[
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            form.is_available ? 'bg-starbucks-green' : 'bg-gray-300'
          ]"
        >
          <span
            :class="[
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              form.is_available ? 'translate-x-6' : 'translate-x-1'
            ]"
          />
        </button>
        <span class="text-sm font-medium text-gray-700">Available for ordering</span>
      </div>

      <!-- Modifiers -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Modifiers</label>
        <div class="border border-gray-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1">
          <label
            v-for="mod in allModifiers"
            :key="mod.id"
            class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg"
          >
            <input
              type="checkbox"
              :value="mod.id"
              v-model="form.modifier_ids"
              class="rounded border-gray-300 text-starbucks-green focus:ring-starbucks-green"
            />
            <span class="text-sm text-gray-700">{{ mod.name }}</span>
            <span class="text-xs text-gray-400 ml-auto">{{ mod.type }}</span>
            <span class="text-xs text-starbucks-green">
              {{ parseFloat(mod.price_delta) > 0 ? `+$${parseFloat(mod.price_delta).toFixed(2)}` : 'Free' }}
            </span>
          </label>
        </div>
      </div>

      <!-- Error -->
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

      <!-- Actions -->
      <div class="flex gap-3 pt-2">
        <button type="submit" :disabled="loading" class="btn-primary flex-1">
          <span v-if="loading">Saving...</span>
          <span v-else>{{ isEditing ? 'Update Drink' : 'Create Drink' }}</span>
        </button>
        <button
          v-if="isEditing"
          type="button"
          @click="$emit('cancel')"
          class="btn-secondary flex-1"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { adminApi } from '@/api/index.js'

const props = defineProps({
  drink: Object,
  categories: Array,
  allModifiers: Array
})

const emit = defineEmits(['saved', 'cancel'])

const isEditing = ref(!!props.drink)
const loading = ref(false)
const error = ref(null)

const form = ref({
  name: '',
  description: '',
  base_price: '',
  category_id: '',
  is_available: true,
  modifier_ids: []
})

watch(
  () => props.drink,
  (drink) => {
    isEditing.value = !!drink
    if (drink) {
      form.value = {
        name: drink.name,
        description: drink.description || '',
        base_price: drink.base_price,
        category_id: drink.category_id,
        is_available: drink.is_available,
        modifier_ids: (drink.modifiers || []).map((m) => m.id)
      }
    } else {
      form.value = {
        name: '',
        description: '',
        base_price: '',
        category_id: '',
        is_available: true,
        modifier_ids: []
      }
    }
  },
  { immediate: true }
)

async function handleSubmit() {
  loading.value = true
  error.value = null
  try {
    const payload = {
      ...form.value,
      base_price: parseFloat(form.value.base_price)
    }
    if (isEditing.value) {
      await adminApi.updateDrink(props.drink.id, payload)
    } else {
      await adminApi.createDrink(payload)
    }
    emit('saved')
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to save drink'
  } finally {
    loading.value = false
  }
}
</script>