<template>
  <div class="add-btn-wrapper">
    <button class="add-btn" @click="$emit('add')">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 2a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2H9v4a1 1 0 1 1-2 0V9H3a1 1 0 1 1 0-2h4V3a1 1 0 0 1 1-1z"/>
      </svg>
      <span>New Page</span>
    </button>
  </div>
</template>

<script setup>
defineEmits(['add']);
</script>

<style scoped>
.add-btn-wrapper {
  padding: 8px;
  border-top: 1px solid #e9e9e7;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13.5px;
  color: #9b9a97;
  transition: background 0.15s, color 0.15s;
  text-align: left;
}

.add-btn:hover {
  background: #e9e9e7;
  color: #37352f;
}
</style>