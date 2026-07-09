import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export interface UserCurrency {
  id: number
  currency_code: string
  official_rate: number
  current_rate: number
  currency?: {
    code: string
    name: string
    symbol: string
  }
}

export const useUserCurrenciesStore = defineStore('userCurrencies', {
  state: () => ({
    rates: {} as Record<string, UserCurrency>,
    loading: false,
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const res = await api.get<{ data: UserCurrency[] } | UserCurrency[]>(
          '/api/v1/user-currencies'
        )
        const raw = res.data
        const list: UserCurrency[] = Array.isArray(raw)
          ? raw
          : ((raw as { data: UserCurrency[] }).data ?? [])
        this.rates = Object.fromEntries(list.map((r) => [r.currency_code, r]))
      } catch (e) {
        console.error('Error fetching user currencies', e)
      } finally {
        this.loading = false
      }
    },

    async updateRate(id: number, type: 'official' | 'current', value: number) {
      const field = type === 'official' ? 'official_rate' : 'current_rate'
      const res = await api.put<{ data: UserCurrency } | UserCurrency>(
        `/api/v1/user-currencies/${id}`,
        { [field]: value }
      )
      const raw = res.data
      const updated: UserCurrency = (raw as { data: UserCurrency }).data ?? (raw as UserCurrency)
      const code = updated.currency_code
      if (this.rates[code]) {
        this.rates[code] = { ...this.rates[code], ...updated }
      }
      return updated
    },

    async onEdit(code: string, type: 'official' | 'current', value: number) {
      const rate = this.rates[code]
      if (!rate) {
        console.warn(`useUserCurrencies: no rate found for code "${code}"`)
        return
      }
      await this.updateRate(rate.id, type, value)
    },
  },
})
