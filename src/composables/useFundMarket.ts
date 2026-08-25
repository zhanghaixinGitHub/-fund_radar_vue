import { computed, ref } from 'vue'

import { getFunds } from '@/api/funds'
import type { FundSummary } from '@/types/fund'

/**
 * 基金市场列表的页面状态与分页逻辑。
 *
 * 对外提供搜索关键字、列表数据、游标历史和翻页操作；请求失败时清空当前列表并保留用户可见的错误信息。
 */
export function useFundMarket() {
  const funds = ref<FundSummary[]>([])
  const keyword = ref('')
  const loading = ref(false)
  const errorMessage = ref('')
  const stale = ref(false)
  const cachedAt = ref<string | null>(null)
  const cursorHistory = ref<(string | undefined)[]>([undefined])
  const currentPageIndex = ref(0)
  const nextCursor = ref<string | null>(null)
  const hasPreviousPage = computed(() => currentPageIndex.value > 0)
  const hasNextPage = computed(() => nextCursor.value !== null)

  /**
   * 按游标加载一页基金数据，并同步缓存降级标识。
   *
   * @param cursor 当前页请求使用的游标；首屏传入 undefined。
   */
  async function loadPage(cursor: string | undefined): Promise<void> {
    loading.value = true
    errorMessage.value = ''
    try {
      const page = await getFunds({ keyword: keyword.value.trim() || undefined, pageSize: 20, cursor })
      funds.value = page.items
      stale.value = page.stale
      cachedAt.value = page.cachedAt
      nextCursor.value = page.nextCursor
    } catch (error) {
      funds.value = []
      stale.value = false
      cachedAt.value = null
      nextCursor.value = null
      errorMessage.value = error instanceof Error ? error.message : '基金列表暂时不可用。'
    } finally {
      loading.value = false
    }
  }

  /** 重置游标历史后，以当前关键字从第一页重新检索。 */
  async function search(): Promise<void> {
    cursorHistory.value = [undefined]
    currentPageIndex.value = 0
    await loadPage(undefined)
  }

  /** 在未加载且存在下一页游标时，加载下一页。 */
  async function nextPage(): Promise<void> {
    if (loading.value || nextCursor.value === null) {
      return
    }
    const cursor = nextCursor.value
    cursorHistory.value = [...cursorHistory.value.slice(0, currentPageIndex.value + 1), cursor]
    currentPageIndex.value += 1
    await loadPage(cursor)
  }

  /** 在未加载且不是首页时，按已保存的游标返回上一页。 */
  async function previousPage(): Promise<void> {
    if (loading.value || currentPageIndex.value === 0) {
      return
    }
    currentPageIndex.value -= 1
    await loadPage(cursorHistory.value[currentPageIndex.value])
  }

  return {
    cachedAt,
    currentPageIndex,
    errorMessage,
    funds,
    hasNextPage,
    hasPreviousPage,
    keyword,
    loading,
    nextPage,
    previousPage,
    search,
    stale,
  }
}
