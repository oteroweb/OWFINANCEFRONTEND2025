import { defineStore } from 'pinia'
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
  transaction_type?: string | null
  user_id?: number | null
  account_id?: number | null
  // Relaciones
  user?: { id: number; name: string } | null
  account?: { id: number; name: string } | null
  provider?: { id: number; name: string } | null
  rate?: { id: number; name: string; value: string } | null
  created_at?: string
  updated_at?: string
}

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    transactions: [] as Transaction[],
    loading: false as boolean
  }),
  actions: {
    async fetchTransactions() {
      this.loading = true
      try {
        const response = await api.get('/transactions')
        // Assuming API returns array directly or under data
        this.transactions = response.data.data || response.data
      } catch (error) {
        console.error('Error fetching transactions', error)
      } finally {
        this.loading = false
      }
    },
    async addTransaction(tx: Omit<Transaction, 'id'>) {
      try {
        const response = await api.post('/transactions', tx)
        const newTx = response.data.data || response.data
        this.transactions.push(newTx)
      } catch (error) {
        console.error('Error adding transaction', error)
      }
    },
    async updateTransaction(tx: Transaction) {
      try {
        const response = await api.put(`/transactions/${tx.id}`, tx)
        const updated = response.data.data || response.data
        const idx = this.transactions.findIndex(t => t.id === updated.id)
        if (idx !== -1) this.transactions.splice(idx, 1, updated)
      } catch (error) {
        console.error('Error updating transaction', error)
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
