<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        @click.self="$emit('close')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')" />

        <!-- Modal -->
        <div class="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto z-10">
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <h2 class="text-xl font-black text-starbucks-brown">Customize</h2>
            <button
              @click="$emit('close')"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Drink info -->
          <div class="px-6 py-4 bg-starbucks-light-green/30">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-starbucks-light-green rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                <img
                  v-if="drink?.image_url && !imgError"
                  :src="getMediaUrl(drink.image_url)"
                  :alt="drink.name"
                  class="w-full h-full object-cover rounded-xl"
                  @error="imgError = true"
                />
                <span v-else>☕</span>
              </div>
              <div>
                <h3 class="font-bold text-starbucks-brown text-lg">{{ drink?.name }}</h3>
                <p class="text-starbucks-green font-bold">${{ totalPrice.toFixed(2) }}</p>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 space-y-6">
            <!-- Size -->
            <div v-if="sizeModifiers.length">
              <h4 class="font-bold text-starbucks-brown mb-3 flex items-center gap-2">
                <span class="w-6 h-6 bg-starbucks-green text-white rounded-full text-xs flex items-center justify-center">1</span>
                Size
              </h4>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="mod in sizeModifiers"
                  :key="mod.id"
                  @click="selectSize(mod)"
                  :class="[
                    'p-3 rounded-xl border-2 text-center transition-all duration-200',
                    selectedSize?.id === mod.id
                      ? 'border-starbucks-green bg-starbucks-light-green text-starbucks-green'
                      : 'border-gray-200 hover:border-starbucks-green text-gray-600'
                  ]"
                >
                  <div class="font-bold text-sm">{{ mod.name }}</div>
                  <div class="text-xs mt-0.5 text-gray-500">
                    {{ parseFloat(mod.price_delta) > 0 ? `+$${parseFloat(mod.price_delta).toFixed(2)}` : 'Base' }}
                  </div>
                </button>
              </div>
            </div>

            <!-- Milk -->
            <div v-if="milkModifiers.length">
              <h4 class="font-bold text-starbucks-brown mb-3 flex items-center gap-2">
                <span class="w-6 h-6 bg-starbucks-green text-white rounded-full text-xs flex items-center justify-center">2</span>
                Milk
              </h4>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="mod in milkModifiers"
                  :key="mod.id"
                  @click="selectMilk(mod)"
                  :class="[
                    'p-3 rounded-xl border-2 text-left transition-all duration-200',
                    selectedMilk?.id === mod.id
                      ? 'border-starbucks-green bg-starbucks-light-green text-starbucks-green'
                      : 'border-gray-200 hover:border-starbucks-green text-gray-600'
                  ]"
                >
                  <div class="font-medium text-sm">{{ mod.name }}</div>
                  <div class="text-xs text-gray-500">
                    {{ parseFloat(mod.price_delta) > 0 ? `+$${parseFloat(mod.price_delta).toFixed(2)}` : 'Free' }}
                  </div>
                </button>
              </div>
            </div>

            <!-- Extras -->
            <div v-if="extraModifiers.length">
              <h4 class="font-bold text-starbucks-brown mb-3 flex items-center gap-2">
                <span class="w-6 h-6 bg-starbucks-green text-white rounded-full text-xs flex items-center justify-center">3</span>
                Extras
              </h4>
              <div class="space-y-2">
                <button
                  v-for="mod in extraModifiers"
                  :key="mod.id"
                  @click="toggleExtra(mod)"
                  :class="[
                    'w-full p-3 rounded-xl border-2 flex items-center justify-between transition-all duration-200',
                    isExtraSelected(mod.id)
                      ? 'border-starbucks-green bg-starbucks-light-green'
                      : 'border-gray-200 hover:border-starbucks-green'
                  ]"
                >
                  <div class="flex items-center gap-3">
                    <div :class="[
                      'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                      isExtraSelected(mod.id)
                        ? 'bg-starbucks-green border-starbucks-green'
                        : 'border-gray-300'
                    ]">
                      <svg v-if="isExtraSelected(mod.id)" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span :class="['text-sm font-medium', isExtraSelected(mod.id) ? 'text-starbucks-green' : 'text-gray-700']">
                      {{ mod.name }}
                    </span>
                  </div>
                  <span class="text-xs text-gray-500">
                    {{ parseFloat(mod.price_delta) > 0 ? `+$${parseFloat(mod.price_delta).toFixed(2)}` : 'Free' }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Quantity -->
            <div>
              <h4 class="font-bold text-starbucks-brown mb-3">Quantity</h4>
              <div class="flex items-center gap-4">
                <button
                  @click="quantity = Math.max(1, quantity - 1)"
                  class="w-10 h-10 rounded-full border-2 border-starbucks-green text-starbucks-green flex items-center justify-center hover:bg-starbucks-light-green transition-colors font-bold text-lg"
                >
                  −
                </button>
                <span class="text-xl font-bold text-starbucks-brown w-8 text-center">{{ quantity }}</span>
                <button
                  @click="quantity++"
                  class="w-10 h-10 rounded-full border-2 border-starbucks-green text-starbucks-green flex items-center justify-center hover:bg-starbucks-light-green transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
            <button
              @click="handleAddToCart"
              class="btn-primary w-full text-base py-3 flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Add {{ quantity }} to Cart — ${{ (totalPrice * quantity).toFixed(2) }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCartStore } from '@/stores/cart.js'
import { getMediaUrl } from '@/api/index.js'

const props = defineProps({
  show: Boolean,
  drink: Object
})

const emit = defineEmits(['close', 'added'])

const cartStore = useCartStore()
const imgError = ref(false)
const quantity = ref(1)
const selectedSize = ref(null)
const selectedMilk = ref(null)
const selectedExtras = ref([])

const sizeModifiers = computed(() =>
  (props.drink?.modifiers || []).filter((m) => m.type === 'size')
)
const milkModifiers = computed(() =>
  (props.drink?.modifiers || []).filter((m) => m.type === 'milk')
)
const extraModifiers = computed(() =>
  (props.drink?.modifiers || []).filter((m) => m.type === 'extra')
)

// Auto-select defaults when drink changes
watch(
  () => props.drink,
  (drink) => {
    if (!drink) return
    imgError.value = false
    quantity.value = 1
    selectedExtras.value = []
    // Default size = Tall (first size)
    const sizes = (drink.modifiers || []).filter((m) => m.type === 'size')
    selectedSize.value = sizes[0] || null
    // Default milk = Whole Milk
    const milks = (drink.modifiers || []).filter((m) => m.type === 'milk')
    selectedMilk.value = milks.find((m) => m.name === 'Whole Milk') || milks[0] || null
  },
  { immediate: true }
)

const totalPrice = computed(() => {
  let price = parseFloat(props.drink?.base_price || 0)
  if (selectedSize.value) price += parseFloat(selectedSize.value.price_delta || 0)
  if (selectedMilk.value) price += parseFloat(selectedMilk.value.price_delta || 0)
  selectedExtras.value.forEach((e) => {
    price += parseFloat(e.price_delta || 0)
  })
  return price
})

function selectSize(mod) {
  selectedSize.value = mod
}

function selectMilk(mod) {
  selectedMilk.value = mod
}

function toggleExtra(mod) {
  const idx = selectedExtras.value.findIndex((e) => e.id === mod.id)
  if (idx >= 0) {
    selectedExtras.value.splice(idx, 1)
  } else {
    selectedExtras.value.push(mod)
  }
}

function isExtraSelected(modId) {
  return selectedExtras.value.some((e) => e.id === modId)
}

function handleAddToCart() {
  const allSelected = [
    ...(selectedSize.value ? [selectedSize.value] : []),
    ...(selectedMilk.value ? [selectedMilk.value] : []),
    ...selectedExtras.value
  ]
  cartStore.addItem(props.drink, allSelected, quantity.value)
  emit('added')
  emit('close')
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: translateY(20px);
}
</style>