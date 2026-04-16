<template>
  <div
    class="block-wrapper"
    :data-block-id="block.id"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <!-- Drag handle + block type icon -->
    <div class="block-gutter" :class="{ visible: hovered }">
      <span class="drag-handle" title="Drag to reorder">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="4" r="1.2"/><circle cx="11" cy="4" r="1.2"/>
          <circle cx="5" cy="8" r="1.2"/><circle cx="11" cy="8" r="1.2"/>
          <circle cx="5" cy="12" r="1.2"/><circle cx="11" cy="12" r="1.2"/>
        </svg>
      </span>
      <BlockTypeIcon :type="block.type" />
    </div>

    <!-- Block content area -->
    <div class="block-content-area">
      <!-- Divider -->
      <template v-if="block.type === 'divider'">
        <div class="block-divider">
          <hr />
        </div>
      </template>

      <!-- Todo -->
      <template v-else-if="block.type === 'todo'">
        <div class="block-todo">
          <input
            type="checkbox"
            class="todo-checkbox"
            :checked="block.checked"
            @change="toggleChecked"
          />
          <div
            ref="contentEl"
            class="block-content"
            :class="{ 'todo-checked': block.checked }"
            contenteditable="true"
            :data-placeholder="placeholder"
            spellcheck="false"
            @input="onInput"
            @keydown="onKeydown"
            @focus="onFocus"
            @blur="onBlur"
          ></div>
        </div>
      </template>

      <!-- All other text-based blocks -->
      <template v-else>
        <div
          ref="contentEl"
          class="block-content"
          :class="[`block-${block.type}`]"
          contenteditable="true"
          :data-placeholder="placeholder"
          spellcheck="false"
          @input="onInput"
          @keydown="onKeydown"
          @focus="onFocus"
          @blur="onBlur"
        ></div>
      </template>

      <!-- Slash command menu -->
      <BlockMenu
        v-if="showMenu"
        :position="menuPosition"
        @select="selectBlockType"
        @close="closeMenu"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import BlockTypeIcon from './BlockTypeIcon.vue';
import BlockMenu from './BlockMenu.vue';

const props = defineProps({
  block: { type: Object, required: true },
  pageId: { type: String, required: true },
  index: { type: Number, required: true },
  total: { type: Number, required: true },
});

const emit = defineEmits([
  'enter-pressed',
  'backspace-empty',
  'focus-block',
  'update',
  'type-change',
]);

const contentEl = ref(null);
const hovered = ref(false);
const showMenu = ref(false);
const menuPosition = ref({ top: 0, left: 0 });
let internalUpdate = false;

const placeholder = computed(() => {
  const map = {
    text: "Type '/' for commands…",
    heading1: 'Heading 1',
    heading2: 'Heading 2',
    heading3: 'Heading 3',
    bullet: 'List item',
    numbered: 'List item',
    todo: 'To-do',
  };
  return map[props.block.type] || "Type '/' for commands…";
});

// Sync content from prop to DOM
onMounted(() => {
  if (contentEl.value && props.block.type !== 'divider') {
    contentEl.value.textContent = props.block.content || '';
  }
});

watch(
  () => props.block.content,
  (newVal) => {
    if (internalUpdate) return;
    if (contentEl.value && contentEl.value.textContent !== newVal) {
      contentEl.value.textContent = newVal || '';
    }
  }
);

watch(
  () => props.block.type,
  async () => {
    await nextTick();
    if (contentEl.value) {
      contentEl.value.textContent = props.block.content || '';
    }
  }
);

