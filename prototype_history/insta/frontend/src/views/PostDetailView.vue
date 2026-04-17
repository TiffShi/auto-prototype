<template>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <!-- Loading -->
    <div v-if="postStore.loading && !postStore.currentPost" class="flex justify-center py-20">
      <div class="spinner w-10 h-10"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <p class="text-gray-500 mb-4">{{ error }}</p>
      <RouterLink to="/" class="btn-primary">Go Home</RouterLink>
    </div>

    <!-- Post Detail -->
    <div v-else-if="postStore.currentPost" class="card overflow-hidden">
      <div class="flex flex-col md:flex-row" style="min-height: 500px;">
        <!-- Image -->
        <div class="md:w-3/5 bg-black flex items-center justify-center">
          <img
            :src="resolvedImageUrl"
            :alt="postStore.currentPost.caption || 'Post'"
            class="w-full h-full object-contain"
            style="max-height: 600px;"
          />
        </div>

        <!-- Right Panel -->
        <div class="md:w-2/5 flex flex-col border-l border-gray-200">
          <!-- Post Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-100">
            <RouterLink
              :to="`/profile/${postStore.currentPost.username}`"
              class="flex items-center gap-3"
            >
              <UserAvatar
                :src="postStore.currentPost.userAvatarUrl"
                :username="postStore.currentPost.username"
                size="sm"
              />
              <span class="font-semibold text-sm">{{ postStore.currentPost.username }}</span>
            </RouterLink>

            <div v-if="isOwnPost" class="relative" ref="menuRef">
              <button @click="showMenu = !showMenu" class="p-1 rounded-full hover:bg-gray-100">
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
                    Delete post
                  </button>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Caption -->
          <div v-if="postStore.currentPost.caption" class="p-4 border-b border-gray-100">
            <div class="flex items-start gap-3">
              <UserAvatar
                :src="postStore.currentPost.userAvatarUrl"
                :username="postStore.currentPost.username"
                size="sm"
              />
              <div class="text-sm">
                <RouterLink :to="`/profile/${postStore.currentPost.username}`" class="font-semibold mr-1">
                  {{ postStore.currentPost.username }}
                </RouterLink>
                {{ postStore.currentPost.caption }}
                <p class="text-xs text-gray-400 mt-1">{{ timeAgo(postStore.currentPost.createdAt) }}</p>
              </div>
            </div>
          </div>

          <!-- Comments -->
          <div class="flex-1 overflow-hidden">
            <CommentSection :postId="postStore.currentPost.id" @comment-added="handleCommentAdded" />
          </div>

          <!-- Actions -->
          <div class="border-t border-gray-100 p-4">
            <div class="flex items-center gap-3 mb-2">
              <LikeButton :post="postStore.currentPost" />
              <button class="p-1 text-gray-700 hover:text-gray-500">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            </div>
            <p v-if="postStore.currentPost.likeCount > 0" class="font-semibold text-sm">
              {{ postStore.currentPost.likeCount }} {{ postStore.currentPost.likeCount === 1 ? 'like' : 'likes' }}
            </p>
            <p class="text-xs text-gray-400 mt-1">{{ formatDate(postStore.currentPost.createdAt) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { onClickOutside } from '@vueuse/core'
import { useAuthStore } from '@/stores/authStore.js'
import { usePostStore } from '@/stores/postStore.js'
import UserAvatar from '@/components/user/UserAvatar.vue'
import LikeButton from '@/components/post/LikeButton.vue'
import CommentSection from '@/components/post/CommentSection.vue'
import { timeAgo, formatDate } from '@/utils/dateUtils.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const postStore = usePostStore()
const error = ref(null)
const showMenu = ref(false)
const menuRef = ref(null)
const API_URL = import.meta.env.VITE_API_URL

onClickOutside(menuRef, () => { showMenu.value = false })

const isOwnPost = computed(() =>
  authStore.currentUser?.username === postStore.currentPost?.username
)

const resolvedImageUrl = computed(() => {
  const url = postStore.currentPost?.imageUrl
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${API_URL}${url}`
})

onMounted(async () => {
  try {
    await postStore.fetchPost(Number(route.params.id))
  } catch (err) {
    error.value = 'Post not found'
  }
})

async function handleDelete() {
  showMenu.value = false
  if (!confirm('Delete this post?')) return
  try {
    await postStore.deletePost(postStore.currentPost.id)
    router.push({ name: 'Home' })
  } catch (err) {
    console.error('Delete failed:', err)
  }
}

function handleCommentAdded() {
  if (postStore.currentPost) {
    postStore.currentPost = {
      ...postStore.currentPost,
      commentCount: postStore.currentPost.commentCount + 1
    }
  }
}
</script>