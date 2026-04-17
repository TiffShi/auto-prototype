<template>
  <article class="card mb-4 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between p-3">
      <RouterLink :to="`/profile/${post.username}`" class="flex items-center gap-3">
        <UserAvatar :src="post.userAvatarUrl" :username="post.username" size="sm" />
        <div>
          <p class="font-semibold text-sm">{{ post.username }}</p>
          <p class="text-xs text-gray-400">{{ timeAgo(post.createdAt) }}</p>
        </div>
      </RouterLink>

      <!-- Options Menu (own posts) -->
      <div v-if="isOwnPost" class="relative" ref="menuRef">
        <button
          @click="showMenu = !showMenu"
          class="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg class="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
          </svg>
        </button>
        <Transition name="fade">
          <div v-if="showMenu" class="absolute right-0 top-8 w-36 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-10">
            <button
              @click="handleDelete"
              class="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
              Delete
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Image -->
    <RouterLink :to="`/posts/${post.id}`">
      <div class="relative bg-black" style="aspect-ratio: 1;">
        <img
          :src="resolvedImageUrl"
          :alt="post.caption || 'Post image'"
          class="w-full h-full object-cover"
          @dblclick="handleDoubleTap"
          loading="lazy"
        />
        <!-- Heart animation on double tap -->
        <Transition name="fade">
          <div v-if="showHeart" class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg class="w-24 h-24 text-white drop-shadow-lg animate-bounce" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
        </Transition>
      </div>
    </RouterLink>

    <!-- Actions -->
    <div class="px-3 pt-2 pb-1">
      <div class="flex items-center gap-3 mb-2">
        <LikeButton :post="post" @liked="handleLiked" />
        <RouterLink :to="`/posts/${post.id}`" class="p-1 hover:text-gray-500 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </RouterLink>
      </div>

      <!-- Like count -->
      <p v-if="post.likeCount > 0" class="font-semibold text-sm mb-1">
        {{ post.likeCount }} {{ post.likeCount === 1 ? 'like' : 'likes' }}
      </p>

      <!-- Caption -->
      <div v-if="post.caption" class="text-sm mb-1">
        <RouterLink :to="`/profile/${post.username}`" class="font-semibold mr-1">{{ post.username }}</RouterLink>
        <span :class="{ 'line-clamp-2': !showFullCaption }">{{ post.caption }}</span>
        <button
          v-if="post.caption.length > 100 && !showFullCaption"
          @click="showFullCaption = true"
          class="text-gray-400 text-xs ml-1"
        >
          more
        </button>
      </div>

      <!-- Comment count -->
      <RouterLink
        v-if="post.commentCount > 0"
        :to="`/posts/${post.id}`"
        class="text-sm text-gray-400 block mb-1"
      >
        View all {{ post.commentCount }} comments
      </RouterLink>
    </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useAuthStore } from '@/stores/authStore.js'
import { usePostStore } from '@/stores/postStore.js'
import UserAvatar from '@/components/user/UserAvatar.vue'
import LikeButton from './LikeButton.vue'
import { timeAgo } from '@/utils/dateUtils.js'

const props = defineProps({
  post: { type: Object, required: true }
})

const emit = defineEmits(['deleted'])

const authStore = useAuthStore()
const postStore = usePostStore()
const showMenu = ref(false)
const showHeart = ref(false)
const showFullCaption = ref(false)
const menuRef = ref(null)
const API_URL = import.meta.env.VITE_API_URL

onClickOutside(menuRef, () => { showMenu.value = false })

const isOwnPost = computed(() => authStore.currentUser?.username === props.post.username)

const resolvedImageUrl = computed(() => {
  if (!props.post.imageUrl) return ''
  if (props.post.imageUrl.startsWith('http')) return props.post.imageUrl
  return `${API_URL}${props.post.imageUrl}`
})

async function handleDelete() {
  showMenu.value = false
  if (!confirm('Delete this post?')) return
  try {
    await postStore.deletePost(props.post.id)
    emit('deleted', props.post.id)
  } catch (err) {
    console.error('Delete failed:', err)
  }
}

function handleDoubleTap() {
  if (!props.post.likedByCurrentUser) {
    postStore.toggleLike(props.post)
  }
  showHeart.value = true
  setTimeout(() => { showHeart.value = false }, 1000)
}

function handleLiked() {
  // handled by store
}
</script>