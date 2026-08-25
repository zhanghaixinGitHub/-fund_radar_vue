import { defineStore } from 'pinia'

import { getCoreHealth } from '@/api/health'
import type { CoreHealth } from '@/types/api'

/**
 * 系统健康状态仓库。
 *
 * 保存跨页面复用的 Java 核心服务健康结果、加载状态和错误信息。
 */
export const useSystemStore = defineStore('system', {
  state: () => ({
    health: null as CoreHealth | null,
    loading: false,
    errorMessage: '',
  }),
  actions: {
    /** 刷新健康状态；失败时清空旧结果，避免界面错误地展示历史正常状态。 */
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
