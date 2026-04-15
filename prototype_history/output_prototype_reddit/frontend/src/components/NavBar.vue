<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <router-link to="/" class="brand">
        <span class="brand-icon">🔥</span>
        <span class="brand-name">VueReddit</span>
      </router-link>

      <div class="nav-links">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/communities" class="nav-link">Communities</router-link>
        <router-link to="/posts/create" class="nav-link nav-link--create">
          + New Post
        </router-link>
      </div>

      <div class="nav-user">
        <span v-if="userStore.hasUsername" class="username-badge">
          👤 {{ userStore.username }}
          <button class="change-btn" @click="handleChange">change</button>
        </span>
        <span v-else class="username-badge username-badge--empty">
          No username set
        </span>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useUserStore } from '../stores/userStore.js'

const userStore = useUserStore()

function handleChange() {
  userStore.clearUsername()
}
</script>

<style scoped>
.navbar {
  background: #ff4500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
  height: 52px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.brand-icon {
  font-size: 1.4rem;
}

.brand-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.nav-link {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 20px;
  transition: background 0.15s;
  text-decoration: none;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.nav-link--create {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.nav-link--create:hover {
  background: rgba(255, 255, 255, 0.3);
}

.nav-user {
  margin-left: auto;
}

.username-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.15);
  padding: 4px 10px;
  border-radius: 20px;
}

.username-badge--empty {
  opacity: 0.7;
  font-style: italic;
}

.change-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.75rem;
  text-decoration: underline;
  padding: 0;
  cursor: pointer;
}

.change-btn:hover {
  color: #fff;
}
</style>