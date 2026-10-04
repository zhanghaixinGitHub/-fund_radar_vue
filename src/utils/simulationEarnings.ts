import type { DecimalValue, SimEarningsStatus } from '@/types/simulation'

/** 收益金额显示正负号；未知与非有限值不能转换为零。 */
export function earningsMoney(value: DecimalValue | null | undefined): string {
  if (value == null || value === '' || !Number.isFinite(Number(value))) return '—'
  const amount = Number(value)
  return `${amount > 0 ? '+' : ''}${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
/** 图表提示也必须区分缺失和真实零值；ECharts 的空点可能传入 null 或 undefined。 */
export function earningsTooltipValue(value: unknown): string {
  return value == null || value === '' || !Number.isFinite(Number(value)) ? '数据未完整' : `${Number(value).toFixed(2)} 元`
}
/** 只按稳定状态/业务码生成用户提示，不展示后台异常；服务不可用不能误导用户反复修改基金或日期。 */
export function earningsFailureMessage(status: number | null, code: string | null, scope: 'earnings' | 'fund-search' | 'day-details'): string {
  if (status === 401) return '登录状态已失效，请重新登录后重试。'
  if (status === 403) return '当前账号没有查看这项收益记录的权限。'
  if (code === 'SIM_HISTORY_LIMIT') return scope === 'fund-search'
    ? '历史基金较多，请输入完整的 6 位基金代码查询。'
    : '账户历史基金超过 2000 只，暂不能完整汇总。请输入完整基金代码单独查看，历史未被截断。'
  if (code === 'SIM_NOT_FOUND') return '没有这只基金的本人收益记录，请选择其他基金。'
  if (status === 400) return scope === 'fund-search' ? '查询条件无效，请检查基金名称或代码后重试。'
    : '查询条件无效，请检查基金代码、起止日期和页码；单次日期范围不超过十年。'
  if (status === 404) return '收益明细暂时不可用，请稍后刷新重试。'
  return scope === 'fund-search' ? '暂时无法搜索本人基金，请稍后重试。'
    : scope === 'day-details' ? '当天基金构成暂时无法获取，请稍后重试。' : '收益明细暂时无法获取，请稍后重试。'
}
export function earningsStatus(status: SimEarningsStatus): string {
  return ({ COMPLETE: '已更新', PARTIAL: '部分数据未完整', PENDING: '净值待更新', MISSING: '历史数据缺失',
    NON_TRADING: '非交易日', CALENDAR_UNKNOWN: '该日数据待确认', REVIEW: '收益待核对' })[status] ?? '数据待确认'
}
/** 返回目标仅限持仓页，保留原 URL 参数顺序以匹配滚动位置；拒绝外部地址和未知字段。 */
export function earningsReturnPath(value: unknown): string {
  if (typeof value !== 'string' || value.split('?')[0] !== '/portfolio') return '/portfolio?section=holdings'
  const source = new URLSearchParams(value.split('?')[1] ?? '')
  const params = new URLSearchParams()
  for (const [key, val] of source) {
    if (key === 'section' && ['overview', 'holdings', 'plans', 'orders'].includes(val)) params.set(key, val)
    if (key === 'fundCode' && /^\d{6}$/.test(val)) params.set(key, val)
    if (key === 'keyword' && val) params.set(key, val.slice(0, 50))
    if (key === 'sort' && ['marketValue', 'holdingGain', 'cumulativeGain'].includes(val)) params.set(key, val)
    if (key === 'showHistory' && val === '1') params.set(key, val)
    if (key === 'size' && ['10', '20', '50'].includes(val)) params.set(key, val)
    if (key === 'page' && /^\d+$/.test(val) && Number(val) >= 1 && Number(val) <= 1_000_000) params.set(key, val)
  }
  return `/portfolio${params.size ? `?${params}` : ''}`
}

/** 鼠标选择文字、辅助点击、红框排除区域及内部交互都不能触发卡片跳转。 */
export function shouldOpenEarnings(event: MouseEvent, selection: string): boolean {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || selection.trim()) return false
  const target = event.target
  return target instanceof Element && !target.closest('button, a, input, select, textarea, summary, [data-earnings-exclude]')
}
/** 捕获阶段只拦收益链接的普通鼠标点击，早于 RouterLink 默认导航；键盘和辅助打开行为不受影响。 */
export function shouldBlockEarningsLink(event: MouseEvent, selection: string): boolean {
  return event.detail > 0 && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey
    && !!selection.trim() && event.target instanceof Element && !!event.target.closest('[data-earnings-link]')
}
let savedScroll: { path: string; top: number } | null = null
/** 仅保存本次来源持仓页的位置，不持久化账户信息；统一查询编码避免中文空格导致路径匹配失败。 */
export function rememberEarningsScroll(path: string, top: number) { savedScroll = { path: earningsReturnPath(path), top } }
export function takeEarningsScroll(path: string): number | null {
  const top = savedScroll?.path === earningsReturnPath(path) ? savedScroll.top : null
  savedScroll = null
  return top
}
