<template>
  <div class="comment-item">
    <div class="comment-left">
      <PostVote
        :upvotes="comment.upvotes"
        :downvotes="comment.downvotes"
        :loading="voting"
        @vote="handleVote"
      />
    </div>

    <div class="comment-body">
      <div class="comment-meta">
        <span class="comment-author">u/{{ comment.author }}</span>
        <span class="meta-sep">•</span>
        <span class="comment-time">{{ timeAgo(comment.created_at) }}</span>
      </div>

      <p class="comment-text">{{ comment.body }}</p>

      <div class="comment-actions">
        <button
          v-if="canDelete"
          class="delete-btn"
          @click="handleDelete"
          :disabled="deleting"
        >
          🗑 {{ deleting ? 'Deleting…' : 'Delete' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PostVote from './PostVote.vue'
import { useUserStore } from '../stores/userStore.js'
import * as api from '../api/index.js'

const props = defineProps({
  comment: { type: Object, required: true },
})

const emit = defineEmits(['deleted', 'updated'])

const userStore = useUserStore()
const voting = ref(false)
const deleting = ref(false)

const canDelete = computed(() => userStore.username === props.comment.author)

async function handleVote(direction) {
  voting.value = true
  try {
    const res = await api.voteComment(props.comment.id, direction)
    emit('updated', res.data)
  } finally {
    voting.value = false
  }
}

async function handleDelete() {
  if (!confirm('Delete this comment?')) return
  deleting.value = true
  try {
    await api.deleteComment(props.comment.id)
    emit('deleted', props.comment.id)
  } finally {
    deleting.value = false
  }
}

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
</script>

<style scoped>
.comment-item {
  display: flex;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #edeff1;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-left {
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: #878a8c;
  margin-bottom: 6px;
}

.comment-author {
  font-weight: 700;
  color: #1c1c1c;
}

.meta-sep {
  color: #ccc;
}

.comment-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-actions {
  margin-top: 6px;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 0.78rem;
  color: #878a8c;
  padding: 3px 6px;
  border-radius: 2px;
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}

.delete-btn:hover:not(:disabled) {
  background: #ffe0e0;
  color: #c0392b;
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>