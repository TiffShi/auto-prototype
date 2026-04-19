<template>
  <div class="grid grid-cols-3 gap-0.5">
    <RouterLink
      v-for="post in posts"
      :key="post.id"
      :to="`/posts/${post.id}`"
      class="relative group overflow-hidden bg-gray-100"
      style="aspect-ratio: 1;"
    >
      <img
        :src="resolveImageUrl(post.imageUrl)"
        :alt="post.caption || 'Post'"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <!-- Hover overlay -->
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center gap-4">
        <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-4 text-white font-semibold">
          <span class="flex items-center gap-1">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {{ post.likeCount }}
          </span>
          <span class="flex items-center gap-1">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {{ post.commentCount }}
          </span>
        </div>
      </div>
    </RouterLink>
  </div>
</template>

<script setup>
const API_URL = import.meta.env.VITE_API_URL

defineProps({
  posts: { type: Array, default: () => [] }
})

function resolveImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${API_URL}${url}`
}
</script>