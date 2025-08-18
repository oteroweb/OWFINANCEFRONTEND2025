import { defineStore } from 'pinia'
import type { AxiosResponse } from 'axios'
import { api } from 'boot/axios'

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
    loading: false as boolean
  }),
  actions: {
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
      const response: AxiosResponse = await api.post('/transactions', tx)
      const payload = response.data as unknown as { data?: unknown }
      const newTx = (payload && typeof payload === 'object' && 'data' in payload ? payload.data : response.data) as Transaction
  this.transactions.push(newTx)
      return response
    },
    async updateTransaction(tx: Transaction): Promise<AxiosResponse> {
      try {
        const response: AxiosResponse = await api.put(`/transactions/${tx.id}`, tx)
        const updated = response.data.data || response.data
        const idx = this.transactions.findIndex(t => t.id === updated.id)
        if (idx !== -1) this.transactions.splice(idx, 1, updated)
        return response
      } catch (error) {
        console.error('Error updating transaction', error)
        // Rethrow so calling component can handle validation errors
        throw error
      }
    },
    async deleteTransaction(id: number) {
      try {
        await api.delete(`/transactions/${id}`)
        this.transactions = this.transactions.filter(t => t.id !== id)
      } catch (error) {
        console.error('Error deleting transaction', error)
      }
    }
  }
})
