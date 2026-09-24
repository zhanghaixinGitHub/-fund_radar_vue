import type { Direction1dRecord } from '@/types/direction1d'
import type { MultiPrediction } from '@/types/multiPrediction'
import { direction1dConclusion, direction1dSummary } from './direction1d'
import { flatRange, isThreeStateTarget } from './predictionDirection'

/** 每天固定按周期由短到长展示；缺少记录也保留该周期的位置。 */
export const historyPeriods = [
  { id: 'T1_V1', label: '一日', duration: '1 个交易日' },
  { id: 'T5_V1', label: '五日', duration: '5 个交易日' },
  { id: 'T20_V1', label: '二十日', duration: '20 个交易日' },
  { id: 'M6_V1', label: '6 个月', duration: '半年' },
] as const
export type HistoryPeriod = typeof historyPeriods[number]['id']

export interface MultiHistoryRow {
  payload: MultiPrediction
  resolution?: { endDate: string }
  outcomeCheck?: { status?: string }
  /** 升序保存的到期核对结果；修订结果不增加独立预测条数。 */
  outcomes: { correct: boolean; checkedAt: string; totalReturn: string | null; actualDirection: string }[] | null
}
export type HistoryItem = {
  id: string; date: string; period: HistoryPeriod; generatedAt: string
} & ({ kind: 'daily'; record: Direction1dRecord } | { kind: 'multi'; record: MultiHistoryRow })
export interface HistoryDay {
  date: string
  items: Partial<Record<HistoryPeriod, HistoryItem>>
}

/**
 * 以预测起始日分组（一日使用目标净值日），同日同周期只选生成时间最新的原始记录。
 * 不按生成日期分组，不按模型版本或最终对错挑选，不改写历史记录或接口翻页顺序。
 * 生成时间按绝对时刻比较，兼容 UTC 与北京时间；同一时刻用编号稳定排序。
 */
export function groupPredictionHistory(fundCode: string, multi: readonly MultiHistoryRow[], daily: readonly Direction1dRecord[]): HistoryDay[] {
  const days = new Map<string, HistoryDay>()
  const add = (item: HistoryItem) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) return
    const day = days.get(item.date) ?? { date: item.date, items: {} }
    const previous = day.items[item.period]
    const time = Date.parse(item.generatedAt)
    const previousTime = previous ? Date.parse(previous.generatedAt) : Number.NEGATIVE_INFINITY
    if (!previous || (Number.isFinite(time) && (!Number.isFinite(previousTime) || time > previousTime))
      || (time === previousTime && item.id > previous.id)) day.items[item.period] = item
    days.set(item.date, day)
  }
  for (const record of multi) {
    const value = record.payload
    if (value.fundCode !== fundCode || !historyPeriods.some(period => period.id !== 'T1_V1' && period.id === value.horizonId)) continue
    add({ kind: 'multi', id: value.predictionId, date: value.startDate, period: value.horizonId as HistoryPeriod,
      generatedAt: value.generatedAt, record })
  }
  for (const record of daily) {
    // 已失效的一日原文可能根本不带 forecast，不能再从其中猜测日期和方向。
    if (record.status || record.forecast.fundCode !== fundCode) continue
    add({ kind: 'daily', id: record.forecastId, date: record.forecast.targetNavDate, period: 'T1_V1',
      generatedAt: record.forecast.generatedAt, record })
  }
  return [...days.values()].sort((a, b) => b.date.localeCompare(a.date))
}

const directions: Record<string, string> = { UP: '上涨', FLAT: '持平', DOWN: '下跌', NON_UP: '下跌或持平' }

/** 回报是小数比例；缺失、非法值与零收益分别处理，微小非零变化也不冒充持平。 */
export function historyReturnText(value: string | null | undefined): string {
  if (value == null || value.trim() === '' || !Number.isFinite(Number(value))) return '暂缺'
  const number = Number(value)
  if (number !== 0 && Math.abs(number) < .0001) return number > 0 ? '上涨不足 0.01%' : '下跌不足 0.01%'
  return `${number > 0 ? '+' : ''}${(number * 100).toFixed(2)}%`
}

