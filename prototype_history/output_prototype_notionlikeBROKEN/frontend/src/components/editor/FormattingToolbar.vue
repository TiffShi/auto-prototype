<template>
  <Teleport to="body">
    <Transition name="slide">
      <div
        v-if="visible && editor"
        class="fixed z-40 bg-gray-900 text-white rounded-lg shadow-xl flex items-center gap-0.5 p-1"
        :style="{ top: `${y}px`, left: `${x}px`, transform: 'translateX(-50%)' }"
      >
        <button
          @click="editor.chain().focus().toggleBold().run()"
          :class="['toolbar-btn', editor.isActive('bold') ? 'bg-gray-600' : '']"
          title="Bold (⌘B)"
        >
          <strong class="text-sm">B</strong>
        </button>

        <button
          @click="editor.chain().focus().toggleItalic().run()"
          :class="['toolbar-btn', editor.isActive('italic') ? 'bg-gray-600' : '']"
          title="Italic (⌘I)"
        >
          <em class="text-sm">I</em>
        </button>

        <button
          @click="editor.chain().focus().toggleUnderline().run()"
          :class="['toolbar-btn', editor.isActive('underline') ? 'bg-gray-600' : '']"
          title="Underline (⌘U)"
        >
          <span class="text-sm underline">U</span>
        </button>

        <button
          @click="editor.chain().focus().toggleStrike().run()"
          :class="['toolbar-btn', editor.isActive('strike') ? 'bg-gray-600' : '']"
          title="Strikethrough"
        >
          <span class="text-sm line-through">S</span>
        </button>

        <button
          @click="editor.chain().focus().toggleCode().run()"
          :class="['toolbar-btn', editor.isActive('code') ? 'bg-gray-600' : '']"
          title="Inline code"
        >
          <span class="text-sm font-mono">&lt;/&gt;</span>
        </button>

        <div class="w-px h-5 bg-gray-600 mx-0.5" />

        <button
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="['toolbar-btn text-xs font-bold', editor.isActive('heading', { level: 1 }) ? 'bg-gray-600' : '']"
          title="Heading 1"
        >
          H1
        </button>

        <button
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="['toolbar-btn text-xs font-bold', editor.isActive('heading', { level: 2 }) ? 'bg-gray-600' : '']"
          title="Heading 2"
        >
          H2
        </button>

        <button
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
          :class="['toolbar-btn text-xs font-bold', editor.isActive('heading', { level: 3 }) ? 'bg-gray-600' : '']"
          title="Heading 3"
        >
          H3
        </button>

        <div class="w-px h-5 bg-gray-600 mx-0.5" />

        <button
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="['toolbar-btn', editor.isActive('bulletList') ? 'bg-gray-600' : '']"
          title="Bullet list"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </button>

        <button
          @click="editor.chain().focus().toggleOrderedList().run()"
          :class="['toolbar-btn', editor.isActive('orderedList') ? 'bg-gray-600' : '']"
          title="Numbered list"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20h14M7 12h14M7 4h14M3 20h.01M3 12h.01M3 4h.01" />
          </svg>
        </button>

        <button
          @click="editor.chain().focus().toggleBlockquote().run()"
          :class="['toolbar-btn', editor.isActive('blockquote') ? 'bg-gray-600' : '']"
          title="Quote"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  editor: Object,
  visible: Boolean,
  x: Number,
  y: Number
})
</script>

<style scoped>
.toolbar-btn {
  @apply w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700 transition-colors cursor-pointer;
}
</style>