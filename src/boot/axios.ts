import { defineBoot } from '#q-app/wrappers'
import axios, { type AxiosInstance } from 'axios'
import { useAuthStore } from 'stores/auth'

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance
    $api: AxiosInstance
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_API_KEY}` 
  }
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()

  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }

  return config
})

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
  // Load stored auth token and user on startup for session persistence
  const auth = useAuthStore()
  auth.loadFromStorage()
})

export { api }
