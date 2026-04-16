<template>
  <div class="page-title-wrapper">
    <div
      ref="titleEl"
      class="page-title"
      contenteditable="true"
      :data-placeholder="'Untitled'"
      @input="onInput"
      @keydown.enter.prevent="focusFirstBlock"
      @blur="onBlur"
      spellcheck="false"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update']);
const titleEl = ref(null);
let internalUpdate = false;

onMounted(() => {
  if (titleEl.value) {
    titleEl.value.textContent = props.title || '';
  }
});

watch(
  () => props.title,
  (newVal) => {
    if (internalUpdate) return;
    if (titleEl.value && titleEl.value.textContent !== newVal) {
      titleEl.value.textContent = newVal || '';
    }
  }
);

function onInput() {
  internalUpdate = true;
  const text = titleEl.value?.textContent || '';
  emit('update', text);
  setTimeout(() => { internalUpdate = false; }, 0);
}

function onBlur() {
  const text = titleEl.value?.textContent?.trim() || '';
  emit('update', text || 'Untitled');
}

function focusFirstBlock() {
  // Find first block input in the editor
  const firstBlock = document.querySelector('.block-content[contenteditable]');
  if (firstBlock) {
    firstBlock.focus();
    // Place cursor at start
    const range = document.createRange();
    const sel = window.getSelection();
    range.setStart(firstBlock, 0);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}
</script>

<style scoped>
.page-title-wrapper {
  padding: 4px 0 8px;
}

.page-title {
  font-size: 40px;
  font-weight: 700;
  color: #37352f;
  line-height: 1.2;
  outline: none;
  border: none;
  width: 100%;
  cursor: text;
  word-break: break-word;
  min-height: 52px;
}

.page-title:empty::before {
  content: attr(data-placeholder);
  color: #c7c6c3;
  pointer-events: none;
}
</style>