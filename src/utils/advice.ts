import type { AdviceDecision, AdviceSummary } from '@/types/advice'

export const adviceLabel = (decision?: AdviceDecision) => decision === 'HOLD' ? '建议继续持有'
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
