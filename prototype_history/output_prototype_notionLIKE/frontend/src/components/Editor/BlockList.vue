<template>
  <div class="block-list" ref="listEl">
    <Block
      v-for="(block, index) in sortedBlocks"
      :key="block.id"
      :block="block"
      :page-id="pageId"
      :index="index"
      :total="sortedBlocks.length"
      @enter-pressed="handleEnter(block, index)"
      @backspace-empty="handleBackspaceEmpty(block, index)"
      @focus-block="focusBlock"
      @update="handleBlockUpdate"
      @type-change="handleTypeChange"
    />

    <!-- Click below blocks to add new text block -->
    <div class="block-list-footer" @click="addBlockAtEnd"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import Sortable from 'sortablejs';
import { usePageStore } from '@/store/usePageStore.js';
import Block from './Block.vue';

const props = defineProps({
  pageId: {
    type: String,
    required: true,
  },
  blocks: {
    type: Array,
    default: () => [],
  },
});

const pageStore = usePageStore();
const listEl = ref(null);
let sortableInstance = null;

const sortedBlocks = computed(() =>
  [...props.blocks].sort((a, b) => a.order - b.order)
);

// ── Sortable drag-and-drop ─────────────────────────────────────────────────
onMounted(() => {
  if (listEl.value) {
    sortableInstance = Sortable.create(listEl.value, {
      animation: 150,
      handle: '.drag-handle',
      draggable: '.block-wrapper',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      onEnd: async (evt) => {
        const orderedIds = [...listEl.value.querySelectorAll('.block-wrapper')]
          .map((el) => el.dataset.blockId)
          .filter(Boolean);
        await pageStore.reorderPageBlocks(props.pageId, orderedIds);
      },
    });
  }
});

onUnmounted(() => {
  sortableInstance?.destroy();
});

// ── Block operations ───────────────────────────────────────────────────────

async function handleEnter(block, index) {
  // Insert new text block after current block
  const newOrder = block.order + 0.5;
  const newBlock = await pageStore.addBlock(props.pageId, {
    type: 'text',
    content: '',
    order: newOrder,
  });

  if (newBlock) {
    await nextTick();
    focusBlock(newBlock.id);
  }
}

async function handleBackspaceEmpty(block, index) {
  if (sortedBlocks.value.length <= 1) return;

  await pageStore.removeBlock(props.pageId, block.id);

  await nextTick();
  // Focus previous block
  const prevIndex = index - 1;
  if (prevIndex >= 0 && sortedBlocks.value[prevIndex]) {
    focusBlock(sortedBlocks.value[prevIndex].id, true);
  }
}

function focusBlock(blockId, atEnd = false) {
  nextTick(() => {
    const el = document.querySelector(`[data-block-id="${blockId}"] .block-content`);
    if (el) {
      el.focus();
      if (atEnd) {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  });
}

let updateTimers = {};

function handleBlockUpdate(blockId, data) {
  // Optimistic local update
  pageStore.updateBlockLocal(blockId, data);

  // Debounced API call
  clearTimeout(updateTimers[blockId]);
  updateTimers[blockId] = setTimeout(async () => {
    await pageStore.editBlock(props.pageId, blockId, data);
  }, 500);
}

async function handleTypeChange(blockId, newType) {
  await pageStore.editBlock(props.pageId, blockId, { type: newType });
}

async function addBlockAtEnd() {
  const newBlock = await pageStore.addBlock(props.pageId, {
    type: 'text',
    content: '',
  });
  if (newBlock) {
    await nextTick();
    focusBlock(newBlock.id);
  }
}
</script>

<style scoped>
.block-list {
  min-height: 200px;
}

.block-list-footer {
  height: 100px;
  cursor: text;
}

:deep(.sortable-ghost) {
  opacity: 0.4;
  background: #e3f2fd;
  border-radius: 4px;
}

:deep(.sortable-chosen) {
  background: #f0f0f0;
  border-radius: 4px;
}
</style>