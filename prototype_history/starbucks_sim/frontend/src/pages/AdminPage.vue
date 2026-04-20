<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-4xl font-black text-starbucks-brown">Admin Panel</h1>
        <p class="text-gray-500 mt-1">Manage drinks, categories, and orders</p>
      </div>
      <span class="badge bg-starbucks-gold text-starbucks-dark-green font-bold px-3 py-1">
        Admin
      </span>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-8">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="[
          'px-5 py-2 rounded-lg text-sm font-medium transition-all',
          activeTab === tab.key
            ? 'bg-white text-starbucks-green shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Drinks Tab -->
    <div v-if="activeTab === 'drinks'" class="grid lg:grid-cols-3 gap-8">
      <!-- Form -->
      <div class="lg:col-span-1">
        <AdminDrinkForm
          :drink="editingDrink"
          :categories="categories"
          :all-modifiers="allModifiers"
          @saved="handleDrinkSaved"
          @cancel="editingDrink = null"
        />
      </div>

      <!-- Drinks list -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-lg font-bold text-starbucks-brown">
              All Drinks ({{ drinks.length }})
            </h3>
            <button @click="loadDrinks" class="btn-ghost text-sm">Refresh</button>
          </div>

          <div v-if="drinksLoading" class="p-8 text-center text-gray-400">Loading...</div>

          <div v-else class="divide-y divide-gray-50">
            <div
              v-for="drink in drinks"
              :key="drink.id"
              class="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <!-- Image -->
              <div class="w-12 h-12 bg-starbucks-light-green rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img
                  v-if="drink.image_url"
                  :src="getMediaUrl(drink.image_url)"
                  :alt="drink.name"
                  class="w-full h-full object-cover"
                  @error="$event.target.style.display='none'"
                />
                <span v-else class="text-xl">☕</span>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="font-bold text-starbucks-brown truncate">{{ drink.name }}</p>
                <p class="text-xs text-gray-400">{{ drink.category?.name }} · ${{ parseFloat(drink.base_price).toFixed(2) }}</p>
              </div>

              <!-- Status -->
              <span
                :class="[
                  'badge text-xs',
                  drink.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                ]"
              >
                {{ drink.is_available ? 'Available' : 'Unavailable' }}
              </span>

              <!-- Actions -->
              <div class="flex gap-2">
                <!-- Upload image -->
                <label class="cursor-pointer p-1.5 text-gray-400 hover:text-starbucks-green transition-colors" :title="'Upload image'">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleImageUpload(drink.id, $event)"
                  />
                </label>

                <!-- Edit -->
                <button
                  @click="editingDrink = drink"
                  class="p-1.5 text-gray-400 hover:text-starbucks-green transition-colors"
                  title="Edit"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                <!-- Delete -->
                <button
                  @click="handleDeleteDrink(drink.id)"
                  class="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Orders Tab -->
    <div v-if="activeTab === 'orders'">
      <AdminOrderTable
        :orders="adminOrders"
        :loading="ordersLoading"
        @update-status="handleUpdateStatus"
        @refresh="loadOrders"
      />
    </div>

    <!-- Categories Tab -->
    <div v-if="activeTab === 'categories'" class="max-w-lg">
      <div class="card p-6 mb-6">
        <h3 class="text-lg font-bold text-starbucks-brown mb-4">Add Category</h3>
        <form @submit.prevent="handleAddCategory" class="flex gap-3">
          <input
            v-model="newCategoryName"
            type="text"
            class="input-field flex-1"
            placeholder="Category name"
            required
          />
          <button type="submit" class="btn-primary px-6">Add</button>
        </form>
      </div>

      <div class="card overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-bold text-starbucks-brown">Categories</h3>
        </div>
        <div class="divide-y divide-gray-50">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="flex items-center justify-between px-6 py-3"
          >
            <span class="font-medium text-starbucks-brown">{{ cat.name }}</span>
            <span class="text-xs text-gray-400">Order: {{ cat.display_order }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modifiers Tab -->
    <div v-if="activeTab === 'modifiers'" class="max-w-2xl">
      <div class="card p-6 mb-6">
        <h3 class="text-lg font-bold text-starbucks-brown mb-4">Add Modifier</h3>
        <form @submit.prevent="handleAddModifier" class="grid grid-cols-3 gap-3">
          <input
            v-model="newModifier.name"
            type="text"
            class="input-field"
            placeholder="Name"
            required
          />
          <select v-model="newModifier.type" class="input-field" required>
            <option value="" disabled>Type</option>
            <option value="size">Size</option>
            <option value="milk">Milk</option>
            <option value="extra">Extra</option>
          </select>
          <input
            v-model="newModifier.price_delta"
            type="number"
            step="0.01"
            min="0"
            class="input-field"
            placeholder="Price delta"
          />
          <button type="submit" class="btn-primary col-span-3">Add Modifier</button>
        </form>
      </div>

      <div class="card overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-bold text-starbucks-brown">All Modifiers</h3>
        </div>
        <div class="divide-y divide-gray-50">
          <div
            v-for="mod in allModifiers"
            :key="mod.id"
            class="flex items-center justify-between px-6 py-3"
          >
            <div>
              <span class="font-medium text-starbucks-brown">{{ mod.name }}</span>
              <span class="badge bg-gray-100 text-gray-500 ml-2 text-xs">{{ mod.type }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-starbucks-green text-sm font-medium">
                {{ parseFloat(mod.price_delta) > 0 ? `+$${parseFloat(mod.price_delta).toFixed(2)}` : 'Free' }}
              </span>
              <button
                @click="handleDeleteModifier(mod.id)"
                class="text-gray-300 hover:text-red-400 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast notification -->
    <Transition name="toast">
      <div
        v-if="toast.show"
        :class="[
          'fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg font-medium text-sm z-50',
          toast.type === 'success' ? 'bg-starbucks-green text-white' : 'bg-red-500 text-white'
        ]"
      >
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import AdminDrinkForm from '@/components/AdminDrinkForm.vue'
import AdminOrderTable from '@/components/AdminOrderTable.vue'
import { adminApi, menuApi, getMediaUrl } from '@/api/index.js'

const activeTab = ref('drinks')
const tabs = [
  { key: 'drinks', label: 'Drinks' },
  { key: 'orders', label: 'Orders' },
  { key: 'categories', label: 'Categories' },
  { key: 'modifiers', label: 'Modifiers' }
]

const drinks = ref([])
const categories = ref([])
const allModifiers = ref([])
const adminOrders = ref([])
const editingDrink = ref(null)
const drinksLoading = ref(false)
const ordersLoading = ref(false)
const newCategoryName = ref('')
const newModifier = reactive({ name: '', type: '', price_delta: 0 })

const toast = reactive({ show: false, message: '', type: 'success' })

function showToast(message, type = 'success') {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, 3000)
}

