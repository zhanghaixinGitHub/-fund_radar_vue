import type { ForecastPeriodDates, PredictionReview, PredictionReviewPeriod, ReviewHorizon } from '../types/predictionReview'

export const reviewHorizons: { id: ReviewHorizon; title: string; duration: string }[] = [
  { id: 'T1', title: '一日预测', duration: '一个估值日' },
  { id: 'T5_V1', title: '五日预测', duration: '五个估值日' },
  { id: 'T20_V1', title: '二十日预测', duration: '二十个估值日' },
  { id: 'M6_V1', title: '半年展望', duration: '六个自然月' },
]

/** 缺周期保留为空，不使用其他规则的记录补齐。 */
export function assertPredictionReview(value: PredictionReview | null, code: string): void {
  if (value === null) return
  if (!value || value.fundCode !== code || !Array.isArray(value.periods)) throw new Error('预测结果与基金不一致。')
  const seen = new Set<string>()
  for (const period of value.periods) {
    if (!reviewHorizons.some(h => h.id === period.horizonId) || seen.has(period.horizonId)
      || !['UP', 'DOWN', 'FLAT', 'ABSTAIN'].includes(period.decision)
      || !['DATED_ANALYSIS', 'RETROSPECTIVE', 'CONDITIONAL_OUTLOOK'].includes(period.kind)
      || period.confidence !== 'LOW'
      || !Array.isArray(period.conditions) || !Array.isArray(period.limitations)) {
      throw new Error('预测结果暂时无法核对。')
    }
    seen.add(period.horizonId)
  }
}

export function reviewTitle(id: ReviewHorizon, period?: PredictionReviewPeriod): string {
  if (period?.kind === 'RETROSPECTIVE') return ({ T1: '一日复盘', T5_V1: '五日复盘', T20_V1: '二十日复盘', M6_V1: '半年复盘' })[id]
  return reviewHorizons.find(h => h.id === id)?.title ?? '走势判断'
}
export function reviewDirection(period?: PredictionReviewPeriod): string {
  if (!period) return '分析待更新'
  if (period.decision === 'ABSTAIN') return '暂不判断'
  return { UP: '偏上涨', DOWN: '偏下跌', FLAT: '持平' }[period.decision]
}
export function forecastDateText(id: ReviewHorizon, start: string, dates?: ForecastPeriodDates): string {
  if (id === 'T1') return `目标日 ${start}`
  const prefix = `起始日 ${start}`
  const end = dates?.endDate
  const nominal = dates?.nominalEndDate
  if (end && dates?.endDateBasis !== 'CALENDAR_MONTH') return `${prefix} · 到期日 ${end}`
  return `${prefix} · 到期估值日待确认${nominal ? `（名义到期 ${nominal}）` : ''}`
}
export function reviewDateRange(period?: PredictionReviewPeriod): string {
  if (!period) return '尚无可用分析'
  return period.startDate ? forecastDateText(period.horizonId, period.startDate, period) : '起始估值日待确认'
}
/** 区间开始后补读的分析保留真实时间，不能展示成开始前已作出的预测。 */
export function isSupplementaryReview(period?: PredictionReviewPeriod): boolean {
  if (!period || period.kind !== 'DATED_ANALYSIS' || !period.startDate) return false
  const formed = Date.parse(period.analysisAt)
  const firstClose = Date.parse(`${period.startDate}T15:00:00+08:00`)
  return Number.isFinite(formed) && Number.isFinite(firstClose) && formed >= firstClose
}
/** 切换基金、重复读取和卸载后，只接纳仍有效的最后一次请求。 */
export function createReviewRequestGuard() {
  let sequence = 0
  return {
    begin: (code: string) => ({ code, sequence: ++sequence }),
    current: (token: { code: string; sequence: number }, code: string) => token.code === code && token.sequence === sequence,
    invalidate: () => { ++sequence },
  }
}
