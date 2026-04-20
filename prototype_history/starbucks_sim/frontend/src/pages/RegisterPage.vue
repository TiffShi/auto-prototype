<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-starbucks-cream">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-starbucks-green rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          ☕
        </div>
        <h1 class="text-3xl font-black text-starbucks-brown">Create account</h1>
        <p class="text-gray-500 mt-2">Join Starbucks Rewards today</p>
      </div>

      <!-- Form -->
      <div class="card p-8">
        <form @submit.prevent="handleRegister" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              v-model="name"
              type="text"
              class="input-field"
              placeholder="Your name"
              required
              autocomplete="name"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              class="input-field"
              placeholder="you@example.com"
              required
              autocomplete="email"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="input-field pr-10"
                placeholder="Min. 6 characters"
                required
                minlength="6"
                autocomplete="new-password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <!-- Password strength -->
            <div class="mt-1.5 flex gap-1">
              <div
                v-for="i in 3"
                :key="i"
                :class="[
                  'h-1 flex-1 rounded-full transition-colors',
                  passwordStrength >= i ? strengthColor : 'bg-gray-200'
                ]"
              />
            </div>
            <p class="text-xs text-gray-400 mt-1">{{ strengthLabel }}</p>
          </div>

          <!-- Error -->
          <div v-if="authStore.error" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-600 text-sm">{{ authStore.error }}</p>
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="btn-primary w-full py-3 text-base"
          >
            <span v-if="authStore.loading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </span>
            <span v-else>Create Account</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-500">
            Already have an account?
            <RouterLink to="/login" class="text-starbucks-green font-bold hover:underline ml-1">
              Sign in
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)

const passwordStrength = computed(() => {
  const p = password.value
  if (p.length === 0) return 0
  if (p.length < 6) return 1
  if (p.length < 10) return 2
  return 3
})

const strengthColor = computed(() => {
  if (passwordStrength.value === 1) return 'bg-red-400'
  if (passwordStrength.value === 2) return 'bg-yellow-400'
  return 'bg-starbucks-green'
})

const strengthLabel = computed(() => {
  if (password.value.length === 0) return ''
  if (passwordStrength.value === 1) return 'Weak password'
  if (passwordStrength.value === 2) return 'Good password'
  return 'Strong password'
})

async function handleRegister() {
  const result = await authStore.register(name.value, email.value, password.value)
  if (result.success) {
    router.push('/')
  }
}
</script>