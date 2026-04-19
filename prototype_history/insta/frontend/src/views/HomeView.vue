<template>
  <div class="max-w-5xl mx-auto px-4 py-6 flex gap-8">
    <!-- Feed -->
    <div class="flex-1 max-w-lg mx-auto lg:mx-0">
      <!-- Stories placeholder -->
      <div class="card p-4 mb-4 overflow-x-auto scrollbar-hide">
        <div class="flex gap-4">
          <div
            v-for="i in 6"
            :key="i"
            class="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer"
          >
            <div class="w-14 h-14 rounded-full instagram-gradient p-0.5">
              <div class="w-full h-full rounded-full bg-gray-200 border-2 border-white"></div>
            </div>
            <span class="text-xs text-gray-500 truncate w-14 text-center">user_{{ i }}</span>
          </div>
        </div>
      </div>

      <!-- Posts -->
      <div v-if="postStore.loading && postStore.feedPosts.length === 0" class="space-y-4">
        <PostSkeleton v-for="i in 3" :key="i" />
      </div>

      <div v-else-if="postStore.feedPosts.length === 0 && !postStore.loading" class="card p-12 text-center">
        <svg class="w-20 h-20 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <h3 class="font-semibold text-gray-700 mb-2">Your feed is empty</h3>
        <p class="text-gray-400 text-sm mb-4">Follow people to see their posts here</p>
        <RouterLink to="/explore" class="btn-primary inline-block">Explore posts</RouterLink>
      </div>

      <div v-else>
        <PostCard
          v-for="post in postStore.feedPosts"
          :key="post.id"
          :post="post"
          @deleted="handlePostDeleted"
        />

        <!-- Load More -->
        <div class="text-center py-4">
          <button
            v-if="postStore.hasMoreFeed && !postStore.loading"
            @click="loadMore"
            class="btn-outline text-sm"
          >
            Load more
          </button>
          <div v-if="postStore.loading && postStore.feedPosts.length > 0" class="flex justify-center">
            <div class="spinner w-6 h-6"></div>
          </div>
          <p v-if="!postStore.hasMoreFeed" class="text-gray-400 text-sm">You're all caught up!</p>
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="hidden lg:block w-80 flex-shrink-0">
      <SideBar />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePostStore } from '@/stores/postStore.js'
import PostCard from '@/components/post/PostCard.vue'
import SideBar from '@/components/layout/SideBar.vue'
import PostSkeleton from '@/components/post/PostSkeleton.vue'

const postStore = usePostStore()

onMounted(() => {
  postStore.fetchFeed(true)
})

function loadMore() {
  postStore.fetchFeed()
}

function handlePostDeleted(postId) {
  // already handled in store
}
</script>