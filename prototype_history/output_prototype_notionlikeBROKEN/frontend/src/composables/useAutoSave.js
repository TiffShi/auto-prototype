import { ref } from 'vue'

export function useAutoSave(saveFn, delay = 1000) {
  const isSaving = ref(false)
  const lastSaved = ref(null)
  let timeoutId = null

  function triggerSave(...args) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(async () => {
      isSaving.value = true
      try {
        await saveFn(...args)
        lastSaved.value = new Date()
      } catch (err) {
        console.error('Auto-save failed:', err)
      } finally {
        isSaving.value = false
      }
    }, delay)
  }

  function cancelSave() {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  async function forceSave(...args) {
    cancelSave()
    isSaving.value = true
    try {
      await saveFn(...args)
      lastSaved.value = new Date()
    } catch (err) {
      console.error('Force save failed:', err)
    } finally {
      isSaving.value = false
    }
  }

  return {
    isSaving,
    lastSaved,
    triggerSave,
    cancelSave,
    forceSave
  }
}