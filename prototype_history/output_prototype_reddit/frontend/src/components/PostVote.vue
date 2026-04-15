<template>
  <div class="vote-widget" :class="{ 'vote-widget--inline': inline }">
    <button
      class="vote-btn vote-btn--up"
      :class="{ active: lastVote === 'up' }"
      @click.stop="handleVote('up')"
      :disabled="loading"
      title="Upvote"
    >
      ▲
    </button>
    <span class="vote-score">{{ score }}</span>
    <button
      class="vote-btn vote-btn--down"
      :class="{ active: lastVote === 'down' }"
      @click.stop="handleVote('down')"
      :disabled="loading"
      title="Downvote"
    >
      ▼
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  inline: { type: Boolean, default: false },
})

const emit = defineEmits(['vote'])

const lastVote = ref(null)

const score = computed(() => props.upvotes - props.downvotes)

function handleVote(direction) {
  lastVote.value = direction
  emit('vote', direction)
}
</script>

<style scoped>
.vote-widget {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 36px;
}

.vote-widget--inline {
  flex-direction: row;
  gap: 6px;
}

.vote-btn {
  background: none;
  border: none;
  font-size: 0.85rem;
  color: #878a8c;
  padding: 4px 6px;
  border-radius: 4px;
  transition: color 0.1s, background 0.1s;
  line-height: 1;
}

.vote-btn:hover:not(:disabled) {
  background: #e8e8e8;
}

.vote-btn--up:hover:not(:disabled),
.vote-btn--up.active {
  color: #ff4500;
}

.vote-btn--down:hover:not(:disabled),
.vote-btn--down.active {
  color: #7193ff;
}

.vote-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vote-score {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1c1c1c;
  min-width: 20px;
  text-align: center;
}
</style>