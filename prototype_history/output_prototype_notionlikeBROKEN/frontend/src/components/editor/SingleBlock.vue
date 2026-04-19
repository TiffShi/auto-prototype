<template>
  <div
    class="relative group/block py-0.5"
    @mouseup="handleMouseUp"
  >
    <!-- Block type indicator for special blocks -->
    <div v-if="block.type === 'DIVIDER'" class="py-3">
      <hr class="border-gray-200" />
    </div>

    <div v-else>
      <editor-content
        v-if="editor"
        :editor="editor"
        class="prose prose-sm max-w-none focus:outline-none"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import Code from '@tiptap/extension-code'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Blockquote from '@tiptap/extension-blockquote'
import CodeBlock from '@tiptap/extension-code-block'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import HardBreak from '@tiptap/extension-hard-break'
import History from '@tiptap/extension-history'
import Placeholder from '@tiptap/extension-placeholder'
import { useAutoSave } from '@/composables/useAutoSave.js'

const props = defineProps({
  block: {
    type: Object,
    required: true
  },
  isFocused: Boolean
})

const emit = defineEmits([
  'update',
  'delete',
  'focus',
  'blur',
  'add-after',
  'change-type',
  'show-toolbar',
  'slash-command'
])

function getInitialContent(block) {
  const content = block.content || ''

  switch (block.type) {
    case 'H1':
      return `<h1>${content}</h1>`
    case 'H2':
      return `<h2>${content}</h2>`
    case 'H3':
      return `<h3>${content}</h3>`
    case 'BULLET_LIST':
      return content ? `<ul><li><p>${content}</p></li></ul>` : '<ul><li><p></p></li></ul>'
    case 'NUMBERED_LIST':
      return content ? `<ol><li><p>${content}</p></li></ol>` : '<ol><li><p></p></li></ol>'
    case 'TODO':
      return `<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>${content}</p></li></ul>`
    case 'QUOTE':
      return `<blockquote><p>${content}</p></blockquote>`
    case 'CODE':
      return `<pre><code>${content}</code></pre>`
    case 'DIVIDER':
      return '<p></p>'
    default:
      return content ? `<p>${content}</p>` : '<p></p>'
  }
}

const { triggerSave } = useAutoSave(async (content) => {
  emit('update', content)
}, 1000)

const editor = useEditor({
  content: getInitialContent(props.block),
  extensions: [
    Document,
    Paragraph,
    Text,
    Bold,
    Italic,
    Underline,
    Strike,
    Code,
    Heading.configure({ levels: [1, 2, 3] }),
    BulletList,
    OrderedList,
    ListItem,
    TaskList,
    TaskItem.configure({ nested: true }),
    Blockquote,
    CodeBlock,
    HorizontalRule,
    HardBreak,
    History,
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === 'heading') return 'Heading'
        return "Type '/' for commands..."
      }
    })
  ],
  onFocus() {
    emit('focus')
  },
  onBlur() {
    emit('blur')
  },
  onUpdate({ editor }) {
    const html = editor.getHTML()
    triggerSave(html)

    // Detect slash command
    const { from } = editor.state.selection
    const textBefore = editor.state.doc.textBetween(
      Math.max(0, from - 100),
      from,
      '\n'
    )
    const slashIndex = textBefore.lastIndexOf('/')
    if (slashIndex !== -1 && slashIndex === textBefore.length - 1 || (slashIndex !== -1 && !textBefore.slice(slashIndex + 1).includes(' '))) {
      const query = textBefore.slice(slashIndex + 1)
      const coords = editor.view.coordsAtPos(from)
      emit('slash-command', {
        block: props.block,
        x: coords.left,
        y: coords.bottom + 8,
        query
      })
    }
  },
  editorProps: {
    handleKeyDown(view, event) {
      if (event.key === 'Backspace') {
        const isEmpty = view.state.doc.textContent === ''
        const { from } = view.state.selection
        if (isEmpty || (from === 1 && view.state.doc.textContent.length === 0)) {
          emit('delete')
          return true
        }
      }
      return false
    }
  }
})

watch(() => props.block.type, () => {
  if (editor.value) {
    const newContent = getInitialContent(props.block)
    editor.value.commands.setContent(newContent, false)
  }
})

watch(() => props.isFocused, (focused) => {
  if (focused && editor.value && !editor.value.isFocused) {
    editor.value.commands.focus('end')
  }
})

function handleMouseUp() {
  if (!editor.value) return
  const { from, to } = editor.value.state.selection
  if (from !== to) {
    const fromCoords = editor.value.view.coordsAtPos(from)
    const toCoords = editor.value.view.coordsAtPos(to)
    const midX = (fromCoords.left + toCoords.right) / 2
    emit('show-toolbar', {
      editor: editor.value,
      x: midX,
      y: fromCoords.top - 52
    })
  }
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>