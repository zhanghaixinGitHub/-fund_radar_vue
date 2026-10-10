import type { RatingSummary } from '../api/fundRating'

const labels = { WEAK: '偏弱', AVERAGE: '一般', GOOD: '良好', EXCELLENT: '优质' } as const

/** 仅翻译状态与标签；页面永远不接收或计算评分。过期判定也覆盖页面停留期间。 */
export function ratingLabel(value?: RatingSummary | null, loading = false, now = Date.now()): string {
  if (loading) return '评级读取中'
  if (!value) return '评级暂不可用'
  if (value.status === 'STALE' || value.status === 'WITHDRAWN') return '评级待更新'
  if (value.status === 'RATED') {
    if (!value.validUntil || !Number.isFinite(Date.parse(value.validUntil))) return '评级暂不可用'
    if (Date.parse(value.validUntil) <= now) return '评级待更新'
    return value.grade && labels[value.grade] || '评级暂不可用'
  }
  return value.status === 'NOT_FOUND' ? '基金不存在' : '暂未评级'
}

/** 来源链接不允许脚本协议，也不把内部路径当成用户入口。 */
export function ratingSourceUrl(value: string): string | undefined {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined
  } catch { return undefined }
}
