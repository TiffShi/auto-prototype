<template>
  <div class="min-h-screen flex flex-col">
    <NavBar />
    <main class="flex-1">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <CartDrawer />
    <footer class="bg-starbucks-dark-green text-white py-8 mt-auto">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <p class="text-starbucks-light-green text-sm">
          © 2024 Starbucks Order App. Built with Vue 3 + FastAPI.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import CartDrawer from '@/components/CartDrawer.vue'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()

onMounted(async () => {
  if (authStore.token) {
    await authStore.fetchMe()
  }
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>