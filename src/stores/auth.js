import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  // null = not checked yet
  const authenticated = ref(null)

  async function check() {
    try {
      await api.get('/auth/me')
      authenticated.value = true
    } catch (e) {
      // Only a real 401 means logged out; when offline, keep the app usable (pages show the error).
      authenticated.value = e.status !== 401
    }
    return authenticated.value
  }

  async function login(pin) {
    await api.post('/auth/login', { pin })
    authenticated.value = true
  }

  async function logout() {
    await api.post('/auth/logout')
    authenticated.value = false
    // Photos cached by the service worker shouldn't stay on a shared device.
    await globalThis.caches?.delete('photos')
  }

  return { authenticated, check, login, logout }
})
