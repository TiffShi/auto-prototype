<template>
  <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
    <button
      @click="$emit('select', null)"
      :class="[
        'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
        selected === null
          ? 'bg-starbucks-green text-white shadow-md'
          : 'bg-white text-starbucks-brown border border-gray-200 hover:border-starbucks-green hover:text-starbucks-green'
      ]"
    >
      All Drinks
    </button>
    <button
      v-for="cat in categories"
      :key="cat.id"
      @click="$emit('select', cat.id)"
      :class="[
        'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
        selected === cat.id
          ? 'bg-starbucks-green text-white shadow-md'
          : 'bg-white text-starbucks-brown border border-gray-200 hover:border-starbucks-green hover:text-starbucks-green'
      ]"
    >
      {{ cat.name }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  selected: {
    type: Number,
    default: null
  }
})

defineEmits(['select'])
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>