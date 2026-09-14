import { computed, onScopeDispose, ref, watch } from 'vue'
import type { Direction1dCursor, Direction1dPage, Direction1dRecord } from '../types/direction1d'

type ReadHistory = (fundCode: string, page: number, cursor?: Direction1dCursor) => Promise<Direction1dPage<Direction1dRecord>>

/** 当前基金的只读历史状态；翻页沿用服务端游标，切换基金立即清空旧记录和游标。 */
export function useDirection1dFundHistory(fundCode: () => string, readHistory: ReadHistory) {
  const history = ref<Direction1dPage<Direction1dRecord> | null>(null)
  const page = ref(1)
  const loading = ref(false)
  const error = ref('')
  let cursors: (Direction1dCursor | undefined)[] = [undefined]
  let sequence = 0
  let disposed = false
  const canPrevious = computed(() => !loading.value && page.value > 1)
  const canNext = computed(() => !loading.value && !!history.value?.nextCursor
    && page.value * history.value.pageSize < history.value.totalCount)

  async function load() {
    const request = ++sequence
    const code = fundCode()
    history.value = null
    error.value = ''
    loading.value = true
    try {
      if (!/^\d{6}$/.test(code)) throw new Error('基金代码无效，无法读取本基金预测历史。')
      const result = await readHistory(code, page.value, cursors[page.value - 1])
      // 离开页面或快速切换基金时，晚返回的请求不能覆盖新的基金记录。
      if (!disposed && request === sequence && code === fundCode()) history.value = result
    } catch (cause) {
      if (!disposed && request === sequence) error.value = cause instanceof Error ? cause.message : '本基金预测历史暂时无法读取。'
    } finally {
      if (!disposed && request === sequence) loading.value = false
    }
  }

  function refresh() {
    page.value = 1
    cursors = [undefined]
    return load()
  }
  function next() {
    if (!canNext.value) return
    cursors[page.value] = history.value?.nextCursor
    page.value++
    return load()
  }
  function previous() {
    if (!canPrevious.value) return
    page.value--
    return load()
  }
  watch(fundCode, refresh, { immediate: true, flush: 'sync' })
  onScopeDispose(() => { disposed = true; sequence++ })
  return { history, page, loading, error, canPrevious, canNext, refresh, retry: load, next, previous }
}
