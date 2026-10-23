import type { RatingGrade, RatingSummary } from '../api/fundRating'

const labels = { WEAK: '偏弱', AVERAGE: '一般', GOOD: '良好', EXCELLENT: '优质' } as const

/** 市场筛选复用已发布等级；无评分和待更新分别对应页面的两种业务状态。 */
export type RatingFilter = RatingGrade | 'UNRATED' | 'PENDING'
export const ratingFilterOptions: { value: RatingFilter; label: string }[] = [
  { value: 'EXCELLENT', label: labels.EXCELLENT },
  { value: 'GOOD', label: labels.GOOD },
  { value: 'AVERAGE', label: labels.AVERAGE },
  { value: 'WEAK', label: labels.WEAK },
  { value: 'UNRATED', label: '暂无评分' },
  { value: 'PENDING', label: '评级待更新' },
]

/** URL 只接受已知选项；未知值恢复全部评级，避免向接口传入非法参数。 */
export function normalizeRatingFilter(value: unknown): RatingFilter | '' {
  return ratingFilterOptions.find((option) => option.value === value)?.value ?? ''
}

/** 仅翻译状态与标签；页面永远不接收或计算评分。过期判定也覆盖页面停留期间。 */
export function ratingLabel(value?: RatingSummary | null, loading = false, now = Date.now()): string {
  if (loading) return '评级读取中'
  if (!value) return '评级暂不可用'
  if (value.status === 'STALE' || value.status === 'WITHDRAWN') return '评级待更新'
  if (value.status === 'RATED' || value.status === 'PARTIAL') {
    if (!value.validUntil || !Number.isFinite(Date.parse(value.validUntil))) return '评级暂不可用'
    if (Date.parse(value.validUntil) <= now) return '评级待更新'
    if (value.status === 'PARTIAL') return '部分评分'
    return value.grade && labels[value.grade] || '评级暂不可用'
  }
  return value.status === 'NOT_FOUND' ? '基金不存在' : '暂无评分'
}

/** 来源链接不允许脚本协议，也不把内部路径当成用户入口。 */
export function ratingSourceUrl(value: string): string | undefined {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined
  } catch { return undefined }
}

/** 只格式化服务端正式分数；兼容旧响应，空值、布尔及越界值均不显示为0分。 */
export function formatRatingScore(value: unknown): string | null {
  if ((typeof value !== 'string' && typeof value !== 'number') || value === '') return null
  if (typeof value === 'string' && !value.trim()) return null
  const point = Number(value)
  return Number.isFinite(point) && point >= 0 && point <= 100 ? point.toFixed(2) : null
}
