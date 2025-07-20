type Role = 'admin' | 'user'

interface User {
  name: string
  role: Role
  email: string
}

import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as User | null
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    role: (state) => state.user?.role || null
  },
  actions: {
    login(email: string, password: string) {
      const users: Record<string, { password: string; user: User }> = {
        'admin@example.com': {
          password: 'admin123',
          user: {
            name: 'Admin',
            email: 'admin@example.com',
            role: 'admin'
          }
        },
        'user@example.com': {
          password: 'user123',
          user: {
            name: 'Usuario',
            email: 'user@example.com',
            role: 'user'
          }
        }
      }

      const found = users[email]

      if (!found || found.password !== password) {
        throw new Error('Credenciales inválidas')
      }

      this.token = 'simulated-token'
      this.user = found.user
      localStorage.setItem('token', this.token)
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    loadFromStorage() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')

      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
      }
    }
  }
})
