<template>
  <div class="post-detail-view">
    <div v-if="postStore.loading && !post" class="state-msg">
      Loading post…
    </div>
    <div v-else-if="postStore.error" class="state-msg state-msg--error">
      {{ postStore.error }}
    </div>
    <template v-else-if="post">
      <!-- Post detail card -->
      <div class="post-detail-card">
        <div class="post-vote-col">
          <PostVote
            :upvotes="post.upvotes"
            :downvotes="post.downvotes"
            :loading="voting"
            @vote="handleVote"
          />
        </div>

        <div class="post-content">
          <div class="post-meta">
            <router-link
              :to="`/communities/${post.community_id}`"
              class="community-tag"
            >
              r/{{ communityName }}
            </router-link>
            <span class="meta-sep">•</span>
            <span class="meta-text">Posted by u/{{ post.author }}</span>
            <span class="meta-sep">•</span>
            <span class="meta-text">{{ timeAgo(post.created_at) }}</span>
          </div>

          <h1 class="post-title">{{ post.title }}</h1>

          <div v-if="post.body" class="post-body">
            {{ post.body }}
          </div>

          <div class="post-actions">
            <span class="action-info">
              💬 {{ comments.length }} comment{{ comments.length !== 1 ? 's' : '' }}
            </span>
            <button
              v-if="canDelete"
              class="action-btn action-btn--delete"
              @click="handleDelete"
              :disabled="deleting"
            >
              🗑 {{ deleting ? 'Deleting…' : 'Delete Post' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Comment form -->
      <div v-if="userStore.hasUsername" class="comment-section">
        <CommentForm :postId="post.id" @commented="onNewComment" />
      </div>
      <div v-else class="state-msg">
        Set a username to leave a comment.
      </div>

      <!-- Comments list -->
      <div class="comments-card">
        <h2 class="comments-title">
          💬 Comments ({{ comments.length }})
        </h2>

        <div v-if="commentsLoading" class="state-msg">
          Loading comments…
        </div>
        <div v-else-if="commentsError" class="state-msg state-msg--error">
          {{ commentsError }}
        </div>
        <div v-else-if="comments.length === 0" class="no-comments">
          No comments yet. Be the first!
        </div>
        <div v-else class="comments-list">
          <CommentItem
            v-for="comment in comments"
            :key="comment.id"
            :comment="comment"
            @deleted="onCommentDeleted"
            @updated="onCommentUpdated"
          />
        </div>
      </div>
    </template>
    <div v-else class="state-msg state-msg--error">Post not found.</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PostVote from '../components/PostVote.vue'
import CommentForm from '../components/CommentForm.vue'
import CommentItem from '../components/CommentItem.vue'
import { usePostStore } from '../stores/postStore.js'
import { useCommunityStore } from '../stores/communityStore.js'
import { useUserStore } from '../stores/userStore.js'
import * as api from '../api/index.js'

const route = useRoute()
const router = useRouter()
const postStore = usePostStore()
const communityStore = useCommunityStore()
const userStore = useUserStore()

const comments = ref([])
const commentsLoading = ref(false)
const commentsError = ref(null)
const voting = ref(false)
const deleting = ref(false)

const post = computed(() => postStore.currentPost)

const communityName = computed(() => {
  if (!post.value) return ''
  const c = communityStore.getCommunityById(post.value.community_id)
  return c ? c.name : post.value.community_id.slice(0, 8)
})

const canDelete = computed(
  () => post.value && userStore.username === post.value.author
)

onMounted(async () => {
  const id = route.params.id
  await Promise.all([
    postStore.fetchPost(id),
    communityStore.fetchCommunities(),
    loadComments(id),
  ])
})

async function loadComments(postId) {
  commentsLoading.value = true
  commentsError.value = null
  try {
    const res = await api.getComments(postId)
    comments.value = res.data
  } catch (e) {
    commentsError.value = e?.response?.data?.detail || 'Failed to load comments.'
  } finally {
    commentsLoading.value = false
  }
}

async function handleVote(direction) {
  voting.value = true
  try {
    await postStore.castVote(post.value.id, direction)
  } finally {
    voting.value = false
  }
}

async function handleDelete() {
  if (!confirm('Delete this post and all its comments?')) return
  deleting.value = true
  try {
    await postStore.removePost(post.value.id)
    router.push('/')
  } finally {
    deleting.value = false
  }
}

function onNewComment(comment) {
  comments.value.push(comment)
}

function onCommentDeleted(id) {
  comments.value = comments.value.filter((c) => c.id !== id)
}

function onCommentUpdated(updated) {
  const idx = comments.value.findIndex((c) => c.id === updated.id)
  if (idx !== -1) comments.value[idx] = updated
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
.post-detail-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 740px;
}

.post-detail-card {
  display: flex;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

.post-vote-col {
  background: #f8f9fa;
  padding: 10px 8px;
  display: flex;
  align-items: flex-start;
  min-width: 48px;
  justify-content: center;
}

.post-content {
  flex: 1;
  padding: 14px 16px;
  min-width: 0;
}

.post-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 0.75rem;
  color: #878a8c;
  margin-bottom: 8px;
}

.community-tag {
  font-weight: 700;
  color: #1c1c1c;
  text-decoration: none;
}

.community-tag:hover {
  text-decoration: underline;
}

.meta-sep {
  color: #ccc;
}

.meta-text {
  color: #878a8c;
}

.post-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 12px;
  line-height: 1.3;
}

.post-body {
  font-size: 0.95rem;
  color: #333;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 14px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.action-info {
  font-size: 0.82rem;
  font-weight: 600;
  color: #878a8c;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #878a8c;
  background: none;
  border: none;
  padding: 4px 8px;
  border-radius: 2px;
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}

.action-btn--delete:hover:not(:disabled) {
  background: #ffe0e0;
  color: #c0392b;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comment-section {
  margin-top: 4px;
}

.comments-card {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 16px;
}

.comments-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1c1c1c;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #edeff1;
}

.no-comments {
  text-align: center;
  color: #878a8c;
  font-size: 0.9rem;
  padding: 24px 0;
}

.comments-list {
  display: flex;
  flex-direction: column;
}

.state-msg {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  color: #555;
  font-size: 0.9rem;
}

.state-msg--error {
  color: #c0392b;
  border-color: #f5c6cb;
  background: #fff5f5;
}
</style>