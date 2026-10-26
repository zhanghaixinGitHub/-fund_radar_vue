import type { ManagerFund } from '@/types/fundManager'

const MANAGER_PATH = /^\/fund-managers(?:\/[0-9a-f-]{36}(?:\/funds\/[0-9a-f-]{36})?)?$/i

/** 只允许已知站内路径及业务参数，拒绝站外地址和任意重定向；未知来源回到经理目录。 */
export function managerReturnPath(value: unknown, fallback = '/fund-managers'): string {
  if (typeof value !== 'string' || value.length > 3000 || !value.startsWith('/') || value.startsWith('//')) return fallback
  try {
    const url = new URL(value, 'https://fund-radar.invalid')
    if (url.origin !== 'https://fund-radar.invalid'
      || (!MANAGER_PATH.test(url.pathname) && !/^\/(funds|watchlist)(\/\d{6})?$/.test(url.pathname))) return fallback
    const parameters = new URLSearchParams()
    for (const key of ['keyword', 'company', 'fundType', 'state', 'page', 'pageSize', 'size', 'type', 'rating', 'section', 'from']) {
      const item = url.searchParams.get(key)
      if (item && item.length <= (key === 'from' ? 2000 : 128)) parameters.set(key, item)
    }
    return `${url.pathname}${parameters.size ? `?${parameters}` : ''}`
  } catch { return fallback }
}

/** 原市场有资料的基金沿用现有详情；新关联份额使用可用的基础详情，不能跳进404。 */
export function managerFundTarget(managerId: string, fund: ManagerFund, from: string) {
  return fund.mappedFundCode
    ? { name: 'fund-detail', params: { fundCode: fund.mappedFundCode }, query: { from } }
    : { name: 'manager-related-fund', params: { managerId, relatedFundId: fund.relatedFundId }, query: { from } }
}

export function managerDate(value: string | null): string {
  if (!value) return '暂缺'
  const date = new Date(value)
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
    : '暂缺'
}

/** 拒绝空值、NaN和无穷值，不让Number(null)变成0。 */
export function managerRate(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value))) return '暂缺'
  return `${(Number(value) * 100).toFixed(2)}%`
}
