import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { pagesApi } from '@/api/pages.js'

export const usePagesStore = defineStore('pages', () => {
  const pages = ref([])
  const currentPage = ref(null)
  const trashedPages = ref([])
  const searchResults = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Build a flat map for quick lookup
  const pageMap = computed(() => {
    const map = {}
    const addToMap = (pageList) => {
      pageList.forEach(p => {
        map[p.id] = p
        if (p.children) addToMap(p.children)
      })
    }
    addToMap(pages.value)
    return map
  })

  async function fetchRootPages() {
    loading.value = true
    error.value = null
    try {
      const response = await pagesApi.getRootPages()
      pages.value = response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch pages'
    } finally {
      loading.value = false
    }
  }

  async function fetchPage(id) {
    loading.value = true
    error.value = null
    try {
      const response = await pagesApi.getPage(id)
      currentPage.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch page'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchChildPages(parentId) {
    try {
      const response = await pagesApi.getChildPages(parentId)
      return response.data
    } catch (err) {
      console.error('Failed to fetch children:', err)
      return []
    }
  }

  async function createPage(data = {}) {
    try {
      const response = await pagesApi.createPage({
        title: 'Untitled',
        ...data
      })
      const newPage = response.data
      await fetchRootPages()
      return newPage
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create page'
      throw err
    }
  }

  async function updatePage(id, data) {
    try {
      const response = await pagesApi.updatePage(id, data)
      const updated = response.data

      // Update current page if it matches
      if (currentPage.value?.id === id) {
        currentPage.value = { ...currentPage.value, ...updated }
      }

      // Update in pages list
      await fetchRootPages()
      return updated
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update page'
      throw err
    }
  }

  async function deletePage(id) {
    try {
      await pagesApi.deletePage(id)
      if (currentPage.value?.id === id) {
        currentPage.value = null
      }
      await fetchRootPages()
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete page'
      throw err
    }
  }

  async function movePage(id, parentId) {
    try {
      const response = await pagesApi.movePage(id, { parentId })
      await fetchRootPages()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to move page'
      throw err
    }
  }

  async function fetchTrashedPages() {
    loading.value = true
    try {
      const response = await pagesApi.getTrashedPages()
      trashedPages.value = response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch trash'
    } finally {
      loading.value = false
    }
  }

  async function restorePage(id) {
    try {
      const response = await pagesApi.restorePage(id)
      trashedPages.value = trashedPages.value.filter(p => p.id !== id)
      await fetchRootPages()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to restore page'
      throw err
    }
  }

  async function searchPages(query) {
    if (!query.trim()) {
      searchResults.value = []
      return
    }
    try {
      const response = await pagesApi.searchPages(query)
      searchResults.value = response.data
    } catch (err) {
      console.error('Search failed:', err)
      searchResults.value = []
    }
  }

  function getBreadcrumbs(pageId) {
    const crumbs = []
    let current = pageMap.value[pageId]

    while (current) {
      crumbs.unshift({ id: current.id, title: current.title, icon: current.icon })
      if (current.parentId) {
        current = pageMap.value[current.parentId]
      } else {
        break
      }
    }

    return crumbs
  }

  return {
    pages,
    currentPage,
    trashedPages,
    searchResults,
    loading,
    error,
    pageMap,
    fetchRootPages,
    fetchPage,
    fetchChildPages,
    createPage,
    updatePage,
    deletePage,
    movePage,
    fetchTrashedPages,
    restorePage,
    searchPages,
    getBreadcrumbs
  }
})