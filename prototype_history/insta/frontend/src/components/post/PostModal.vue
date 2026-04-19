<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
        <h2 class="font-semibold text-base">Create new post</h2>
        <button
          @click="handleSubmit"
          :disabled="!selectedFile || postStore.loading"
          class="text-blue-500 font-semibold text-sm disabled:opacity-40 hover:text-blue-700"
        >
          Share
        </button>
      </div>

      <!-- Image Upload Area -->
      <div v-if="!previewUrl" class="p-8">
        <div
          class="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
          @click="fileInput?.click()"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <p class="text-gray-500 font-medium mb-1">Drag photo here</p>
          <p class="text-gray-400 text-sm mb-4">or click to select</p>
          <button class="btn-primary text-sm px-6">Select from computer</button>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileSelect"
        />
      </div>

      <!-- Preview + Caption -->
      <div v-else class="flex flex-col">
        <div class="relative bg-black" style="max-height: 400px;">
          <img :src="previewUrl" alt="Preview" class="w-full object-contain" style="max-height: 400px;" />
          <button
            @click="clearFile"
            class="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="p-4">
          <div class="flex items-start gap-3 mb-3">
            <UserAvatar :src="authStore.currentUser?.avatarUrl" :username="authStore.currentUser?.username" size="sm" />
            <textarea
              v-model="caption"
              placeholder="Write a caption..."
              rows="3"
              maxlength="2200"
              class="flex-1 resize-none text-sm focus:outline-none placeholder-gray-400"
            ></textarea>
          </div>
          <div class="text-right text-xs text-gray-400">{{ caption.length }}/2200</div>
        </div>

        <!-- Error -->
        <div v-if="error" class="px-4 pb-3">
          <p class="text-red-500 text-sm">{{ error }}</p>
        </div>

        <!-- Loading -->
        <div v-if="postStore.loading" class="px-4 pb-4">
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <div class="spinner w-4 h-4"></div>
            Sharing your post...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore.js'
import { usePostStore } from '@/stores/postStore.js'
import UserAvatar from '@/components/user/UserAvatar.vue'

const emit = defineEmits(['close', 'created'])
const authStore = useAuthStore()
const postStore = usePostStore()

const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref(null)
const caption = ref('')
const error = ref(null)

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) setFile(file)
}

function handleDrop(event) {
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) setFile(file)
}

function setFile(file) {
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  error.value = null
}

function clearFile() {
  selectedFile.value = null
  previewUrl.value = null
  if (fileInput.value) fileInput.value.value = ''
}

async function handleSubmit() {
  if (!selectedFile.value) return
  error.value = null

  const formData = new FormData()
  formData.append('image', selectedFile.value)
  if (caption.value.trim()) {
    formData.append('caption', caption.value.trim())
  }

  try {
    const post = await postStore.createPost(formData)
    emit('created', post)
    emit('close')
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create post'
  }
}
</script>