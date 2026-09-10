import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { getFunds } from '@/api/funds'
import type { FundSummary, FundType } from '@/types/fund'
import { useListLocation } from '@/composables/useListLocation'

/**
 * 基金市场列表的页面状态与分页逻辑。
 *
 * 对外提供搜索关键字、页大小、页码跳转和翻页操作；请求失败时清空当前列表并保留用户可见的错误信息。
 */
export function useFundMarket() {
  const { location, navigate, isCurrent } = useListLocation()
  let requestSequence = 0
  const funds = ref<FundSummary[]>([])
  const keyword = ref('')
  const selectedFundType = ref<FundType | ''>('')
  const loading = ref(false)
  const errorMessage = ref('')
  const stale = ref(false)
  const cachedAt = ref<string | null>(null)
  const pageSizeOptions = [10, 20, 50] as const
  const pageSize = ref<number>(10)
  const currentPage = ref(1)
  const pageInput = ref('1')
  const totalCount = ref(0)
  const totalPages = ref(0)
  const hasPreviousPage = computed(() => currentPage.value > 1)
  const hasNextPage = computed(() => currentPage.value < totalPages.value)

  /**
   * 按页码加载一页基金数据，并同步总数及缓存降级标识。
   *
   * @param targetPage 以 1 为起点的目标页码。
   */
  async function fetchPage(targetPage: number): Promise<void> {
    const sequence = ++requestSequence
    loading.value = true
    errorMessage.value = ''
    try {
      const response = await getFunds({
        keyword: keyword.value.trim() || undefined,
        fundType: selectedFundType.value || undefined,
        pageSize: pageSize.value,
        page: targetPage,
      })
      if (sequence !== requestSequence) return
      funds.value = response.items
      stale.value = response.stale
      cachedAt.value = response.cachedAt
      currentPage.value = response.page ?? targetPage
      pageSize.value = response.pageSize
      totalCount.value = response.totalCount
      totalPages.value = response.totalPages
      pageInput.value = String(currentPage.value)
    } catch (error) {
      if (sequence !== requestSequence) return
      funds.value = []
      stale.value = false
      cachedAt.value = null
      totalCount.value = 0
      totalPages.value = 0
      errorMessage.value = error instanceof Error ? error.message : '基金列表暂时不可用。'
    } finally {
      if (sequence === requestSequence) loading.value = false
    }
  }

  async function loadPage(targetPage: number): Promise<void> {
    if (!await navigate(selectedFundType.value, keyword.value, targetPage, pageSize.value)) {
      await fetchPage(targetPage)
    }
  }

  watch(location, (value) => {
    if (!isCurrent.value) return
    selectedFundType.value = value.type as FundType | ''
    keyword.value = value.keyword
    pageSize.value = value.size
    currentPage.value = value.page
    pageInput.value = String(value.page)
    void fetchPage(value.page)
  }, { immediate: true })
  onBeforeUnmount(() => { ++requestSequence })

  /** 以当前关键字从第一页重新检索。 */
  async function search(): Promise<void> {
    currentPage.value = 1
    pageInput.value = '1'
    await loadPage(1)
  }

  /** 用户调整每页条数后返回第一页，避免越过新总页数。 */
  async function changePageSize(): Promise<void> {
    if (loading.value) {
      return
    }
    currentPage.value = 1
    pageInput.value = '1'
    await loadPage(1)
  }

  /** 将输入页码限制在有效区间后加载。 */
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

  /** 在未加载且存在下一页时，加载下一页。 */
  async function nextPage(): Promise<void> {
    if (loading.value || !hasNextPage.value) {
      return
    }
    await loadPage(currentPage.value + 1)
  }

  /** 在未加载且不是首页时，加载上一页。 */
  async function previousPage(): Promise<void> {
    if (loading.value || !hasPreviousPage.value) {
      return
    }
    await loadPage(currentPage.value - 1)
  }

  return {
    cachedAt,
    changePageSize,
    currentPage,
    errorMessage,
    funds,
    goToPage,
    hasNextPage,
    hasPreviousPage,
    keyword,
    loading,
    nextPage,
    pageInput,
    pageSize,
    pageSizeOptions,
    previousPage,
    search,
    selectedFundType,
    stale,
    totalCount,
    totalPages,
  }
}
