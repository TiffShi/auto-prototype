<template>
  <Teleport to="body">
    <div
      class="block-menu"
      :style="{ top: `${position.top}px`, left: `${position.left}px` }"
      @mousedown.prevent
    >
      <div class="block-menu-header">Block type</div>
      <div class="block-menu-list">
        <button
          v-for="item in filteredItems"
          :key="item.type"
          class="block-menu-item"
          :class="{ active: activeIndex === filteredItems.indexOf(item) }"
          @click="$emit('select', item.type)"
        >
          <span class="menu-item-icon">{{ item.icon }}</span>
          <div class="menu-item-info">
            <span class="menu-item-label">{{ item.label }}</span>
            <span class="menu-item-desc">{{ item.description }}</span>
          </div>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  position: {
    type: Object,
    default: () => ({ top: 0, left: 0 }),
  },
  filter: {
    type: String,
    default: '',
  },
});

defineEmits(['select', 'close']);

const activeIndex = ref(0);

const allItems = [
  { type: 'text', icon: '¶', label: 'Text', description: 'Plain paragraph' },
  { type: 'heading1', icon: 'H1', label: 'Heading 1', description: 'Large section heading' },
  { type: 'heading2', icon: 'H2', label: 'Heading 2', description: 'Medium section heading' },
  { type: 'heading3', icon: 'H3', label: 'Heading 3', description: 'Small section heading' },
  { type: 'bullet', icon: '•', label: 'Bullet List', description: 'Unordered list item' },
  { type: 'numbered', icon: '1.', label: 'Numbered List', description: 'Ordered list item' },
  { type: 'todo', icon: '☐', label: 'To-do', description: 'Checkbox task item' },
  { type: 'divider', icon: '—', label: 'Divider', description: 'Horizontal separator' },
];

const filteredItems = computed(() => {
  if (!props.filter) return allItems;
  const q = props.filter.toLowerCase();
  return allItems.filter(
    (i) => i.label.toLowerCase().includes(q) || i.type.includes(q)
  );
});
</script>

<style scoped>
.block-menu {
  position: absolute;
  z-index: 1000;
  background: #ffffff;
  border: 1px solid #e9e9e7;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08);
  width: 280px;
  overflow: hidden;
  animation: menuIn 0.1s ease;
}

@keyframes menuIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.block-menu-header {
  font-size: 11px;
  font-weight: 600;
  color: #9b9a97;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 10px 12px 6px;
}

.block-menu-list {
  padding: 4px;
  max-height: 320px;
  overflow-y: auto;
}

.block-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
}

.block-menu-item:hover,
.block-menu-item.active {
  background: #f0f0ef;
}

.menu-item-icon {
  width: 32px;
  height: 32px;
  background: #f7f6f3;
  border: 1px solid #e9e9e7;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #37352f;
  flex-shrink: 0;
}

.menu-item-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.menu-item-label {
  font-size: 13.5px;
  font-weight: 500;
  color: #37352f;
}

.menu-item-desc {
  font-size: 11.5px;
  color: #9b9a97;
}
</style>