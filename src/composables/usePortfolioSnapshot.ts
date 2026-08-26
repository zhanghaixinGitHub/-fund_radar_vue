import { ref } from 'vue'

import { getCurrentPortfolio } from '@/api/portfolio'
import type { PortfolioSnapshot } from '@/types/portfolio'

/** 协调持仓快照的加载、错误与刷新状态，不在页面中持有接口细节。 */
export function usePortfolioSnapshot() {
  const snapshot = ref<PortfolioSnapshot | null>(null)
  const loading = ref(false)
  const errorMessage = ref('')

  /** 从 Java 核心服务加载当前本机快照；失败时不保留可能过期的旧结果。 */
  async function load(): Promise<void> {
    loading.value = true
    errorMessage.value = ''
    try {
      snapshot.value = await getCurrentPortfolio()
    } catch (error) {
      snapshot.value = null
      errorMessage.value = error instanceof Error ? error.message : '持仓快照暂时不可用。'
    } finally {
      loading.value = false
    }
  }

  return { errorMessage, load, loading, snapshot }
}
