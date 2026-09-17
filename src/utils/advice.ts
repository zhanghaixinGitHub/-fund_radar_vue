import type { AdviceDecision, AdviceSummary, DiagnosisItemKey, DiagnosisVerdict, RuleTriggerStats } from '@/types/advice'

export const adviceLabel = (decision?: AdviceDecision) => decision === 'BUY' ? '建议买入' : decision === 'HOLD' ? '建议继续持有'
  : decision === 'SELL' ? '建议卖出' : '暂无操作建议'
export function reviewLabel(report: AdviceSummary): string {
  if (report.reviewStatus === 'NOT_APPLICABLE') return '未形成建议'
  if (report.reviewStatus === 'DATA_INSUFFICIENT') return '等待资料核验'
  if (report.reviewStatus !== 'ASSESSED') return '观察中'
  return report.support === 'SUPPORTED' ? '后续表现支持' : report.support === 'UNSUPPORTED' ? '后续表现不支持' : '区间持平'
}
/** 仅接受本站持仓列表和既有筛选，历史报告来源链接也只允许HTTP(S)。 */
export function portfolioReturnPath(value: unknown): string {
  if (typeof value !== 'string' || value.split('?')[0] !== '/portfolio') return '/portfolio?section=holdings'
  const input = new URLSearchParams(value.split('?')[1] ?? '')
  const output = new URLSearchParams()
  if (['overview', 'holdings', 'plans', 'orders'].includes(input.get('section') ?? '')) output.set('section', input.get('section')!)
  if (/^\d{6}$/.test(input.get('fundCode') ?? '')) output.set('fundCode', input.get('fundCode')!)
  // 返回持仓时恢复已提交的搜索条件；仍只保留允许的字段，并与搜索框使用相同长度上限。
  const keyword = (input.get('keyword') ?? '').slice(0, 50).trim()
  if (keyword) output.set('keyword', keyword)
  // 仅恢复受限的持仓分页字段，与列表页保持相同上限；未知参数仍不进入返回链接。
  const page = Number(input.get('page'))
  if (Number.isInteger(page) && page > 1) output.set('page', String(Math.min(page, 1_000_000)))
  const size = Number(input.get('size'))
  if ([20, 50].includes(size)) output.set('size', String(size))
  if (input.get('showHistory') === '1') output.set('showHistory', '1')
  return `/portfolio${output.size ? `?${output}` : ''}`
}
export function evidenceUrl(value: string | null): string | undefined {
  if (!value) return undefined
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined }
  catch { return undefined }
}
let savedScroll: { path: string; top: number } | null = null
export function rememberPortfolioScroll(path: string, top: number) { savedScroll = { path, top } }
export function takePortfolioScroll(path: string): number | null {
  const result = savedScroll?.path === path ? savedScroll.top : null
  savedScroll = null
  return result
}

/** 服务端之外的值一律不当作已知结论，避免把异常数据展示成「成立」。 */
export function isDiagnosisVerdict(value: unknown): value is DiagnosisVerdict {
  return value === 'VALID' || value === 'CHANGED' || value === 'INSUFFICIENT'
}
/** 诊断结论中文标签；未知结论如实显示待确认，不折叠成「一切正常」。 */
export function diagnosisVerdictLabel(value: unknown): string {
  return value === 'VALID' ? '成立' : value === 'CHANGED' ? '已改变' : value === 'INSUFFICIENT' ? '数据不足' : '结论待确认'
}
/** 结论配色的类名：成立沿用持有绿，已改变用提示红，数据不足用琥珀色，未知保持中性灰。 */
export function diagnosisVerdictTone(value: unknown): string {
  return value === 'VALID' ? 'diagnosis-valid' : value === 'CHANGED' ? 'diagnosis-changed'
    : value === 'INSUFFICIENT' ? 'diagnosis-insufficient' : 'diagnosis-unknown'
}
/** 七个诊断项的固定展示顺序，页面不依赖接口返回顺序。 */
export const diagnosisItemOrder: readonly DiagnosisItemKey[] = ['MANAGER', 'SCALE', 'SAME_TYPE_RANK', 'BENCHMARK', 'DRAWDOWN', 'FEE', 'DIVIDEND']
const diagnosisItemLabels: Record<DiagnosisItemKey, string> = {
  MANAGER: '基金经理', SCALE: '规模变化', SAME_TYPE_RANK: '同类排名', BENCHMARK: '业绩基准',
  DRAWDOWN: '当前回撤', FEE: '费用', DIVIDEND: '分红',
}
export function diagnosisItemLabel(key: unknown): string {
  return typeof key === 'string' && key in diagnosisItemLabels ? diagnosisItemLabels[key as DiagnosisItemKey] : '诊断项目待确认'
}
/** 无数据截至日或截至日早于参考日 7 天以上视为陈旧，页面必须显著标示。 */
export function diagnosisStale(cutoffDate: string | null | undefined, today: string): boolean {
  if (!cutoffDate || !/^\d{4}-\d{2}-\d{2}$/.test(cutoffDate)) return true
  const cutoff = Date.parse(`${cutoffDate}T00:00:00Z`)
  const reference = Date.parse(`${today}T00:00:00Z`)
  if (!Number.isFinite(cutoff) || !Number.isFinite(reference)) return true
  return reference - cutoff > 7 * 86400000
}

