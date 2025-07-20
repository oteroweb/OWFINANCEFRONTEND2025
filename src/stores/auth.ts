import { defineStore } from 'pinia'
import { api } from 'boot/axios'

interface User {
  id: number
  name: string
  email: string
  role_id: number
  role: {
    id: number
    name: string
    slug: string
  }
}


export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as User | null
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    role: (state) => state.user?.role.slug || null
  },
  actions: {
    async login(email: string, password: string) {
      try {
        const response = await api.post('/login', {
          email,
          password,
          device_name: 'quasar-spa'
        })

        this.token = response.data.token
        this.user = response.data.user // depende cómo venga en tu API

        // Guarda en localStorage
        localStorage.setItem('token', this.token || '')
        localStorage.setItem('user', JSON.stringify(this.user))

        // Establece el token en axios para futuras peticiones
        api.defaults.headers.common.Authorization = `Bearer ${this.token}`
      } catch (error: unknown) {
        interface AxiosError {
          response?: {
            data?: {
              message?: string;
            };
          };
        }
        const err = error as AxiosError;
        throw new Error(err.response?.data?.message || 'Error de inicio de sesión');
      }
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete api.defaults.headers.common.Authorization
    },

    loadFromStorage() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
        api.defaults.headers.common.Authorization = `Bearer ${this.token}`
      }
    }
  }
})
