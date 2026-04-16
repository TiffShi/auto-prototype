<template>
  <div class="app-layout">
    <Sidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />
    <main class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar/Sidebar.vue';
import { usePageStore } from '@/store/usePageStore.js';

const sidebarCollapsed = ref(false);
const pageStore = usePageStore();

onMounted(() => {
  pageStore.fetchPages();
});
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #ffffff;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  transition: margin-left 0.2s ease;
  min-width: 0;
}
</style>