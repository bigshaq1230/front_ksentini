import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  let nextId = 1

  function show(message, type = 'success') {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => (toasts.value = toasts.value.filter((t) => t.id !== id)), 2500)
  }

  return { toasts, show }
})

/** Shortcut usable outside components' setup (after Pinia is installed). */
export const toast = (message, type) => useToastStore().show(message, type)
