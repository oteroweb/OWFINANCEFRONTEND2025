import { defineStore } from 'pinia'
import { api } from 'boot/axios'

interface Currency {
  id: number
  name: string
  symbol: string
  align: string // API devuelve 'left' | 'right', se permite string para flexibilidad
  code: string // ISO code e.g. USD, EUR
  active: number | boolean
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

interface UserCurrencyRate {
  id?: number
  user_id?: number
  currency_id?: number
  current_rate?: number
  is_current?: boolean
  is_official?: boolean
  created_at?: string
  updated_at?: string
  currency?: Currency
}

interface UserRateEntry { // simplified view used in `rates` array of login response
  id?: number
  currency?: Currency
  current_rate?: number
  is_official?: boolean
  is_current?: boolean
  updated_at?: string
}

interface User {
  id: number
  name: string
  email: string
  phone?: string | null
  email_verified_at?: string | null
  balance?: number
  currency_id?: number
  client_id?: number | null
  active?: number | boolean
  deleted_at?: string | null
  created_at?: string
  updated_at?: string
  role_id: number
  role: {
    id: number
    name: string
    slug: string
    created_at?: string
    updated_at?: string
  }
  currency?: Currency | null
  // Extra collections added by login payload
  accounts?: Array<Record<string, unknown>>
  currency_rates?: UserCurrencyRate[]
  current_currency_rates?: UserCurrencyRate[]
  rates?: UserRateEntry[]
  role_slug?: string
  role_name?: string
}


export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as User | null
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    role: (state) => state.user?.role.slug || null,
    // ISO code of the user's default currency (fallback to 'USD')
    defaultCurrencyCode: (state) => state.user?.currency?.code || 'USD',
    defaultCurrency: (state): Currency | null => state.user?.currency || null,
  },
  actions: {
    async login(email: string, password: string) {
      try {
        const response = await api.post('/login', {
          email,
          password,
          device_name: 'quasar-spa'
        })
        // Nueva estructura de respuesta (según ejemplo): token + data (user info & related arrays)
        const body = response.data as Record<string, unknown>
        this.token = (body['token'] as string) || null
        const userRaw = body['data'] as Record<string, unknown> | undefined
        // Map direct to User (mantener shape original del backend sin transformar demasiado)
        if (userRaw) {
          this.user = userRaw as unknown as User
        } else {
          // fallback (legacy) to response.data.user
          const legacy = body['user'] as Record<string, unknown> | undefined
          this.user = legacy as unknown as User || null
        }

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
    /** Refresca el perfil del usuario (incluye tasas actuales) y persiste en localStorage */
    async refreshProfile() {
      if (!this.token) return
      try {
        const res = await api.get('/users/profile')
        const data = (res.data?.data || res.data) as User
        if (data) {
          this.user = data
          localStorage.setItem('user', JSON.stringify(this.user))
        }
      } catch {
        // Silencioso: si falla, mantenemos el user actual
      }
    },
    /** Refresca únicamente las tasas de moneda del usuario desde /user_currencies */
    async refreshUserCurrencies() {
      if (!this.token || !this.user?.id) return
      try {
        const res = await api.get('/user_currencies', { params: { user_id: this.user.id } })
        const list = (res.data?.data || res.data || []) as UserCurrencyRate[]
        // Asignar al arreglo general y a current_currency_rates filtrando is_current
        const all = Array.isArray(list) ? list : []
        const current = all.filter(r => r && r.is_current)
        // Mantener el resto de campos del usuario
        const next = { ...(this.user || {}), currency_rates: all, current_currency_rates: current } as User
        this.user = next
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch {
        // Silencioso
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
        try {
          this.user = JSON.parse(user) as User
        } catch {
          this.user = null
        }
        api.defaults.headers.common.Authorization = `Bearer ${this.token}`
      }
    },
    /** Obtener la tasa actual para un código de moneda (ISO) usando arrays en el usuario */
    getCurrentRateForCurrency(code: string): number | null {
      const cc = code?.toLowerCase()
      if (!cc || !this.user) return null
      // Prioridad: 'rates' actuales marcadas is_current, luego current_currency_rates, luego currency_rates
      const inRates = (this.user.rates || []).find(r => r.currency?.code?.toLowerCase() === cc && r.is_current)
      if (inRates && typeof inRates.current_rate === 'number' && inRates.current_rate > 0) return inRates.current_rate
      const inCurrent = (this.user.current_currency_rates || []).find(r => r.currency?.code?.toLowerCase() === cc && r.is_current)
      if (inCurrent && typeof inCurrent.current_rate === 'number' && inCurrent.current_rate > 0) return inCurrent.current_rate
      const inAll = (this.user.currency_rates || []).find(r => r.currency?.code?.toLowerCase() === cc && r.is_current)
      if (inAll && typeof inAll.current_rate === 'number' && inAll.current_rate > 0) return inAll.current_rate
      return null
    }
  }
})
