import { defineStore } from 'pinia'
import type { AxiosResponse } from 'axios'
import { api } from 'boot/axios'

export interface PaymentTransaction {
  id?: number
  account_id: number | null
  amount: number
  rate?: number | null
  rate_is_current?: boolean | null
  rate_is_official?: boolean | null
  tax_id?: number | null
  note?: string | null
  account?: { id: number; name: string; currency_id?: number } | null
}

// Payment payload items we send from UI when creating/updating
export interface IncomingPaymentPayload {
  account_id: number | null
  amount: number
  rate?: number | null
  rate_is_current?: boolean | null
  rate_is_official?: boolean | null
  // Aliases from UI checkboxes
  rateMarkCurrent?: boolean | null
  rateMarkOfficial?: boolean | null
  tax_id?: number | null
  note?: string | null
}

export interface Transaction {
  id: number
  name: string
  amount: number
  amount_tax: number
  description: string
  date: string
  active: boolean
  provider_id: number
  rate_id: number
  url_file?: string | null
  transaction_type_id?: string | null
  user_id?: number | null
  account_id?: number | null
  // Relaciones
  user?: { id: number; name: string } | null
  account?: { id: number; name: string } | null
  provider?: { id: number; name: string } | null
  rate?: { id: number; name: string; value: string } | null
  transaction_type?: { id: number; name: string } | null
  created_at?: string
  updated_at?: string
  payment_transactions?: PaymentTransaction[]
}
// Raw API transaction uses strings for amount fields
interface RawTransaction extends Omit<Transaction, 'amount' | 'amount_tax'> {
  amount: string
  amount_tax: string
}

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    transactions: [] as Transaction[],
    total: 0 as number,
    loading: false as boolean,
    // UI filter: selected accounts in sidebar widget
    selectedAccountIds: [] as Array<string | number>
  }),
  actions: {
    setSelectedAccountIds(ids: Array<string | number>) {
      // Keep as primitive id array for URL-free filtering
      this.selectedAccountIds = Array.isArray(ids) ? ids.slice() : []
    },
    async fetchTransactions(params: Record<string, unknown> = {}) {
      this.loading = true
      try {
        const response = await api.get('/transactions', { params })
        // Laravel paginator returns wrapper with data array and total count
        const payload = response.data
        // Determine where the data array lives: direct array or nested paginator object
        let rawList: RawTransaction[] = []
        let totalCount: number | undefined = undefined
        const dat = payload.data
        if (Array.isArray(dat)) {
          rawList = dat as RawTransaction[]
          totalCount = payload.total
        }
        else if (dat && typeof dat === 'object' && Array.isArray(dat.data)) {
          rawList = dat.data as RawTransaction[]
          totalCount = typeof dat.total === 'number' ? dat.total : payload.total
        }
        else {
          console.error('fetchTransactions could not find array in payload.data', dat)
        }
        // Map RawTransaction to Transaction numbers
        this.transactions = rawList.map((tx): Transaction => ({
          ...tx,
          amount: Number(tx.amount),
          amount_tax: Number(tx.amount_tax)
        }))
        // capture total count from paginator
        this.total = typeof totalCount === 'number' ? totalCount : this.transactions.length
      } catch (error) {
        console.error('Error fetching transactions', error)
      } finally {
        this.loading = false
      }
    },
  async addTransaction(tx: Record<string, unknown>): Promise<AxiosResponse> {
     // Asegurarnos de NO enviar payment_transactions, solo payments
     const cleanTx = { ...tx }
     if ('payment_transactions' in cleanTx) delete (cleanTx as Record<string, unknown>)['payment_transactions']
     const response: AxiosResponse = await api.post('/transactions', cleanTx)
      const payloadUnknown = response.data as unknown
      const newTx: Transaction =
        payloadUnknown && typeof (payloadUnknown as { data?: unknown }).data !== 'undefined'
          ? ((payloadUnknown as { data: Transaction }).data)
          : (response.data as Transaction)
      try {
        // Backend may not echo per-payment rate metadata; enrich from original payload if missing
  const raw = (tx as { [key: string]: unknown })['payments']
        const origPayments: IncomingPaymentPayload[] = Array.isArray(raw)
          ? (raw as IncomingPaymentPayload[])
          : []
        if (origPayments.length) {
          const mapByAccount: Record<string, IncomingPaymentPayload[]> = {}
          origPayments.forEach((p) => {
            if (p && typeof p.account_id !== 'undefined') {
              const key = String(p.account_id)
              if (!mapByAccount[key]) mapByAccount[key] = []
              mapByAccount[key].push(p)
            }
          })
          if (Array.isArray(newTx.payment_transactions)) {
            newTx.payment_transactions = newTx.payment_transactions.map((pt: PaymentTransaction) => {
              const key = String(pt.account_id)
              const candidates = mapByAccount[key] || []
              // match by closest amount (absolute) when multiple
              let chosen: IncomingPaymentPayload | null = null
              if (candidates.length === 1) chosen = candidates[0] || null
              else if (candidates.length > 1) {
                const amt = Number(pt.amount)
                let bestDiff = Infinity
                candidates.forEach((c: IncomingPaymentPayload) => {
                  const diff = Math.abs(Math.abs(Number(c.amount || 0)) - Math.abs(amt))
                  if (diff < bestDiff) {   bestDiff = diff; chosen = c }
                })
              }
              if (chosen) {
                // Prefer 'rate'; fallback to 'current_rate' or 'rate_value'
                const rateAny = (chosen as unknown as { rate?: unknown; current_rate?: unknown; rate_value?: unknown })
                const r1 = rateAny.rate
                const r2 = rateAny.current_rate
                const r3 = rateAny.rate_value
                let setRate: number | null = null
                if (typeof r1 === 'number') setRate = r1
                else if (r1 != null) { const n = Number(r1); if (Number.isFinite(n)) setRate = n }
                else if (typeof r2 === 'number') setRate = r2
                else if (r2 != null) { const n = Number(r2); if (Number.isFinite(n)) setRate = n }
                else if (typeof r3 === 'number') setRate = r3
                else if (r3 != null) { const n = Number(r3); if (Number.isFinite(n)) setRate = n }
                if (setRate != null) pt.rate = setRate
                const ric = (chosen.rate_is_current ?? (chosen as unknown as { is_current?: boolean | null }).is_current ?? chosen.rateMarkCurrent) ?? null
                if (ric != null) pt.rate_is_current = ric
                const rio = (chosen.rate_is_official ?? (chosen as unknown as { is_official?: boolean | null }).is_official ?? chosen.rateMarkOfficial) ?? null
                if (rio != null) pt.rate_is_official = rio
              }
              return pt
            })
          } else if (origPayments.length) {
            newTx.payment_transactions = origPayments.map((op): PaymentTransaction => {
              const pt: PaymentTransaction = {
                account_id: op.account_id ?? null,
                amount: op.amount,
                note: op.note ?? null
              }
              const rateAny = (op as unknown as { rate?: unknown; current_rate?: unknown; rate_value?: unknown })
              const r1 = rateAny.rate
              const r2 = rateAny.current_rate
              const r3 = rateAny.rate_value
              let setRate: number | null = null
              if (typeof r1 === 'number') setRate = r1
              else if (r1 != null) { const n = Number(r1); if (Number.isFinite(n)) setRate = n }
              else if (typeof r2 === 'number') setRate = r2
              else if (r2 != null) { const n = Number(r2); if (Number.isFinite(n)) setRate = n }
              else if (typeof r3 === 'number') setRate = r3
              else if (r3 != null) { const n = Number(r3); if (Number.isFinite(n)) setRate = n }
              if (setRate != null) pt.rate = setRate
              const ric = (op.rate_is_current ?? (op as unknown as { is_current?: boolean | null }).is_current ?? op.rateMarkCurrent) ?? null
              if (ric != null) pt.rate_is_current = ric
              const rio = (op.rate_is_official ?? (op as unknown as { is_official?: boolean | null }).is_official ?? op.rateMarkOfficial) ?? null
              if (rio != null) pt.rate_is_official = rio
              if (typeof op.tax_id === 'number') pt.tax_id = op.tax_id
              return pt
            })
          }
        }
      } catch (e) {
        console.warn('Could not enrich payment_transactions with rate metadata', e)
      }
      this.transactions.push(newTx)
      window.dispatchEvent(new CustomEvent('ow:transactions:changed', { detail: { type: 'add', id: newTx.id } }))
      return response
    },
    async updateTransaction<T extends { id: number }>(tx: T): Promise<AxiosResponse> {
      try {
  // Limpiar payment_transactions en update, usar solo payments
  const cleanTx = { ...tx }
  if ('payment_transactions' in cleanTx) delete (cleanTx as Record<string, unknown>)['payment_transactions']
  const response: AxiosResponse = await api.put(`/transactions/${tx.id}`, cleanTx)
        const updated: Transaction = (response.data && (response.data as { data?: unknown }).data)
          ? ((response.data as { data: Transaction }).data)
          : (response.data as Transaction)
        // Enrich updated payment transactions similarly using request payload
        try {
          const p1 = (tx as unknown as Record<string, unknown>)['payment_transactions']
          const p2 = (tx as unknown as Record<string, unknown>)['payments']
          const origPayments: IncomingPaymentPayload[] = Array.isArray(p1)
            ? (p1 as IncomingPaymentPayload[])
            : (Array.isArray(p2) ? (p2 as IncomingPaymentPayload[]) : [])
          if (origPayments.length) {
            const mapByAccount: Record<string, IncomingPaymentPayload[]> = {}
            origPayments.forEach((p) => {
              if (p && typeof p.account_id !== 'undefined') {
                const key = String(p.account_id)
                if (!mapByAccount[key]) mapByAccount[key] = []
                mapByAccount[key].push(p)
              }
            })
            if (Array.isArray(updated.payment_transactions)) {
              updated.payment_transactions = updated.payment_transactions.map((pt: PaymentTransaction) => {
                const key = String(pt.account_id)
                const candidates = mapByAccount[key] || []
                let chosen: IncomingPaymentPayload | null = null
                if (candidates.length === 1) chosen = candidates[0] || null
                else if (candidates.length > 1) {
                  const amt = Number(pt.amount)
                  let bestDiff = Infinity
                  candidates.forEach((c: IncomingPaymentPayload) => {
                    const diff = Math.abs(Math.abs(Number(c.amount || 0)) - Math.abs(amt))
                    if (diff < bestDiff) { bestDiff = diff; chosen = c }
                  })
                }
                if (chosen) {
                  const rateAny = (chosen as unknown as { rate?: unknown; current_rate?: unknown; rate_value?: unknown })
                  const r1 = rateAny.rate
                  const r2 = rateAny.current_rate
                  const r3 = rateAny.rate_value
                  let setRate: number | null = null
                  if (typeof r1 === 'number') setRate = r1
                  else if (r1 != null) { const n = Number(r1); if (Number.isFinite(n)) setRate = n }
                  else if (typeof r2 === 'number') setRate = r2
                  else if (r2 != null) { const n = Number(r2); if (Number.isFinite(n)) setRate = n }
                  else if (typeof r3 === 'number') setRate = r3
                  else if (r3 != null) { const n = Number(r3); if (Number.isFinite(n)) setRate = n }
                  if (setRate != null) pt.rate = setRate
                  const ric = (chosen.rate_is_current ?? (chosen as unknown as { is_current?: boolean | null }).is_current ?? chosen.rateMarkCurrent) ?? null
                  if (ric != null) pt.rate_is_current = ric
                  const rio = (chosen.rate_is_official ?? (chosen as unknown as { is_official?: boolean | null }).is_official ?? chosen.rateMarkOfficial) ?? null
                  if (rio != null) pt.rate_is_official = rio
                }
                return pt
              })
            }
          }
        } catch (e) {
          console.warn('Could not enrich updated payment_transactions with rate metadata', e)
        }
        const idx = this.transactions.findIndex(t => t.id === updated.id)
        if (idx !== -1) this.transactions.splice(idx, 1, updated)
        window.dispatchEvent(new CustomEvent('ow:transactions:changed', { detail: { type: 'update', id: tx.id } }))
        return response
      } catch (error) {
        console.error('Error updating transaction', error)
        throw error
      }
    },
    async deleteTransaction(id: number) {
      try {
        await api.delete(`/transactions/${id}`)
        this.transactions = this.transactions.filter(t => t.id !== id)
        window.dispatchEvent(new CustomEvent('ow:transactions:changed', { detail: { type: 'delete', id } }))
      } catch (error) {
        console.error('Error deleting transaction', error)
      }
    }
  }
})
