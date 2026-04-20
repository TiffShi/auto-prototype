<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-black text-starbucks-brown mb-2">Our Menu</h1>
      <p class="text-gray-500">Customize your perfect drink</p>
    </div>

    <!-- Filters -->
    <div class="space-y-4 mb-8">
      <SearchBar v-model="searchQuery" placeholder="Search drinks..." />
      <CategoryFilter
        :categories="menuStore.categories"
        :selected="selectedCategory"
        @select="handleCategorySelect"
      />
    </div>

    <!-- Results count -->
    <div class="flex items-center justify-between mb-4">
      <p class="text-sm text-gray-500">
        <span v-if="menuStore.loading">Loading...</span>
        <span v-else>{{ menuStore.drinks.length }} drink{{ menuStore.drinks.length !== 1 ? 's' : '' }}</span>
      </p>
      <button
        v-if="selectedCategory || searchQuery"
        @click="clearFilters"
        class="text-sm text-starbucks-green hover:underline"
      >
        Clear filters
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="menuStore.loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="i in 8" :key="i" class="card h-64 animate-pulse bg-gray-100" />
    </div>

    <!-- Empty state -->
    <div v-else-if="menuStore.drinks.length === 0" class="text-center py-20">
      <div class="text-6xl mb-4">🔍</div>
      <h3 class="text-xl font-bold text-starbucks-brown mb-2">No drinks found</h3>
      <p class="text-gray-500 mb-6">Try adjusting your search or filters</p>
      <button @click="clearFilters" class="btn-primary">Show All Drinks</button>
    </div>

    <!-- Drinks grid -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <DrinkCard
        v-for="drink in menuStore.drinks"
        :key="drink.id"
        :drink="drink"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DrinkCard from '@/components/DrinkCard.vue'
import CategoryFilter from '@/components/CategoryFilter.vue'
import SearchBar from '@/components/SearchBar.vue'
import { useMenuStore } from '@/stores/menu.js'
import { useDebounceFn } from '@vueuse/core'

const menuStore = useMenuStore()
const route = useRoute()
const router = useRouter()

const selectedCategory = ref(
  route.query.category ? parseInt(route.query.category) : null
)
const searchQuery = ref(route.query.search || '')

async function loadDrinks() {
  const params = {}
  if (selectedCategory.value) params.category_id = selectedCategory.value
  if (searchQuery.value) params.search = searchQuery.value
  await menuStore.fetchDrinks(params)
}

const debouncedSearch = useDebounceFn(loadDrinks, 400)

watch(searchQuery, () => {
  router.replace({
    query: {
      ...(selectedCategory.value ? { category: selectedCategory.value } : {}),
      ...(searchQuery.value ? { search: searchQuery.value } : {})
    }
  })
  debouncedSearch()
})

watch(selectedCategory, () => {
  router.replace({
    query: {
      ...(selectedCategory.value ? { category: selectedCategory.value } : {}),
      ...(searchQuery.value ? { search: searchQuery.value } : {})
    }
  })
  loadDrinks()
})

function handleCategorySelect(catId) {
  selectedCategory.value = catId
}

function clearFilters() {
  selectedCategory.value = null
  searchQuery.value = ''
}

onMounted(async () => {
  await menuStore.fetchCategories()
  await loadDrinks()
})
</script>