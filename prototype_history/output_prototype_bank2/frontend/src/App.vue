<template>
  <div id="app-root">
    <DashboardView />
  </div>
</template>

<script setup>
import DashboardView from './views/DashboardView.vue'
</script>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', sans-serif;
  background: #0f172a;
  color: #e2e8f0;
  min-height: 100vh;
}

#app-root {
  min-height: 100vh;
}
</style>