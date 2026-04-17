<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <!-- Logo Card -->
      <div class="card p-8 mb-3">
        <!-- Instagram Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 instagram-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="5"/>
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold tracking-tight" style="font-family: 'Billabong', cursive, sans-serif;">Instagram</h1>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-3">
          <div>
            <input
              v-model="form.usernameOrEmail"
              type="text"
              placeholder="Username or email"
              class="input-field"
              autocomplete="username"
              required
            />
          </div>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              class="input-field pr-10"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg v-if="showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>

          <!-- Error -->
          <Transition name="fade">
            <div v-if="authStore.error" class="bg-red-50 border border-red-200 rounded-lg p-3">
              <p class="text-red-600 text-sm text-center">{{ authStore.error }}</p>
            </div>
          </Transition>

          <button
            type="submit"
            :disabled="authStore.loading || !form.usernameOrEmail || !form.password"
            class="btn-primary w-full"
          >
            <span v-if="authStore.loading" class="flex items-center justify-center gap-2">
              <div class="spinner w-4 h-4"></div>
              Logging in...
            </span>
            <span v-else>Log in</span>
          </button>
        </form>

        <div class="flex items-center gap-3 my-4">
          <div class="flex-1 h-px bg-gray-200"></div>
          <span class="text-xs text-gray-400 font-medium">OR</span>
          <div class="flex-1 h-px bg-gray-200"></div>
        </div>

        <p class="text-center text-sm text-gray-500">
          Forgot password? <a href="#" class="text-blue-500 font-semibold hover:underline">Get help</a>
        </p>
      </div>

      <!-- Register Link -->
      <div class="card p-4 text-center">
        <p class="text-sm text-gray-600">
          Don't have an account?
          <RouterLink to="/register" class="text-blue-500 font-semibold hover:underline ml-1">Sign up</RouterLink>
        </p>
      </div>

      <!-- App Store Links -->
      <div class="text-center mt-6">
        <p class="text-sm text-gray-500 mb-3">Get the app.</p>
        <div class="flex justify-center gap-2">
          <div class="border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-600 cursor-pointer hover:bg-gray-50">
            App Store
          </div>
          <div class="border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-600 cursor-pointer hover:bg-gray-50">
            Google Play
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore.js'

const authStore = useAuthStore()
const showPassword = ref(false)
const form = ref({
  usernameOrEmail: '',
  password: ''
})

onMounted(() => {
  authStore.error = null
})

async function handleLogin() {
  try {
    await authStore.login(form.value)
  } catch (err) {
    // error handled in store
  }
}
</script>