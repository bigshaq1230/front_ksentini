import { ref } from 'vue'

// Android/desktop Chrome fire `beforeinstallprompt`; iOS never does (install via Share → Add to Home Screen).
const deferred = ref(null)
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferred.value = e
})
window.addEventListener('appinstalled', () => (deferred.value = null))

export const canInstall = deferred
export async function install() {
  if (!deferred.value) return
  deferred.value.prompt()
  await deferred.value.userChoice
  deferred.value = null
}

export const online = ref(navigator.onLine)
window.addEventListener('online', () => (online.value = true))
window.addEventListener('offline', () => (online.value = false))