function onInput() {
  if (!contentEl.value) return;
  const text = contentEl.value.textContent || '';

  // Check for slash command
  if (text === '/') {
    openMenu();
    return;
  }

  // Close menu if text no longer starts with /
  if (showMenu.value && !text.startsWith('/')) {
    closeMenu();
  }

  internalUpdate = true;
  emit('update', props.block.id, { content: text });
  setTimeout(() => { internalUpdate = false; }, 0);
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (showMenu.value) {
      closeMenu();
      return;
    }
    emit('enter-pressed');
  }

  if (e.key === 'Backspace') {
    const text = contentEl.value?.textContent || '';
    if (text === '') {
      e.preventDefault();
      emit('backspace-empty');
    }
    if (showMenu.value) {
      // Let backspace work in menu filter
      nextTick(() => {
        const t = contentEl.value?.textContent || '';
        if (!t.startsWith('/')) closeMenu();
      });
    }
  }

  if (e.key === 'Escape' && showMenu.value) {
    closeMenu();
  }

  if (e.key === 'ArrowUp' && showMenu.value) {
    e.preventDefault();
  }
  if (e.key === 'ArrowDown' && showMenu.value) {
    e.preventDefault();
  }
}

function onFocus() {
  // nothing special needed
}

function onBlur() {
  setTimeout(() => {
    if (showMenu.value) closeMenu();
  }, 150);
}

function openMenu() {
  if (!contentEl.value) return;
  const rect = contentEl.value.getBoundingClientRect();
  menuPosition.value = {
    top: rect.bottom + window.scrollY + 4,
    left: rect.left + window.scrollX,
  };
  showMenu.value = true;
}

function closeMenu() {
  showMenu.value = false;
}

function selectBlockType(type) {
  closeMenu();
  // Clear the slash from content
  if (contentEl.value) {
    contentEl.value.textContent = '';
  }
  internalUpdate = true;
  emit('update', props.block.id, { content: '' });
  emit('type-change', props.block.id, type);
  setTimeout(() => { internalUpdate = false; }, 0);
}

function toggleChecked(e) {
  emit('update', props.block.id, { checked: e.target.checked });
}
</script>

<style scoped>
.block-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  position: relative;
  margin: 1px 0;
  border-radius: 4px;
  transition: background 0.1s;
}

.block-wrapper:hover {
  background: rgba(55, 53, 47, 0.03);
}

.block-gutter {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
  padding-top: 3px;
  width: 48px;
  justify-content: flex-end;
}

.block-gutter.visible {
  opacity: 1;
}

.drag-handle {
  cursor: grab;
  color: #9b9a97;
  padding: 2px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  transition: background 0.1s;
}

.drag-handle:hover {
  background: #e9e9e7;
  color: #37352f;
}

.drag-handle:active {
  cursor: grabbing;
}

.block-content-area {
  flex: 1;
  min-width: 0;
  position: relative;
}

/* ── Block content styles ── */
.block-content {
  outline: none;
  border: none;
  width: 100%;
  font-size: 16px;
  line-height: 1.6;
  color: #37352f;
  padding: 3px 2px;
  word-break: break-word;
  min-height: 28px;
  cursor: text;
}

.block-content:empty::before {
  content: attr(data-placeholder);
  color: #c7c6c3;
  pointer-events: none;
}

.block-heading1 {
  font-size: 30px;
  font-weight: 700;
  line-height: 1.3;
  padding: 8px 2px 4px;
}

.block-heading2 {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.3;
  padding: 6px 2px 3px;
}

.block-heading3 {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
  padding: 4px 2px 2px;
}

.block-bullet {
  padding-left: 4px;
}

.block-bullet::before {
  content: '•';
  margin-right: 8px;
  color: #37352f;
}

.block-numbered {
  padding-left: 4px;
}

/* Todo styles */
.block-todo {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 2px 0;
}

.todo-checkbox {
  margin-top: 5px;
  width: 16px;
  height: 16px;
  cursor: pointer;
  flex-shrink: 0;
  accent-color: #2383e2;
}

.todo-checked {
  text-decoration: line-through;
  color: #9b9a97;
}

/* Divider */
.block-divider {
  padding: 12px 0;
}

.block-divider hr {
  border: none;
  border-top: 1px solid #e9e9e7;
}
</style>