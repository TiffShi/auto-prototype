import apiClient from './axios.js'

export const pagesApi = {
  getRootPages() {
    return apiClient.get('/api/pages')
  },

  getPage(id) {
    return apiClient.get(`/api/pages/${id}`)
  },

  createPage(data) {
    return apiClient.post('/api/pages', data)
  },

  updatePage(id, data) {
    return apiClient.put(`/api/pages/${id}`, data)
  },

  deletePage(id) {
    return apiClient.delete(`/api/pages/${id}`)
  },

  getChildPages(id) {
    return apiClient.get(`/api/pages/${id}/children`)
  },

  movePage(id, data) {
    return apiClient.put(`/api/pages/${id}/move`, data)
  },

  getTrashedPages() {
    return apiClient.get('/api/pages/trash')
  },

  restorePage(id) {
    return apiClient.put(`/api/pages/${id}/restore`)
  },

  searchPages(query) {
    return apiClient.get('/api/pages/search', { params: { q: query } })
  }
}