async function loadDrinks() {
  drinksLoading.value = true
  try {
    const res = await menuApi.getDrinks()
    drinks.value = res.data
  } catch (err) {
    showToast('Failed to load drinks', 'error')
  } finally {
    drinksLoading.value = false
  }
}

async function loadCategories() {
  try {
    const res = await adminApi.getCategories()
    categories.value = res.data
  } catch {
    const res = await menuApi.getCategories()
    categories.value = res.data
  }
}

async function loadModifiers() {
  try {
    const res = await menuApi.getModifiers()
    allModifiers.value = res.data
  } catch (err) {
    console.error(err)
  }
}

async function loadOrders() {
  ordersLoading.value = true
  try {
    const res = await adminApi.getAllOrders()
    adminOrders.value = res.data
  } catch (err) {
    showToast('Failed to load orders', 'error')
  } finally {
    ordersLoading.value = false
  }
}

async function handleDrinkSaved() {
  editingDrink.value = null
  await loadDrinks()
  showToast('Drink saved successfully!')
}

async function handleDeleteDrink(id) {
  if (!confirm('Delete this drink?')) return
  try {
    await adminApi.deleteDrink(id)
    await loadDrinks()
    showToast('Drink deleted')
  } catch {
    showToast('Failed to delete drink', 'error')
  }
}

async function handleImageUpload(drinkId, event) {
  const file = event.target.files[0]
  if (!file) return
  const formData = new FormData()
  formData.append('file', file)
  try {
    await adminApi.uploadImage(drinkId, formData)
    await loadDrinks()
    showToast('Image uploaded!')
  } catch {
    showToast('Failed to upload image', 'error')
  }
}

async function handleUpdateStatus(orderId, status) {
  try {
    await adminApi.updateOrderStatus(orderId, status)
    await loadOrders()
    showToast('Order status updated')
  } catch {
    showToast('Failed to update status', 'error')
  }
}

async function handleAddCategory() {
  try {
    await adminApi.createCategory({ name: newCategoryName.value, display_order: 0 })
    newCategoryName.value = ''
    await loadCategories()
    showToast('Category added!')
  } catch {
    showToast('Failed to add category', 'error')
  }
}

async function handleAddModifier() {
  try {
    await adminApi.createModifier({
      name: newModifier.name,
      type: newModifier.type,
      price_delta: parseFloat(newModifier.price_delta) || 0
    })
    newModifier.name = ''
    newModifier.type = ''
    newModifier.price_delta = 0
    await loadModifiers()
    showToast('Modifier added!')
  } catch {
    showToast('Failed to add modifier', 'error')
  }
}

async function handleDeleteModifier(id) {
  if (!confirm('Delete this modifier?')) return
  try {
    await adminApi.deleteModifier(id)
    await loadModifiers()
    showToast('Modifier deleted')
  } catch {
    showToast('Failed to delete modifier', 'error')
  }
}

onMounted(async () => {
  await Promise.all([loadDrinks(), loadCategories(), loadModifiers(), loadOrders()])
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>