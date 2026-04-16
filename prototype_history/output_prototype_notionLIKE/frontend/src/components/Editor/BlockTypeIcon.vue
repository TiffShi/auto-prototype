<template>
  <span class="block-type-icon" :title="type">{{ icon }}</span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'text',
  },
});

const icon = computed(() => {
  const map = {
    text: '¶',
    heading1: 'H1',
    heading2: 'H2',
    heading3: 'H3',
    bullet: '•',
    numbered: '№',
    todo: '☐',
    divider: '—',
  };
  return map[props.type] || '¶';
});
</script>

<style scoped>
.block-type-icon {
  font-size: 11px;
  color: #9b9a97;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.1s;
  font-weight: 600;
  flex-shrink: 0;
}

.block-type-icon:hover {
  background: #e9e9e7;
  color: #37352f;
}
</style>