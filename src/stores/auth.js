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
    } catch {
      authenticated.value = false
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
  }

  return { authenticated, check, login, logout }
})
