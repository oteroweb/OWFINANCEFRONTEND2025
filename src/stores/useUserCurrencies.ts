import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export interface UserCurrency {
  id: number
  currency_code: string
  official_rate: number | null
  current_rate: number | null
}

// Shape of each row inside the backend's compact `rates` array
// (GET /user-currencies -> { data: <paginator>, rates: RateRow[] }) — one row
// per currency, already deduplicated/prioritized server-side (is_current=true,
// preferring is_official). See UserCurrencyController::index().
interface RateRow {
  id: number
  currency: { id: number; code: string; name?: string; symbol?: string } | null
  current_rate: number
  is_official: boolean
  is_current: boolean
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
        const res = await api.get<{ rates?: RateRow[] }>('/user-currencies')
        const rows = Array.isArray(res.data?.rates) ? res.data.rates : []
        this.rates = Object.fromEntries(
          rows
            .filter((r): r is RateRow & { currency: NonNullable<RateRow['currency']> } => !!r.currency?.code)
            .map((r) => [
              r.currency.code,
              {
                id: r.id,
                currency_code: r.currency.code,
                // `rates` only exposes the current-flagged row per currency; it also
                // carries the official value when that same row is both current and
                // official (true after OWF-321's is_current:true fix on save).
                official_rate: r.is_official ? r.current_rate : null,
                current_rate: r.current_rate,
              } satisfies UserCurrency,
            ])
        )
      } catch (e) {
        console.error('Error fetching user currencies', e)
      } finally {
        this.loading = false
      }
    },

    async updateRate(id: number, type: 'official' | 'current', value: number) {
      // The backend only stores a single `current_rate` per row, distinguished by the
      // is_official/is_current flags — there's no separate `official_rate` column.
      await api.put(`/user-currencies/${id}`, {
        current_rate: value,
        ...(type === 'official' ? { is_official: true } : { is_current: true }),
      })
      await this.fetchAll()
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
