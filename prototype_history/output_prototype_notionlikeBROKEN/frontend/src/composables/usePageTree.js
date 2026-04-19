import { computed } from 'vue'
import { usePagesStore } from '@/stores/pages.js'

export function usePageTree() {
  const pagesStore = usePagesStore()

  const rootPages = computed(() => pagesStore.pages)

  function findPage(id, pageList = pagesStore.pages) {
    for (const page of pageList) {
      if (page.id === id) return page
      if (page.children?.length) {
        const found = findPage(id, page.children)
        if (found) return found
      }
    }
    return null
  }

  function getAncestors(pageId) {
    const ancestors = []
    let current = pagesStore.pageMap[pageId]
    while (current?.parentId) {
      const parent = pagesStore.pageMap[current.parentId]
      if (parent) {
        ancestors.unshift(parent)
        current = parent
      } else break
    }
    return ancestors
  }

  function flattenPages(pageList = pagesStore.pages) {
    const result = []
    const flatten = (pages) => {
      pages.forEach(page => {
        result.push(page)
        if (page.children?.length) flatten(page.children)
      })
    }
    flatten(pageList)
    return result
  }

  return {
    rootPages,
    findPage,
    getAncestors,
    flattenPages
  }
}