/** 阈值以小数字符串传输（如 "-0.0710"）；负值读作「跌」，正值读作「涨」，缺失不补零。 */
export function rulePctText(value: string | number | null | undefined): string {
  const numeric = Number(value)
  if (value === null || value === undefined || value === '' || !Number.isFinite(numeric)) return '—'
  const pct = (Math.abs(numeric) * 100).toFixed(2)
  if (numeric > 0) return `涨 ${pct}%`
  if (numeric < 0) return `跌 ${pct}%`
  return '0.00%'
}
export function ruleTierLabel(value: unknown): string {
  return value === 'CONSERVATIVE' ? '保守' : value === 'BALANCED' ? '适中' : value === 'LOOSE' ? '宽松'
    : value === 'CUSTOM' ? '自定义' : '档位待确认'
}
/** 生效中/已撤销/已被取代三种状态分开表述，取代保留 supersededAt 留痕。 */
export function ruleStatusLabel(rule: { status: string; supersededAt: string | null }): string {
  if (rule.status === 'REVOKED') return '已撤销'
  if (rule.supersededAt) return '已被新规则取代'
  return rule.status === 'ACTIVE' ? '生效中' : '状态待确认'
}
/** 触发统计正文；中位数缺失如实写统计不足，末端未完整观察的触发单独计数说明。 */
export function ruleTriggerText(stats: RuleTriggerStats | null | undefined): string {
  if (!stats) return '暂无历史触发统计。'
  const decline = stats.medianFurtherDecline === null ? '续跌幅度统计不足' : `触发后中位续跌 ${rulePctText(stats.medianFurtherDecline)}`
  const days = stats.medianRecoveryDays === null ? NaN : Number(stats.medianRecoveryDays)
  const recovery = Number.isFinite(days) ? `中位修复 ${Number.isInteger(days) ? days : days.toFixed(1)} 天` : '修复天数统计不足'
  const censored = stats.censoredCount > 0 ? `；其中 ${stats.censoredCount} 次处于历史末端，未完整观察` : ''
  return `历史触发 ${stats.triggerCount} 次 · ${decline} · ${recovery}${censored}。`
}
/** 草案统计更新只提示徽标：已确认规则来源草案与当前草案不是同一份即视为已更新。 */
export function ruleStatsUpdated(
  rule: { sourceDraftId: string | null } | null | undefined,
  draft: { draftId: string | null } | null | undefined,
): boolean {
  return !!(rule?.sourceDraftId && draft?.draftId && rule.sourceDraftId !== draft.draftId)
}

/** 微调步进以万分之一为最小单位做整数运算，避免浮点误差越过 ±20% 边界。 */
const RULE_STEP_SCALE = 10000
function ruleDraftUnits(value: string | null | undefined): number | null {
  if (value === null || value === undefined || !/^-?\d+(\.\d+)?$/.test(value.trim())) return null
  const units = Math.round(Number(value) * RULE_STEP_SCALE)
  return Number.isFinite(units) ? units : null
}
function ruleStepSize(units: number): number {
  return Math.max(1, Math.round(Math.abs(units) * 0.05))
}
function ruleStepDelta(units: number): number {
  return Math.floor(Math.abs(units) * 0.2)
}
/** 单个方向允许的最大步数；草案值为零或非法时不允许微调。 */
export function ruleAdjustMaxSteps(value: string | null | undefined): number {
  const units = ruleDraftUnits(value)
  if (units === null) return 0
  return Math.floor(ruleStepDelta(units) / ruleStepSize(units))
}
/** 按步数计算微调后的阈值（4 位小数字符串）， clamp 在草案值 ±20% 以内且不越过边界。 */
export function ruleAdjustedValue(value: string | null | undefined, steps: number): string | null {
  const units = ruleDraftUnits(value)
  if (units === null) return null
  const max = ruleAdjustMaxSteps(value)
  const clamped = Math.max(-max, Math.min(max, Math.trunc(steps)))
  return ((units + clamped * ruleStepSize(units)) / RULE_STEP_SCALE).toFixed(4)
}
