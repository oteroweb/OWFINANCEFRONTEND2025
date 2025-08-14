import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export interface TransactionType {
  id: string
  name: string
}

export const useTransactionTypesStore = defineStore('transactionTypes', {
  state: () => ({
    types: [] as TransactionType[],
    loading: false as boolean
  }),
  actions: {
    async fetchTransactionTypes() {
      this.loading = true
      try {
        const res = await api.get('/transaction_types')
        const raw = (res.data.data || res.data) as Array<{ id: number; name: string }>
        this.types = raw.map(t => ({ id: t.id.toString(), name: t.name }))
      }
      catch (error) {
        console.error('Error fetching transaction types', error)
      }
      finally {
        this.loading = false
      }
    }
  }
})
