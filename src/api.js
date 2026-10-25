import router from './router'

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

async function request(method, path, body) {
  const init = { method, headers: {} }
  if (body instanceof FormData) {
    init.body = body
  } else if (body !== undefined) {
    init.headers['content-type'] = 'application/json'
    init.body = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(`/api${path}`, init)
  } catch {
    throw new ApiError(0, 'Pas de connexion internet')
  }
  const data = res.headers.get('content-type')?.includes('application/json') ? await res.json() : null

  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/auth/')) {
      router.push({ name: 'login', query: { next: router.currentRoute.value.fullPath } })
    }
    throw new ApiError(res.status, data?.error ?? `Erreur ${res.status}`)
  }
  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  del: (path) => request('DELETE', path),
}

export const photoUrl = (id) => `/api/photos/${id}`
