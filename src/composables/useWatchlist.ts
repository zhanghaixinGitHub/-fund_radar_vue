import { computed, ref } from 'vue'

import { getWatchlist } from '@/api/watchlist'
import type { FundType } from '@/types/fund'
import type { WatchlistItem, WatchlistQuota } from '@/types/watchlist'

/** 当前登录用户关注列表的筛选、分页和降级状态。 */
export function useWatchlist() {
  const watchlist = ref<WatchlistItem[]>([])
  const selectedFundType = ref<FundType | ''>('')
  const loading = ref(false)
  const errorMessage = ref('')
  const marketDataUnavailable = ref(false)
  const quota = ref<WatchlistQuota | null>(null)
  const pageSizeOptions = [10, 20, 50] as const
  const pageSize = ref<number>(10)
  const currentPage = ref(1)
  const pageInput = ref('1')
  const totalCount = ref(0)
  const totalPages = ref(0)
  const hasPreviousPage = computed(() => currentPage.value > 1)
  const hasNextPage = computed(() => currentPage.value < totalPages.value)

  /** 按目标页加载当前用户的数据范围，服务端负责用户隔离与类型排序。 */
  async function loadPage(targetPage: number): Promise<void> {
    loading.value = true
    errorMessage.value = ''
    try {
      const response = await getWatchlist({
        fundType: selectedFundType.value || undefined,
        page: targetPage,
        pageSize: pageSize.value,
      })
      watchlist.value = response.items
      marketDataUnavailable.value = response.marketDataUnavailable
      quota.value = response.quota
      currentPage.value = response.page
      pageSize.value = response.pageSize
      totalCount.value = response.totalCount
      totalPages.value = response.totalPages
      pageInput.value = String(currentPage.value)
    } catch (error) {
      watchlist.value = []
      marketDataUnavailable.value = false
      quota.value = null
      totalCount.value = 0
      totalPages.value = 0
      errorMessage.value = error instanceof Error ? error.message : '关注列表暂时不可用。'
    } finally {
      loading.value = false
    }
  }

  /** 切换类型筛选或重新加载时回到第一页。 */
  async function search(): Promise<void> {
    currentPage.value = 1
    pageInput.value = '1'
    await loadPage(1)
  }

  /** 调整页大小后回到第一页，避免跳过有效数据。 */
  async function changePageSize(): Promise<void> {
    if (loading.value) {
      return
    }
    currentPage.value = 1
    pageInput.value = '1'
    await loadPage(1)
  }

  /** 将用户输入的页码限制到当前有效区间。 */
  async function goToPage(): Promise<void> {
    if (loading.value || totalPages.value === 0) {
      return
    }
    const requestedPage = Number(pageInput.value)
    const normalizedPage = Number.isInteger(requestedPage)
      ? Math.min(Math.max(requestedPage, 1), totalPages.value)
      : currentPage.value
    await loadPage(normalizedPage)
  }

  async function nextPage(): Promise<void> {
    if (!loading.value && hasNextPage.value) {
      await loadPage(currentPage.value + 1)
    }
  }

  async function previousPage(): Promise<void> {
    if (!loading.value && hasPreviousPage.value) {
      await loadPage(currentPage.value - 1)
    }
  }

  return {
    changePageSize,
    currentPage,
    errorMessage,
    goToPage,
    hasNextPage,
    hasPreviousPage,
    loadPage,
    loading,
    marketDataUnavailable,
    nextPage,
    pageInput,
    pageSize,
    pageSizeOptions,
    previousPage,
    quota,
    search,
    selectedFundType,
    totalCount,
    totalPages,
    watchlist,
  }
}
