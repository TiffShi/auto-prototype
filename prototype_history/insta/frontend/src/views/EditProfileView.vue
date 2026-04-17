<template>
  <div class="max-w-2xl mx-auto px-4 py-6">
    <div class="card overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h1 class="text-lg font-semibold">Edit Profile</h1>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Avatar -->
        <div class="flex items-center gap-6">
          <div class="relative">
            <div class="w-20 h-20 rounded-full overflow-hidden instagram-gradient p-0.5">
              <div class="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
                <UserAvatar
                  :src="previewAvatar || authStore.currentUser?.avatarUrl"
                  :username="authStore.currentUser?.username"
                  size="xl"
                  class="w-full h-full"
                />
              </div>
            </div>
            <button
              type="button"
              @click="avatarInput?.click()"
              class="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </button>
          </div>
          <div>
            <p class="font-semibold">{{ authStore.currentUser?.username }}</p>
            <button
              type="button"
              @click="avatarInput?.click()"
              class="text-blue-500 text-sm font-semibold hover:text-blue-700"
            >
              Change profile photo
            </button>
          </div>
          <input
            ref="avatarInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleAvatarSelect"
          />
        </div>

        <!-- Bio -->
        <div>
          <label class="block text-sm font-semibold mb-2">Bio</label>
          <textarea
            v-model="form.bio"
            rows="4"
            maxlength="500"
            placeholder="Tell people about yourself..."
            class="input-field resize-none"
          ></textarea>
          <p class="text-xs text-gray-400 text-right mt-1">{{ form.bio.length }}/500</p>
        </div>

        <!-- Success message -->
        <Transition name="fade">
          <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-3">
            <p class="text-green-600 text-sm text-center">{{ successMessage }}</p>
          </div>
        </Transition>

        <!-- Error message -->
        <Transition name="fade">
          <div v-if="userStore.error" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-600 text-sm text-center">{{ userStore.error }}</p>
          </div>
        </Transition>

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="userStore.loading"
            class="btn-primary flex-1"
          >
            <span v-if="userStore.loading" class="flex items-center justify-center gap-2">
              <div class="spinner w-4 h-4"></div>
              Saving...
            </span>
            <span v-else>Save changes</span>
          </button>
          <RouterLink :to="`/profile/${authStore.currentUser?.username}`" class="btn-outline flex-1 text-center">
            Cancel
          </RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore.js'
import { useUserStore } from '@/stores/userStore.js'
import UserAvatar from '@/components/user/UserAvatar.vue'

const authStore = useAuthStore()
const userStore = useUserStore()
const avatarInput = ref(null)
const previewAvatar = ref(null)
const selectedAvatarFile = ref(null)
const successMessage = ref('')
const form = ref({ bio: '' })

onMounted(async () => {
  try {
    const { userApi } = await import('@/api/userApi.js')
    const response = await userApi.getCurrentUser()
    form.value.bio = response.data.bio || ''
  } catch (err) {
    console.error('Failed to load profile:', err)
  }
})

function handleAvatarSelect(event) {
  const file = event.target.files[0]
  if (file) {
    selectedAvatarFile.value = file
    previewAvatar.value = URL.createObjectURL(file)
  }
}

async function handleSubmit() {
  userStore.error = null
  successMessage.value = ''

  const formData = new FormData()
  const profileData = { bio: form.value.bio }
  formData.append('data', new Blob([JSON.stringify(profileData)], { type: 'application/json' }))

  if (selectedAvatarFile.value) {
    formData.append('avatar', selectedAvatarFile.value)
  }

  try {
    const updatedUser = await userStore.updateProfile(authStore.currentUser.id, formData)
    authStore.updateUserAvatar(updatedUser.avatarUrl)
    successMessage.value = 'Profile updated successfully!'
    setTimeout(() => { successMessage.value = '' }, 3000)
  } catch (err) {
    console.error('Update failed:', err)
  }
}
</script>