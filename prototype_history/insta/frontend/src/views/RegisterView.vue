<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="card p-8 mb-3">
        <!-- Logo -->
        <div class="text-center mb-6">
          <div class="w-16 h-16 instagram-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="5"/>
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold tracking-tight mb-2" style="font-family: 'Billabong', cursive, sans-serif;">Instagram</h1>
          <p class="text-gray-500 text-sm font-medium">Sign up to see photos and videos from your friends.</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-3">
          <input
            v-model="form.email"
            type="email"
            placeholder="Email"
            class="input-field"
            autocomplete="email"
            required
          />
          <input
            v-model="form.username"
            type="text"
            placeholder="Username"
            class="input-field"
            autocomplete="username"
            minlength="3"
            maxlength="50"
            required
          />
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              class="input-field pr-10"
              autocomplete="new-password"
              minlength="6"
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

          <!-- Password strength -->
          <div v-if="form.password" class="space-y-1">
            <div class="flex gap-1">
              <div v-for="i in 4" :key="i" class="flex-1 h-1 rounded-full transition-colors"
                :class="passwordStrength >= i ? strengthColor : 'bg-gray-200'"></div>
            </div>
            <p class="text-xs" :class="strengthTextColor">{{ strengthLabel }}</p>
          </div>

          <!-- Error -->
          <Transition name="fade">
            <div v-if="authStore.error" class="bg-red-50 border border-red-200 rounded-lg p-3">
              <p class="text-red-600 text-sm text-center">{{ authStore.error }}</p>
            </div>
          </Transition>

          <p class="text-xs text-gray-400 text-center">
            By signing up, you agree to our Terms, Privacy Policy and Cookies Policy.
          </p>

          <button
            type="submit"
            :disabled="authStore.loading || !isFormValid"
            class="btn-primary w-full"
          >
            <span v-if="authStore.loading" class="flex items-center justify-center gap-2">
              <div class="spinner w-4 h-4"></div>
              Creating account...
            </span>
            <span v-else>Sign up</span>
          </button>
        </form>
      </div>

      <div class="card p-4 text-center">
        <p class="text-sm text-gray-600">
          Have an account?
          <RouterLink to="/login" class="text-blue-500 font-semibold hover:underline ml-1">Log in</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore.js'

const authStore = useAuthStore()
const showPassword = ref(false)
const form = ref({
  email: '',
  username: '',
  password: ''
})

onMounted(() => {
  authStore.error = null
})

const isFormValid = computed(() =>
  form.value.email && form.value.username.length >= 3 && form.value.password.length >= 6
)

const passwordStrength = computed(() => {
  const p = form.value.password
  if (!p) return 0
  let score = 0
  if (p.length >= 6) score++
  if (p.length >= 10) score++
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthColor = computed(() => {
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400']
  return colors[passwordStrength.value - 1] || 'bg-red-400'
})

const strengthTextColor = computed(() => {
  const colors = ['text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-500']
  return colors[passwordStrength.value - 1] || 'text-red-500'
})

const strengthLabel = computed(() => {
  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  return labels[passwordStrength.value - 1] || 'Weak'
})

async function handleRegister() {
  try {
    await authStore.register(form.value)
  } catch (err) {
    // error handled in store
  }
}
</script>