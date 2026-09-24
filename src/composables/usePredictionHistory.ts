import { computed, onScopeDispose, ref, watch } from 'vue'
import type { Direction1dCursor, Direction1dPage, Direction1dRecord } from '../types/direction1d'
import type { MultiHistoryRow } from '../utils/predictionHistory'

type MultiCursor = { generatedAt: string; predictionId: string }
type Readers = {
  multi: (code: string, cursor?: MultiCursor) => Promise<{ items: MultiHistoryRow[] }>
  daily: (code: string, page: number, cursor?: Direction1dCursor) => Promise<Direction1dPage<Direction1dRecord>>
}
type Source = 'multi' | 'daily'

/**
 * 两类历史仍按各自接口游标增量读取，每次至多各取一页，不全量拉取或按日期逐个请求。
 * 失败的一路独立重试；已成功读取的数据保留，换基金和卸载后拒收旧请求。
 */
export function usePredictionHistory(fundCode: () => string, readers: Readers) {
  const multi = ref<MultiHistoryRow[]>([]), daily = ref<Direction1dRecord[]>([])
  const busy = ref(false)
  const errors = ref({ multi: '', daily: '' })
  const more = ref({ multi: true, daily: true })
  const dailyCursor = ref<Direction1dCursor>()
  let multiCursor: MultiCursor | undefined
  let dailyPage = 0
  let sequence = 0

  async function load(only?: Source) {
    if (busy.value) return
    const run = sequence, code = fundCode()
    const sources = (['multi', 'daily'] as const).filter(source => (!only || source === only) && more.value[source])
    if (!sources.length) return
    if (!/^\d{6}$/.test(code)) {
      errors.value = { multi: '基金代码无效，无法读取预测历史。', daily: '' }
      return
    }
    busy.value = true
    await Promise.all(sources.map(async source => {
      errors.value[source] = ''
      try {
        if (source === 'multi') {
          const result = await readers.multi(code, multiCursor)
          if (run !== sequence) return
          multi.value.push(...result.items)
          // 去重与按天排序发生在展示层；游标必须始终取原始响应的最后一条。
          const last = result.items.at(-1)?.payload
          if (last) multiCursor = { generatedAt: last.generatedAt, predictionId: last.predictionId }
          more.value.multi = result.items.length === 30
        } else {
          const result = await readers.daily(code, dailyPage + 1, dailyCursor.value)
          if (run !== sequence) return
          daily.value.push(...result.items)
          dailyPage++
          dailyCursor.value = result.nextCursor
          more.value.daily = !!result.items.length && !!result.nextCursor && dailyPage * result.pageSize < result.totalCount
        }
      } catch {
        if (run === sequence) errors.value[source] = source === 'daily'
          ? '一日预测历史暂时无法读取。' : '五日、二十日和半年预测历史暂时无法读取。'
      }
    }))
    if (run === sequence) busy.value = false
  }

  /** 一日接口按目标日和编号排序；末尾日期可能跨页，读齐前不把旧版本当作最新结果。 */
  function dailyDateComplete(date: string): boolean {
    return !more.value.daily || (!!dailyCursor.value && date > dailyCursor.value.beforeDate)
  }

  watch(fundCode, () => {
    sequence++
    multi.value = []
    daily.value = []
    multiCursor = undefined
    dailyCursor.value = undefined
    dailyPage = 0
    errors.value = { multi: '', daily: '' }
    more.value = { multi: true, daily: true }
    busy.value = false
    void load()
  }, { immediate: true, flush: 'sync' })
  onScopeDispose(() => { sequence++ })
  return { multi, daily, busy, errors, more, load, dailyDateComplete,
    hasMore: computed(() => more.value.multi || more.value.daily) }
}