/**
 * 统一的是页面表达，不合并收益口径。一日沿用原有首次公布净值的核对结果与提前保存约束；
 * 较长周期沿用总回报及最新修订。一天判断存在分歧时保留“方向不明确”，不能任选一路算对错。
 */
export function historyItemView(item: HistoryItem) {
  if (item.kind === 'daily') {
    const record = item.record, forecast = record.forecast
    const summary = direction1dSummary(forecast)
    const available = forecast.branches.filter(branch => branch.status === 'AVAILABLE' && branch.predictedDirection)
    const outcome = record.outcomes[0]
    const conclusions = new Set(available.map(branch => direction1dConclusion(record, branch.branchId)))
    const result = !available.length ? '暂无有效预测' : summary.direction === '方向不明确' ? '暂不计对错'
      : record.receiptStatus !== 'VERIFIED' ? '暂不计对错' : !outcome ? '等待结果'
        : conclusions.size === 1 && conclusions.has('正确') ? '方向相符'
          : conclusions.size === 1 && conclusions.has('错误') ? '方向不符' : '结果待确认'
    return {
      direction: summary.direction, tone: summary.tone, endDate: forecast.targetNavDate, estimated: false,
      actual: outcome ? historyReturnText(outcome.navReturn) : '待公布',
      actualDirection: outcome ? directions[outcome.actualDirection] ?? '方向暂缺' : '',
      result, resultTone: result === '方向相符' ? 'correct' : result === '方向不符' ? 'incorrect' : 'pending',
      dataDate: forecast.baseNavDate, updatedAt: outcome?.labelObservedAt,
      rule: forecast.schemaVersion === 'DIRECTION_1D_EXPERIMENT_V2'
        ? '目标日单位净值高于基准日算上涨，相等算持平，低于基准日算下跌。'
        : '本条记录当时只区分“上涨”和“下跌或持平”，后者不能再拆分成单独方向。',
      caution: record.receiptStatus !== 'VERIFIED' ? '本条记录尚未确认在预测截止前保存，暂不计对错。'
        : available.length === 1 ? '本次只有部分判断可用。' : '',
    }
  }
  const row = item.record, prediction = row.payload, outcome = row.outcomes?.at(-1)
  const endDate = row.resolution?.endDate || prediction.endDate
  const result = outcome ? (outcome.correct ? '方向相符' : '方向不符')
    : !endDate ? '日期待确认' : row.outcomeCheck?.status === 'PENDING_DATA' ? '等待数据' : '等待结果'
  return {
    direction: directions[prediction.direction] ?? '暂无法判断', tone: prediction.direction.toLowerCase(),
    endDate: endDate || prediction.nominalEndDate || '待确认', estimated: !endDate,
    actual: outcome ? historyReturnText(outcome.totalReturn) : '待公布',
    actualDirection: outcome ? directions[outcome.actualDirection] ?? '方向暂缺' : '',
    result, resultTone: outcome ? (outcome.correct ? 'correct' : 'incorrect') : 'pending',
    dataDate: prediction.baseNavDate || prediction.dataAsOf, updatedAt: outcome?.checkedAt,
    rule: isThreeStateTarget(prediction.targetDefinitionId)
      ? `${flatRange(prediction.flatThreshold) || '本条记录的持平范围暂缺。'}实际涨跌按总回报计算，包含分红再投资。`
      : prediction.targetDefinitionId === 'NEXT_EXECUTABLE_CASH_REINVESTED_DIRECTION_V1' || prediction.direction === 'NON_UP'
        ? '本条记录当时只区分“上涨”和“下跌或持平”，实际涨跌按包含分红再投资的总回报计算。'
        : '本条记录的涨跌判断口径暂无法确认。',
    caution: '',
  }
}
