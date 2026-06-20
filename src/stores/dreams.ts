import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export interface Dream {
  id: number
  name: string
  emoji: string | null
  description: string | null
  target_amount: number
  saved_amount: number
  color: string | null
  priority: number
  is_completed: boolean
  completed_at: string | null
  progress: number
  created_at: string
  updated_at: string
}

export interface DreamsMeta {
  total_saved: number
  total_target: number
  global_progress: number
  count: number
  completed_count: number
}

export interface DreamPayload {
  name: string
  emoji?: string | null
  description?: string | null
  target_amount: number
  saved_amount?: number
  color?: string | null
  priority?: number
}

export const useDreamsStore = defineStore('dreams', {
  state: () => ({
    dreams: [] as Dream[],
    meta: null as DreamsMeta | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    active: (s) => s.dreams.filter((d) => !d.is_completed),
    completed: (s) => s.dreams.filter((d) => d.is_completed),
  },

  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const res = await api.get('/dreams')
        this.dreams = res.data.data ?? []
        this.meta = res.data.meta ?? null
      } catch (e: unknown) {
        this.error = (e as Error).message
      } finally {
        this.loading = false
      }
    },

    async create(payload: DreamPayload): Promise<Dream> {
      const res = await api.post('/dreams', payload)
      const dream: Dream = res.data.data
      this.dreams.push(dream)
      this._recalcMeta()
      return dream
    },

    async update(id: number, payload: Partial<DreamPayload & { is_completed: boolean }>): Promise<Dream> {
      const res = await api.patch(`/dreams/${id}`, payload)
      const updated: Dream = res.data.data
      const idx = this.dreams.findIndex((d) => d.id === id)
      if (idx !== -1) this.dreams[idx] = updated
      this._recalcMeta()
      return updated
    },

    async deposit(id: number, amount: number): Promise<Dream> {
      const res = await api.post(`/dreams/${id}/deposit`, { amount })
      const updated: Dream = res.data.data
      const idx = this.dreams.findIndex((d) => d.id === id)
      if (idx !== -1) this.dreams[idx] = updated
      this._recalcMeta()
      return updated
    },

    async remove(id: number): Promise<void> {
      await api.delete(`/dreams/${id}`)
      this.dreams = this.dreams.filter((d) => d.id !== id)
      this._recalcMeta()
    },

    _recalcMeta() {
      const totalSaved  = this.dreams.reduce((s, d) => s + d.saved_amount, 0)
      const totalTarget = this.dreams.reduce((s, d) => s + d.target_amount, 0)
      this.meta = {
        total_saved: totalSaved,
        total_target: totalTarget,
        global_progress: totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100 * 10) / 10 : 0,
        count: this.dreams.length,
        completed_count: this.dreams.filter((d) => d.is_completed).length,
      }
    },
  },
})
