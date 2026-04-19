<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <h1 class="text-xl font-bold mb-6">Explore</h1>

    <!-- Loading skeleton -->
    <div v-if="postStore.loading && postStore.explorePosts.length === 0" class="grid grid-cols-3 gap-0.5">
      <div
        v-for="i in 12"
        :key="i"
        class="bg-gray-200 animate-pulse"
        style="aspect-ratio: 1;"
      ></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="postStore.explorePosts.length === 0" class="text-center py-20">
      <svg class="w-20 h-20 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      <p class="text-gray-400 font-medium">No posts to explore yet</p>
    </div>

    <!-- Grid -->
    <div v-else>
      <PostGrid :posts="postStore.explorePosts" />

      <div class="text-center py-6">
        <button
          v-if="postStore.hasMoreExplore && !postStore.loading"
          @click="loadMore"
          class="btn-outline text-sm"
        >
          Load more
        </button>
        <div v-if="postStore.loading" class="flex justify-center">
          <div class="spinner w-6 h-6"></div>
        </div>
        <p v-if="!postStore.hasMoreExplore && postStore.explorePosts.length > 0" class="text-gray-400 text-sm">
          You've seen everything!
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePostStore } from '@/stores/postStore.js'
import PostGrid from '@/components/post/PostGrid.vue'

const postStore = usePostStore()

onMounted(() => {
  postStore.fetchExplore(true)
})

function loadMore() {
  postStore.fetchExplore()
}
</script>