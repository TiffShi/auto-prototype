import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const username = ref(localStorage.getItem('vr_username') || '')

  const hasUsername = computed(() => username.value.trim().length > 0)

  function setUsername(name) {
    username.value = name.trim()
    localStorage.setItem('vr_username', username.value)
  }

  function clearUsername() {
    username.value = ''
    localStorage.removeItem('vr_username')
  }

  return { username, hasUsername, setUsername, clearUsername }
})