import { defineBoot } from '#q-app/wrappers'
import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { useAuthStore } from 'stores/auth'

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance
    $api: AxiosInstance
  }
}

const api = axios.create({
  // Ensure a string to satisfy TS when exactOptionalPropertyTypes is enabled
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  // withCredentials: true, // allow sending cookies for Sanctum
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()

  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }

  return config
})

// Centralizar manejo de respuestas: si payload indica FAILED o code>=400, rechazar con un error normalizado
type ApiEnvelope<T = unknown> = {
  status?: string
  code?: number
  message?: string
  data?: T | { [k: string]: unknown }
  errors?: { [k: string]: unknown } | null
}

let isHandling401 = false

api.interceptors.response.use(
  (response: AxiosResponse<ApiEnvelope>) => {
    const payload: ApiEnvelope | undefined = response?.data
    if (payload && typeof payload === 'object') {
      const statusText = typeof payload.status === 'string' ? payload.status.toUpperCase() : null
      const codeNum = typeof payload.code === 'number' ? payload.code : null

      // Handle 401 even if backend wraps it in a 200 envelope
      if (codeNum === 401 && !isHandling401) {
        isHandling401 = true
        const auth = useAuthStore()
        auth.logout()
        // Force navigation to login
        if (typeof window !== 'undefined' && window.location?.pathname !== '/login') {
          window.location.assign('/login')
        }
      }

      if (statusText === 'FAILED' || (codeNum !== null && codeNum >= 400)) {
        const err = new Error(payload.message || 'Request failed') as Error & {
          isApiError?: boolean
          api?: { code?: number; message?: string; errors?: unknown }
        }
        err.isApiError = true
        err.api = {
          code: codeNum ?? response.status,
          message: payload.message ?? 'Request failed',
          errors: payload.data || payload.errors || null
        }
        return Promise.reject(err as Error)
      }
    }
    return response
  },
  (error: unknown) => {
    const anyErr = error as { response?: AxiosResponse<ApiEnvelope>; message?: string }
    const res = anyErr?.response
    const payload = res?.data

    // If HTTP status is 401, clear auth and redirect
    const httpCode = res?.status
    const payloadCode = typeof payload?.code === 'number' ? payload?.code : undefined
    if (!isHandling401 && (httpCode === 401 || payloadCode === 401)) {
      isHandling401 = true
      const auth = useAuthStore()
      auth.logout()
      if (typeof window !== 'undefined' && window.location?.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    if (payload && typeof payload === 'object') {
      const err = new Error(payload.message || anyErr.message || 'Request failed') as Error & {
        isApiError?: boolean
        api?: { code?: number; message?: string; errors?: unknown }
      }
      err.isApiError = true
      err.api = {
        code: typeof payload.code === 'number' ? payload.code : res?.status,
        message: payload.message ?? 'Request failed',
        errors: payload.data || payload.errors || null
      }
      return Promise.reject(err as Error)
    }
    return Promise.reject(anyErr as unknown as Error)
  }
)

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
  // Load stored auth token and user on startup for session persistence
  const auth = useAuthStore()
  auth.loadFromStorage()
})

export { api }
