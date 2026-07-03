import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export interface Tag {
  id: number
  slug: string
  name: string
  description?: string
  color: string
  icon: string
  type: 'system' | 'user'
}

export const useTagsStore = defineStore('tags', {
  state: () => ({
    tags: [] as Tag[],
    loading: false as boolean,
  }),
  actions: {
    async fetchTags() {
      if (this.tags.length) return
      this.loading = true
      try {
        const res = await api.get<{ data: Tag[] } | Tag[]>('/tags')
        const raw = res.data
        this.tags = Array.isArray(raw) ? raw : ((raw as { data: Tag[] }).data ?? [])
      } catch (e) {
        console.error('Error fetching tags', e)
      } finally {
        this.loading = false
      }
    },
    async createTag(name: string, color?: string, description?: string): Promise<Tag | null> {
      try {
        const res = await api.post<{ data: Tag } | Tag>('/tags', { name, color, description })
        const raw = res.data
        const tag: Tag = (raw as { data: Tag }).data ?? (raw as Tag)
        this.tags.push(tag)
        return tag
      } catch (e) {
        console.error('Error creating tag', e)
        return null
      }
    },
  },
})
