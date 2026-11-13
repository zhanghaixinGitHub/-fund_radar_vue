import type { PredictionReview, PredictionReviewPeriod, ReviewHorizon } from '../types/predictionReview'

export const reviewHorizons: { id: ReviewHorizon; title: string; duration: string }[] = [
  { id: 'T1', title: '一日预测', duration: '一个估值日' },
  { id: 'T5_V1', title: '五日预测', duration: '约一周' },
  { id: 'T20_V1', title: '二十日预测', duration: '约一个月' },
  { id: 'M6_V1', title: '半年展望', duration: '约六个月' },
]

/** 缺周期保留为空，不使用其他规则的记录补齐。 */
export function assertPredictionReview(value: PredictionReview | null, code: string): void {
  if (value === null) return
  if (!value || value.fundCode !== code || !Array.isArray(value.periods)) throw new Error('预测结果与基金不一致。')
  const seen = new Set<string>()
  for (const period of value.periods) {
    if (!reviewHorizons.some(h => h.id === period.horizonId) || seen.has(period.horizonId)
      || !['UP', 'DOWN', 'ABSTAIN'].includes(period.decision)
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
  const direction = period.decision === 'UP' ? '弱偏上' : '弱偏下'
  if (period.kind === 'RETROSPECTIVE') return `当时${direction}`
  if (period.kind === 'CONDITIONAL_OUTLOOK') return `条件${direction}`
  return direction
}
/** 名义到期日不替代已核实的结束估值日。 */
export function reviewDateRange(period?: PredictionReviewPeriod): string {
  if (!period) return '尚无可用分析'
  const start = period.startDate ?? '开始日期待核'
  if (period.endDate) return `${start} 至 ${period.endDate}`
  return `${start} 至终点待核${period.nominalEndDate ? ` · 名义到期 ${period.nominalEndDate}` : ''}`
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
