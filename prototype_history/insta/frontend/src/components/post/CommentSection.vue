<template>
  <div class="flex flex-col h-full">
    <!-- Comments List -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
      <div v-if="loading" class="flex justify-center py-4">
        <div class="spinner w-6 h-6"></div>
      </div>
      <div v-else-if="comments.length === 0" class="text-center text-gray-400 text-sm py-8">
        No comments yet. Be the first!
      </div>
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="flex items-start gap-3 group"
      >
        <RouterLink :to="`/profile/${comment.username}`" class="flex-shrink-0">
          <UserAvatar :src="comment.userAvatarUrl" :username="comment.username" size="sm" />
        </RouterLink>
        <div class="flex-1 min-w-0">
          <div class="bg-gray-50 rounded-2xl px-3 py-2">
            <RouterLink :to="`/profile/${comment.username}`" class="font-semibold text-sm mr-1">
              {{ comment.username }}
            </RouterLink>
            <span class="text-sm">{{ comment.content }}</span>
          </div>
          <p class="text-xs text-gray-400 mt-1 ml-2">{{ timeAgo(comment.createdAt) }}</p>
        </div>
        <button
          v-if="canDelete(comment)"
          @click="handleDeleteComment(comment.id)"
          class="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500 flex-shrink-0"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Add Comment -->
    <div class="border-t border-gray-100 p-3 flex items-center gap-3">
      <UserAvatar :src="authStore.currentUser?.avatarUrl" :username="authStore.currentUser?.username" size="sm" />
      <div class="flex-1 flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2">
        <input
          v-model="newComment"
          @keydown.enter.prevent="submitComment"
          type="text"
          placeholder="Add a comment..."
          maxlength="1000"
          class="flex-1 bg-transparent text-sm focus:outline-none placeholder-gray-400"
        />
        <button
          @click="submitComment"
          :disabled="!newComment.trim() || submitting"
          class="text-blue-500 font-semibold text-sm disabled:opacity-40 hover:text-blue-700 transition-colors"
        >
          Post
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore.js'
import { commentApi } from '@/api/commentApi.js'
import UserAvatar from '@/components/user/UserAvatar.vue'
import { timeAgo } from '@/utils/dateUtils.js'

const props = defineProps({
  postId: { type: Number, required: true }
})

const emit = defineEmits(['comment-added'])
const authStore = useAuthStore()
const comments = ref([])
const newComment = ref('')
const loading = ref(false)
const submitting = ref(false)

onMounted(fetchComments)

async function fetchComments() {
  loading.value = true
  try {
    const response = await commentApi.getComments(props.postId)
    comments.value = response.data
  } catch (err) {
    console.error('Failed to load comments:', err)
  } finally {
    loading.value = false
  }
}

async function submitComment() {
  if (!newComment.value.trim() || submitting.value) return
  submitting.value = true
  try {
    const response = await commentApi.addComment(props.postId, newComment.value.trim())
    comments.value.push(response.data)
    newComment.value = ''
    emit('comment-added')
  } catch (err) {
    console.error('Failed to add comment:', err)
  } finally {
    submitting.value = false
  }
}

async function handleDeleteComment(commentId) {
  try {
    await commentApi.deleteComment(commentId)
    comments.value = comments.value.filter(c => c.id !== commentId)
  } catch (err) {
    console.error('Failed to delete comment:', err)
  }
}

function canDelete(comment) {
  return authStore.currentUser?.username === comment.username
}
</script>