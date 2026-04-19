<template>
  <div class="community-view">
    <div v-if="communityStore.loading && !community" class="state-msg">
      Loading community…
    </div>
    <div v-else-if="communityStore.error" class="state-msg state-msg--error">
      {{ communityStore.error }}
    </div>
    <template v-else-if="community">
      <div class="community-banner">
        <div class="community-banner-inner">
          <div class="community-avatar">🏘</div>
          <div class="community-info">
            <h1 class="community-name">r/{{ community.name }}</h1>
            <p class="community-desc">
              {{ community.description || 'No description.' }}
            </p>
          </div>
          <router-link
            :to="`/posts/create?community=${community.id}`"
            class="create-post-btn"
          >
            + Create Post
          </router-link>
        </div>
      </div>

      <div class="content-row">
        <div class="feed-col">
          <div v-if="postStore.loading" class="state-msg">Loading posts…</div>
          <div
            v-else-if="postStore.error"
            class="state-msg state-msg--error"
          >
            {{ postStore.error }}
          </div>
          <div v-else-if="postStore.posts.length === 0" class="state-msg">
            No posts in this community yet.
          </div>
          <div v-else class="post-list">
            <PostCard
              v-for="post in postStore.posts"
              :key="post.id"
              :post="post"
            />
          </div>
        </div>

        <aside class="sidebar">
          <div class="sidebar-card">
            <h3 class="sidebar-title">About r/{{ community.name }}</h3>
            <p class="sidebar-text">
              {{ community.description || 'No description provided.' }}
            </p>
            <hr class="divider" />
            <p class="sidebar-meta">
              📅 Created {{ formatDate(community.created_at) }}
            </p>
          </div>
        </aside>
      </div>
    </template>
    <div v-else class="state-msg state-msg--error">Community not found.</div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PostCard from '../components/PostCard.vue'
import { usePostStore } from '../stores/postStore.js'
import { useCommunityStore } from '../stores/communityStore.js'

const route = useRoute()
const postStore = usePostStore()
const communityStore = useCommunityStore()

const community = computed(() => communityStore.currentCommunity)

onMounted(async () => {
  const id = route.params.id
  await Promise.all([
    communityStore.fetchCommunity(id),
    postStore.fetchPosts(id),
    communityStore.fetchCommunities(),
  ])
})

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.community-view {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.community-banner {
  background: linear-gradient(135deg, #ff4500, #ff6534);
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
}

.community-banner-inner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  flex-wrap: wrap;
}

.community-avatar {
  font-size: 3rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.community-info {
  flex: 1;
  min-width: 0;
}

.community-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
}

.community-desc {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
}

.create-post-btn {
  background: #fff;
  color: #ff4500;
  border-radius: 20px;
  padding: 8px 18px;
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.15s;
  flex-shrink: 0;
}

.create-post-btn:hover {
  background: #fff0ec;
}

.content-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.feed-col {
  flex: 1;
  min-width: 0;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.state-msg {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 32px;
  text-align: center;
  color: #555;
}

.state-msg--error {
  color: #c0392b;
  border-color: #f5c6cb;
  background: #fff5f5;
}

.sidebar {
  width: 312px;
  flex-shrink: 0;
}

.sidebar-card {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 16px;
}

.sidebar-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #1c1c1c;
}

.sidebar-text {
  font-size: 0.875rem;
  color: #555;
  line-height: 1.5;
}

.divider {
  border: none;
  border-top: 1px solid #edeff1;
  margin: 12px 0;
}

.sidebar-meta {
  font-size: 0.82rem;
  color: #878a8c;
}

@media (max-width: 768px) {
  .content-row {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
  }
}
</style>