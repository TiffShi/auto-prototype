<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <NavBar v-if="showNav" />
    <main :class="showNav ? 'pt-14' : ''">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/layout/NavBar.vue'

const route = useRoute()
const noNavRoutes = ['Login', 'Register']
const showNav = computed(() => !noNavRoutes.includes(route.name))
</script>