<template>
  <div class="relative px-16 pb-32 min-h-[400px]" @click.self="handleEditorClick">
    <!-- Loading -->
    <div v-if="editorStore.loading" class="flex items-center justify-center py-20">
      <div class="animate-spin w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full" />
    </div>

    <div v-else>
      <!-- Empty state -->
      <div
        v-if="!localBlocks.length"
        class="py-4 cursor-text"
        @click="addNewBlock()"
      >
        <p class="text-gray-300 text-lg select-none">Click here to start writing...</p>
      </div>

      <!-- Draggable blocks list -->
      <div v-else class="space-y-0.5">
        <DraggableBlock
          v-for="(block, index) in localBlocks"
          :key="block.id"
          :index="index"
          :is-dragging="dnd.isDragging.value"
          :dragged-index="dnd.draggedIndex.value"
          :drag-over-index="dnd.dragOverIndex.value"
          @drag-start="dnd.onDragStart(index)"
          @drag-over="dnd.onDragOver(index)"
          @drop="dnd.onDrop(index, localBlocks)"
          @drag-end="dnd.onDragEnd()"
        >
          <SingleBlock
            :block="block"
            :is-focused="focusedBlockId === block.id"
            @update="(content) => handleBlockUpdate(block, content)"
            @delete="handleBlockDelete(block, index)"
            @focus="focusedBlockId = block.id"
            @blur="focusedBlockId = null"
            @add-after="handleAddAfter(block, index)"
            @change-type="(type) => handleTypeChange(block, type)"
            @show-toolbar="handleShowToolbar"
            @slash-command="handleSlashCommand"
          />
        </DraggableBlock>
      </div>

      <!-- Add block button -->
      <div class="mt-4 pl-2">
        <button
          @click="addNewBlock()"
          class="flex items-center gap-2 text-sm text-gray-300 hover:text-gray-500 transition-colors group"
        >
          <span class="w-5 h-5 flex items-center justify-center rounded border border-dashed border-gray-200 group-hover:border-gray-400 transition-colors">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </span>
          Click to add a block
        </button>
      </div>
    </div>

    <!-- Formatting Toolbar -->
    <FormattingToolbar
      :editor="activeEditor"
      :visible="toolbarVisible"
      :x="toolbarX"
      :y="toolbarY"
    />

    <!-- Block Menu (slash command) -->
    <BlockMenu
      :visible="blockMenuVisible"
      :x="blockMenuX"
      :y="blockMenuY"
      :query="blockMenuQuery"
      @select="handleBlockMenuSelect"
      @close="blockMenuVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useEditorStore } from '@/stores/editor.js'
import { useDragAndDrop } from '@/composables/useDragAndDrop.js'
import DraggableBlock from './DraggableBlock.vue'
import FormattingToolbar from './FormattingToolbar.vue'
import BlockMenu from './BlockMenu.vue'
import SingleBlock from './SingleBlock.vue'

const props = defineProps({
  pageId: {
    type: String,
    required: true
  }
})

const editorStore = useEditorStore()

const localBlocks = ref([])
const focusedBlockId = ref(null)
const activeEditor = ref(null)

// Formatting toolbar state
const toolbarVisible = ref(false)
const toolbarX = ref(0)
const toolbarY = ref(0)

// Block menu state
const blockMenuVisible = ref(false)
const blockMenuX = ref(0)
const blockMenuY = ref(0)
const blockMenuQuery = ref('')
const blockMenuTargetBlock = ref(null)

// Drag and drop
const dnd = useDragAndDrop(async (reordered) => {
  localBlocks.value = reordered
  await editorStore.reorderBlocks(props.pageId, reordered)
})

watch(() => editorStore.blocks, (blocks) => {
  localBlocks.value = [...blocks]
}, { immediate: true, deep: true })

watch(() => props.pageId, async (id) => {
  if (id) {
    await editorStore.fetchBlocks(id)
  }
}, { immediate: true })

function handleEditorClick() {
  if (!localBlocks.value.length) {
    addNewBlock()
  }
}

async function addNewBlock(afterIndex = null) {
  const orderIndex = afterIndex !== null ? afterIndex + 1 : localBlocks.value.length
  try {
    const block = await editorStore.createBlock(props.pageId, {
      type: 'TEXT',
      content: '',
      orderIndex
    })
    focusedBlockId.value = block.id
  } catch (err) {
    console.error('Failed to create block:', err)
  }
}

async function handleBlockUpdate(block, content) {
  try {
    await editorStore.updateBlock(block.id, { content })
  } catch (err) {
    console.error('Failed to update block:', err)
  }
}

async function handleBlockDelete(block, index) {
  try {
    await editorStore.deleteBlock(block.id)
    // Focus previous block
    if (index > 0 && localBlocks.value[index - 1]) {
      focusedBlockId.value = localBlocks.value[index - 1]?.id
    }
  } catch (err) {
    console.error('Failed to delete block:', err)
  }
}

async function handleAddAfter(block, index) {
  await addNewBlock(index)
}

async function handleTypeChange(block, newType) {
  try {
    await editorStore.updateBlock(block.id, { type: newType })
  } catch (err) {
    console.error('Failed to change block type:', err)
  }
}

function handleShowToolbar({ editor, x, y }) {
  activeEditor.value = editor
  toolbarX.value = x
  toolbarY.value = y
  toolbarVisible.value = true
}

function handleSlashCommand({ block, x, y, query }) {
  blockMenuTargetBlock.value = block
  blockMenuX.value = x
  blockMenuY.value = y
  blockMenuQuery.value = query
  blockMenuVisible.value = true
}

function handleBlockMenuSelect(item) {
  if (blockMenuTargetBlock.value) {
    const typeMap = {
      paragraph: 'TEXT',
      heading1: 'H1',
      heading2: 'H2',
      heading3: 'H3',
      bulletList: 'BULLET_LIST',
      orderedList: 'NUMBERED_LIST',
      taskList: 'TODO',
      blockquote: 'QUOTE',
      codeBlock: 'CODE',
      horizontalRule: 'DIVIDER'
    }
    const backendType = typeMap[item.type] || 'TEXT'
    handleTypeChange(blockMenuTargetBlock.value, backendType)
  }
  blockMenuVisible.value = false
  blockMenuQuery.value = ''
  blockMenuTargetBlock.value = null
}

// Hide toolbar on click outside
function handleDocumentClick(e) {
  if (toolbarVisible.value) {
    toolbarVisible.value = false
  }
}
</script>