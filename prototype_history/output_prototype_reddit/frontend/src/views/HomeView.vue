<template>
  <div class="home-view">
    <div class="feed-column">
      <div class="feed-header">
        <h1 class="feed-title">🏠 Home Feed</h1>
        <div class="sort-tabs">
          <button
            class="sort-tab"
            :class="{ active: sort === 'new' }"
            @click="sort = 'new'"
          >
            🆕 New
          </button>
          <button
            class="sort-tab"
            :class="{ active: sort === 'top' }"
            @click="sort = 'top'"
          >
            🔝 Top
          </button>
        </div>
      </div>

      <div v-if="postStore.loading" class="state-msg">Loading posts…</div>
      <div v-else-if="postStore.error" class="state-msg state-msg--error">
        {{ postStore.error }}
      </div>
      <div v-else-if="sortedPosts.length === 0" class="state-msg">
        No posts yet.
        <router-link to="/posts/create">Create the first one!</router-link>
      </div>
      <div v-else class="post-list">
        <PostCard v-for="post in sortedPosts" :key="post.id" :post="post" />
      </div>
    </div>

    <aside class="sidebar">
      <div class="sidebar-card">
        <h3 class="sidebar-title">🔥 VueReddit</h3>
        <p class="sidebar-desc">
          The front page of the Vue internet. Share posts, vote, and discuss in
          communities.
        </p>
        <router-link to="/posts/create" class="sidebar-btn">
          Create Post
        </router-link>
        <router-link to="/communities" class="sidebar-btn sidebar-btn--outline">
          Browse Communities
        </router-link>
      </div>

      <div class="sidebar-card">
        <h3 class="sidebar-title">📋 Communities</h3>
        <div v-if="communityStore.loading" class="sidebar-loading">
          Loading…
        </div>
        <ul v-else class="community-list">
          <li
            v-for="c in communityStore.communities.slice(0, 8)"
            :key="c.id"
          >
            <router-link :to="`/communities/${c.id}`" class="community-link">
              r/{{ c.name }}
            </router-link>
          </li>
        </ul>
        <router-link
          v-if="communityStore.communities.length > 8"
          to="/communities"
          class="see-all"
        >
          See all communities →
        </router-link>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PostCard from '../components/PostCard.vue'
import { usePostStore } from '../stores/postStore.js'
import { useCommunityStore } from '../stores/communityStore.js'

const postStore = usePostStore()
const communityStore = useCommunityStore()
const sort = ref('new')

const sortedPosts = computed(() => {
  const list = [...postStore.posts]
  if (sort.value === 'top') {
    return list.sort((a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes))
  }
  return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

onMounted(async () => {
  await Promise.all([postStore.fetchPosts(), communityStore.fetchCommunities()])
})
</script>

<style scoped>
.home-view {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.feed-column {
  flex: 1;
  min-width: 0;
}

.feed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
}

.feed-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1c1c1c;
}

.sort-tabs {
  display: flex;
  gap: 6px;
}

.sort-tab {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #555;
  transition: all 0.15s;
}

.sort-tab:hover,
.sort-tab.active {
  background: #ff4500;
  border-color: #ff4500;
  color: #fff;
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
  font-size: 0.95rem;
}

.state-msg a {
  color: #ff4500;
  font-weight: 600;
  text-decoration: underline;
}

.state-msg--error {
  color: #c0392b;
  border-color: #f5c6cb;
  background: #fff5f5;
}

/* Sidebar */
.sidebar {
  width: 312px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.sidebar-desc {
  font-size: 0.85rem;
  color: #555;
  line-height: 1.5;
  margin-bottom: 14px;
}

.sidebar-btn {
  display: block;
  text-align: center;
  background: #ff4500;
  color: #fff;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 8px;
  text-decoration: none;
  transition: background 0.15s;
}

.sidebar-btn:hover {
  background: #e03d00;
}

.sidebar-btn--outline {
  background: transparent;
  border: 1px solid #ff4500;
  color: #ff4500;
}

.sidebar-btn--outline:hover {
  background: #fff0ec;
}

.sidebar-loading {
  font-size: 0.85rem;
  color: #878a8c;
}

.community-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.community-link {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1c1c1c;
  text-decoration: none;
}

.community-link:hover {
  color: #ff4500;
  text-decoration: underline;
}

.see-all {
  display: block;
  margin-top: 10px;
  font-size: 0.82rem;
  color: #0079d3;
  text-decoration: none;
}

.see-all:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .home-view {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
  }
}
</style>