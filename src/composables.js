import { ref } from 'vue'

/** Wraps an async action with `busy` and `error` refs, for forms and buttons. */
export function useAction(fn) {
  const busy = ref(false)
  const error = ref('')
  async function run(...args) {
    busy.value = true
    error.value = ''
    try {
      return await fn(...args)
    } catch (e) {
      error.value = e.message
    } finally {
      busy.value = false
    }
  }
  return { run, busy, error }
}

/** Loads data on demand; `data` keeps the last successful result. */
export function useLoader(fn) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref('')
  async function load() {
    loading.value = true
    error.value = ''
    try {
      data.value = await fn()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }
  return { data, loading, error, load }
}
