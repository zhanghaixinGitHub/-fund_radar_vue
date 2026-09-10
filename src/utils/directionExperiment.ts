import type { DirectionExperiment } from '../types/directionExperiment'

const hashes = [
  'b08efdc7bc8fc04833d0c3d6ed1edcbd7c3caff080e4787db837cef04f17660f',
  '0146d0ff0ac0504d23a428c0f607d16636e457110ac67c6e60d1b7b7dea19789',
]
const branches = ['DROP_60D_GROUP_L2', 'REFERENCE']
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function date(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

/** 防止基金错配、伪发布和坏分数；服务端仍是权限与有效性边界。 */
export function assertDirectionExperiment(value: unknown, fund: string): asserts value is DirectionExperiment {
  const fail = (): never => { throw new Error('实验结果未通过校验，请稍后重试。') }
  if (!value || typeof value !== 'object') fail()
  const result = value as Record<string, unknown>
  if (result.fundCode !== fund || result.version !== 'DIRECTION_PAGE_TRIAL_V1'
    || result.modelReleased !== false || result.horizonTradingDays !== 20
    || result.researchRunId !== '0c0e06a9-725e-4b68-b813-de6ff5124b29'
    || typeof result.status !== 'string'
    || !['EXPERIMENTAL', 'DATA_INSUFFICIENT', 'NOT_APPLICABLE', 'UNAVAILABLE'].includes(result.status)
    || !Array.isArray(result.models) || result.models.length > 2
    || !Array.isArray(result.reasonCodes) || result.reasonCodes.length > 12
    || !result.reasonCodes.every(r => typeof r === 'string' && r.length <= 150)
    || typeof result.message !== 'string' || result.message.length > 300
    || typeof result.readAt !== 'string' || !Number.isFinite(Date.parse(result.readAt))) fail()
  const models = result.models as Record<string, unknown>[]
  const reasons = result.reasonCodes as string[]
  if (result.status !== 'EXPERIMENTAL') {
    if (models.length || !reasons.length) fail()
    return
  }
  if (!['001632', '006730', '008888'].includes(fund) || models.length !== 2 || reasons.length
    || !date(result.cutoffDate) || !date(result.latestNavDate) || !date(result.targetEndDate)
    || result.targetBaseDate !== result.cutoffDate
    || String(result.latestNavDate) >= String(result.cutoffDate) || String(result.cutoffDate) >= String(result.targetEndDate)
    || typeof result.inputHash !== 'string' || !/^[0-9a-f]{64}$/.test(result.inputHash)
    || typeof result.sourceRevisionId !== 'string' || !uuid.test(result.sourceRevisionId)) fail()
  models.forEach((model, i) => {
    if (!model || model.branch !== branches[i] || model.modelHash !== hashes[i]
      || model.fitEnd !== '2024-03-31' || String(model.fitEnd) >= String(result.latestNavDate)
      || typeof model.score !== 'number' || !Number.isFinite(model.score) || model.score < 0 || model.score > 1
      || model.direction !== (Number(model.score) > 0.5 ? 'UP' : 'NON_UP')) fail()
  })
}
