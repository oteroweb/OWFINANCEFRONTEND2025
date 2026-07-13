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
  monthly_income?: number | null
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
  avatar?: string | null
  layout_mode?: 'lite' | 'pro' | 'legacy' | null
  // Extra collections added by login payload
  accounts?: Array<Record<string, unknown>>
  currency_rates?: UserCurrencyRate[]
  current_currency_rates?: UserCurrencyRate[]
  rates?: UserRateEntry[]
  role_name?: string
}

export interface UserSetting {
  layout_mode: 'lite' | 'pro' | 'legacy' | null;
  has_seen_onboarding: boolean;
  preferences: Record<string, unknown> | null;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as User | null,
    settings: null as UserSetting | null,
    // OWF-147 — Impersonation state
    impersonating: false,
    impersonatedUser: null as User | null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    role: (state) => state.user?.role.slug || null,
    // ISO code of the user's default currency (fallback to 'USD')
    defaultCurrencyCode: (state) => state.user?.currency?.code || 'USD',
    defaultCurrency: (state): Currency | null => state.user?.currency || null,
  },
  actions: {
    async login(email: string, password: string): Promise<{ token: string; user: User; role: string }> {
      try {
        console.log('🔐 Intentando login:', {
          email,
          apiBaseURL: import.meta.env.VITE_API_BASE_URL,
          endpoint: '/auth/login'
        });

        const response = await api.post('/auth/login', {
          email,
          password,
          device_name: 'quasar-spa'
        });

        console.log('✅ Respuesta del servidor:', response.status, response.data);
        let body: Record<string, unknown>
        if (typeof response.data === 'string') {
          const jsonMatch = response.data.match(/\{[\s\S]*\}/)
          if (!jsonMatch) {
            throw new Error('Respuesta del servidor no contiene JSON válido')
          }
          try {
            body = JSON.parse(jsonMatch[0])
          } catch {
            throw new Error('Error parseando JSON de la respuesta del servidor')
          }
        } else {
          body = response.data as Record<string, unknown>
        }
        const token = (body['token'] as string) || ''
        const userRaw = body['data'] as Record<string, unknown> | undefined
        // Map direct to User (mantener shape original del backend sin transformar demasiado)
        let user: User | null = null
        if (userRaw) {
          user = userRaw as unknown as User
        } else {
          // fallback (legacy) to response.data.user
          const legacy = body['user'] as Record<string, unknown> | undefined
          user = legacy as unknown as User || null
        }

        if (!token || !user) {
          throw new Error('Respuesta de login inválida: falta token o user')
        }

        // Extraer role desde múltiples fuentes posibles del backend
        let role = ''
        const topRole = body['role'] as string | undefined
        if (topRole) {
          role = topRole
        } else if (user.role && typeof (user.role as unknown as Record<string, unknown>).slug === 'string') {
          role = (user.role as unknown as Record<string, unknown>).slug as string
        } else if (typeof (user as unknown as Record<string, unknown>).role_slug === 'string') {
          role = (user as unknown as Record<string, unknown>).role_slug as string
        } else if (typeof (user as unknown as Record<string, unknown>).role_name === 'string') {
          role = (user as unknown as Record<string, unknown>).role_name as string
        }

        // Persistir en store
        this.token = token
        this.user = user

        // Guarda en localStorage para recordar sesión
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('role', role)

        // Establece el token en axios para futuras peticiones
        api.defaults.headers.common.Authorization = `Bearer ${token}`

        // Carga configuraciones de usuario
        await this.fetchSettings();

        return { token, user, role }
      } catch (error: unknown) {
        interface AxiosError {
          response?: {
            status?: number;
            data?: {
              message?: string;
            };
          };
          message?: string;
        }
        const err = error as AxiosError;
        console.error('❌ Login error completo:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          apiURL: import.meta.env.VITE_API_BASE_URL
        });
        throw new Error(err.response?.data?.message || err.message || 'Error de inicio de sesión');
      }
    },
    /** Refresca el perfil del usuario (incluye cuentas con balance recalculado y tasas
     *  actuales) y persiste en localStorage. OWF: la URL tenía un typo ('/users/profile',
     *  plural) que nunca coincidió con la ruta real registrada ('/user/profile', singular)
     *  — el método siempre fallaba en silencio (catch vacío) y no tenía ningún llamador
     *  hasta que se conectó desde SmartTransactionModal.vue para refrescar saldos de cuenta
     *  al abrir el formulario (hallazgo Ronda 2 QA_TRANSACTIONS_TEST_MATRIX.md). */
    async refreshProfile() {
      if (!this.token) return
      try {
        const res = await api.get('/user/profile')
        const data = (res.data?.data || res.data) as User
        if (data) {
          this.user = data
          localStorage.setItem('user', JSON.stringify(this.user))
        }
      } catch {
        // Silencioso: si falla, mantenemos el user actual
      }
    },
    /** Carga configuraciones de usuario (layout, onboarding) */
    async fetchSettings() {
      if (!this.token) return
      try {
        const res = await api.get('/user/settings')
        const data = res.data?.data as UserSetting
        if (data) {
          this.settings = data
          localStorage.setItem('settings', JSON.stringify(this.settings))
        }
      } catch {
        // Fallback u oculto
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
      this.settings = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('settings')
      delete api.defaults.headers.common.Authorization
    },

    loadFromStorage() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      const settings = localStorage.getItem('settings')
      if (token && user) {
        this.token = token
        try {
          this.user = JSON.parse(user) as User
          if (settings) {
            this.settings = JSON.parse(settings) as UserSetting
          }
        } catch {
          this.user = null
          this.settings = null
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
    },
    updateLayoutMode(mode: 'lite' | 'pro' | 'legacy') {
      if (this.user) {
        this.user = { ...this.user, layout_mode: mode }
      }
      if (this.settings) {
        this.settings = { ...this.settings, layout_mode: mode }
      }
    },
    setLayoutMode(mode: 'lite' | 'pro' | 'legacy') {
      this.updateLayoutMode(mode)
    },
    // OWF-147 — Start impersonating a user (admin clicks "Iniciar sesión como")
    startImpersonation(token: string, user: User) {
      // Backup admin credentials in sessionStorage
      sessionStorage.setItem('owf_admin_token', this.token ?? '')
      sessionStorage.setItem('owf_admin_user', JSON.stringify(this.user))
      // Switch to impersonated user
      this.token = token
      this.user = user
      this.impersonating = true
      this.impersonatedUser = user
      api.defaults.headers.common.Authorization = `Bearer ${token}`
    },

    // OWF-147 — Stop impersonating and restore admin credentials
    stopImpersonation() {
      const adminToken = sessionStorage.getItem('owf_admin_token')
      const adminUserRaw = sessionStorage.getItem('owf_admin_user')
      sessionStorage.removeItem('owf_admin_token')
      sessionStorage.removeItem('owf_admin_user')
      if (adminToken && adminUserRaw) {
        this.token = adminToken
        try { this.user = JSON.parse(adminUserRaw) as User } catch { /* keep current */ }
        api.defaults.headers.common.Authorization = `Bearer ${adminToken}`
      }
      this.impersonating = false
      this.impersonatedUser = null
    },

    /** Persiste settings parciales al backend y actualiza estado local. */
    async updateSettings(partial: Partial<UserSetting> & { preferences?: Record<string, unknown> }) {
      // Actualización optimista inmediata
      if (this.settings) {
        this.settings = { ...this.settings, ...partial }
        localStorage.setItem('settings', JSON.stringify(this.settings))
      }
      if (partial.layout_mode && this.user) {
        this.user = { ...this.user, layout_mode: partial.layout_mode }
        localStorage.setItem('user', JSON.stringify(this.user))
      }
      try {
        const res = await api.patch('/user/settings', partial)
        const data = res.data?.data as UserSetting
        if (data) {
          this.settings = data
          localStorage.setItem('settings', JSON.stringify(this.settings))
        }
      } catch {
        // Silencioso — el estado local ya refleja el cambio
      }
    }
  }
})
