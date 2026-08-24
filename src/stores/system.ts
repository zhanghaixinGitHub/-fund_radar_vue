import { defineStore } from 'pinia'

import { getCoreHealth } from '@/api/health'
import type { CoreHealth } from '@/types/api'

export const useSystemStore = defineStore('system', {
  state: () => ({
    health: null as CoreHealth | null,
    loading: false,
    errorMessage: '',
  }),
  actions: {
    async refreshHealth(): Promise<void> {
      this.loading = true
      this.errorMessage = ''

      try {
        this.health = await getCoreHealth()
      } catch (error) {
        this.health = null
        this.errorMessage = error instanceof Error ? error.message : '无法连接 Java 核心服务。'
      } finally {
        this.loading = false
      }
    },
  },
})
