<template>
  <div class="post-card" @click="goToPost">
    <div class="post-card-vote">
      <PostVote
        :upvotes="post.upvotes"
        :downvotes="post.downvotes"
        :loading="voting"
        @vote="handleVote"
      />
    </div>

    <div class="post-card-body">
      <div class="post-meta">
        <router-link
          :to="`/communities/${post.community_id}`"
          class="community-tag"
          @click.stop
        >
          r/{{ communityName }}
        </router-link>
        <span class="meta-sep">•</span>
        <span class="meta-author">Posted by u/{{ post.author }}</span>
        <span class="meta-sep">•</span>
        <span class="meta-time">{{ timeAgo(post.created_at) }}</span>
      </div>

      <h2 class="post-title">{{ post.title }}</h2>

      <p v-if="post.body" class="post-excerpt">
        {{ truncate(post.body, 200) }}
      </p>

      <div class="post-actions">
        <router-link :to="`/posts/${post.id}`" class="action-btn" @click.stop>
          💬 Comments
        </router-link>
        <button
          v-if="canDelete"
          class="action-btn action-btn--delete"
          @click.stop="handleDelete"
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
import { useRouter } from 'vue-router'
import PostVote from './PostVote.vue'
import { useUserStore } from '../stores/userStore.js'
import { usePostStore } from '../stores/postStore.js'
import { useCommunityStore } from '../stores/communityStore.js'

const props = defineProps({
  post: { type: Object, required: true },
})

const router = useRouter()
const userStore = useUserStore()
const postStore = usePostStore()
const communityStore = useCommunityStore()

const voting = ref(false)
const deleting = ref(false)

const canDelete = computed(() => userStore.username === props.post.author)

const communityName = computed(() => {
  const c = communityStore.getCommunityById(props.post.community_id)
  return c ? c.name : props.post.community_id.slice(0, 8)
})

function goToPost() {
  router.push(`/posts/${props.post.id}`)
}

async function handleVote(direction) {
  voting.value = true
  try {
    await postStore.castVote(props.post.id, direction)
  } finally {
    voting.value = false
  }
}

async function handleDelete() {
  if (!confirm('Delete this post?')) return
  deleting.value = true
  try {
    await postStore.removePost(props.post.id)
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

function truncate(text, len) {
  return text.length > len ? text.slice(0, len) + '…' : text
}
</script>

<style scoped>
.post-card {
  display: flex;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.15s;
  overflow: hidden;
}

.post-card:hover {
  border-color: #898989;
}

.post-card-vote {
  background: #f8f9fa;
  padding: 8px 6px;
  display: flex;
  align-items: flex-start;
  min-width: 48px;
  justify-content: center;
}

.post-card-body {
  flex: 1;
  padding: 10px 12px;
  min-width: 0;
}

.post-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 0.75rem;
  color: #878a8c;
  margin-bottom: 6px;
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

.post-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 6px;
  line-height: 1.3;
}

.post-excerpt {
  font-size: 0.875rem;
  color: #555;
  line-height: 1.5;
  margin-bottom: 8px;
}

.post-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
  text-decoration: none;
  transition: background 0.1s, color 0.1s;
}

.action-btn:hover {
  background: #e8e8e8;
  color: #333;
}

.action-btn--delete:hover {
  background: #ffe0e0;
  color: #c0392b;
}
</style>