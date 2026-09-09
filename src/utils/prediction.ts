import type { WatchlistPrediction } from '../types/prediction'

const statuses = ['AVAILABLE', 'STALE', 'MODEL_NOT_RELEASED', 'DATA_INSUFFICIENT', 'NOT_APPLICABLE', 'UNAVAILABLE']
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const time = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(time.getTime()) && time.toISOString().slice(0, 10) === value
}

/** 仅辅助防止协议/基金错配；本人关注、正式发布和时效仍由服务端强制校验。 */
export function assertWatchlistPrediction(value: unknown, fundCode: string): asserts value is WatchlistPrediction {
  const fail = (): never => { throw new Error('预测结果未通过校验，暂不展示。') }
  if (!value || typeof value !== 'object') fail()
  const result = value as Record<string, unknown>
  if (result.fundCode !== fundCode || result.horizonTradingDays !== 20
    || typeof result.status !== 'string' || !statuses.includes(result.status)
    || !Array.isArray(result.reasonCodes) || !Array.isArray(result.reasons)
    || result.reasonCodes.length !== result.reasons.length || result.reasonCodes.length > 12
    || !result.reasonCodes.every(item => typeof item === 'string' && item.length <= 150)
    || !result.reasons.every(item => typeof item === 'string' && item.length <= 300)
    || (result.modelVersion != null && !['CASH_FORECAST_STORAGE_V1', 'CASH_RESEARCH_PROTOCOL_V1'].includes(String(result.modelVersion)))
    || typeof result.message !== 'string' || typeof result.disclaimer !== 'string') fail()
  const probability = result.upProbability
  if (result.status !== 'AVAILABLE') {
    if (probability !== null || result.direction !== null || !(result.reasonCodes as unknown[]).length) fail()
    return
  }
  if (result.modelVersion !== 'CASH_FORECAST_STORAGE_V1'
    || typeof result.forecastId !== 'string' || !uuid.test(result.forecastId)
    || typeof result.researchRunId !== 'string' || !uuid.test(result.researchRunId)
    || typeof result.modelHash !== 'string' || !/^[0-9a-f]{64}$/.test(result.modelHash)
    || !validDate(result.cutoffDate) || !validDate(result.targetBaseDate) || !validDate(result.targetEndDate)
    || String(result.targetBaseDate) > String(result.cutoffDate) || String(result.targetEndDate) <= String(result.cutoffDate)
    || typeof result.generatedAt !== 'string' || !Number.isFinite(Date.parse(result.generatedAt))
    || typeof probability !== 'number' || !Number.isFinite(probability) || probability < 0 || probability > 1
    || result.direction !== (Number(probability) > 0.5 ? 'UP' : 'NON_UP')
    || (result.reasonCodes as unknown[]).length !== 0) fail()
}

/** 展示的是约数，不改变服务端概率或方向；不能用空值生成0%/50%。 */
export function displayUpProbability(value: number): string {
  if (!Number.isFinite(value) || value < 0 || value > 1) throw new Error('概率值不合法')
  return new Intl.NumberFormat('zh-CN', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)
}
