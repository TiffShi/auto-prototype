<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
      <input
        v-model="form.username"
        type="text"
        required
        autocomplete="username"
        placeholder="John Doe"
        class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
        :class="{ 'border-red-400': errors.username }"
      />
      <p v-if="errors.username" class="mt-1 text-xs text-red-500">{{ errors.username }}</p>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
      <input
        v-model="form.email"
        type="email"
        required
        autocomplete="email"
        placeholder="you@example.com"
        class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
        :class="{ 'border-red-400': errors.email }"
      />
      <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
      <div class="relative">
        <input
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          required
          autocomplete="new-password"
          placeholder="Min. 6 characters"
          class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all pr-10"
          :class="{ 'border-red-400': errors.password }"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
      <p v-if="errors.password" class="mt-1 text-xs text-red-500">{{ errors.password }}</p>
    </div>

    <div v-if="authError" class="p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-600">{{ authError }}</p>
    </div>

    <Button type="submit" class="w-full" :loading="loading">
      Create account
    </Button>
  </form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import Button from '@/components/ui/Button.vue'

const authStore = useAuthStore()

const form = reactive({ username: '', email: '', password: '' })
const errors = reactive({ username: '', email: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const authError = ref('')

function validate() {
  errors.username = ''
  errors.email = ''
  errors.password = ''
  let valid = true

  if (!form.username || form.username.length < 2) {
    errors.username = 'Username must be at least 2 characters'
    valid = false
  }

  if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Valid email is required'
    valid = false
  }

  if (!form.password || form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return
  authError.value = ''
  loading.value = true
  try {
    await authStore.register({
      username: form.username,
      email: form.email,
      password: form.password
    })
  } catch (err) {
    authError.value = err.response?.data?.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>