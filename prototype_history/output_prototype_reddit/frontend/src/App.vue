<template>
  <div id="app-root">
    <NavBar />
    <UsernameModal v-if="!userStore.hasUsername" />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import UsernameModal from './components/UsernameModal.vue'
import { useUserStore } from './stores/userStore.js'

const userStore = useUserStore()
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
  background: #dae0e6;
  color: #1c1c1c;
  min-height: 100vh;
}

#app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  max-width: 1100px;
  width: 100%;
  margin: 24px auto;
  padding: 0 16px;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  cursor: pointer;
  font-family: inherit;
}

input,
textarea,
select {
  font-family: inherit;
}
</style>