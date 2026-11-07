/** 市场分页的共同约束；URL 和控件输入均使用相同的默认值。 */
export function normalizePageSize(value: unknown): number {
  const size = Number(value)
  return [10, 20, 50].includes(size) ? size : 10
}

/** 非整数保留当前页，整数限制在已知总页数或接口允许的 10000 页内。 */
export function normalizePage(value: unknown, current = 1, pages = 10000): number {
  const page = Number(value)
  return Number.isInteger(page) ? Math.min(Math.max(1, page), Math.max(1, pages)) : current
}

/**
 * 兼容每次固定返回 20 条的旧历史接口，仅读取目标展示页覆盖的服务端页（最多 3 页）。
 * 不修改接口契约，不全量下载；总数仍由服务端已知的修订号或尾页结果提供。
 */
export async function readFixedPage<T>(read: (page: number) => Promise<{ items: T[]; hasMore: boolean }>, page: number, size: number) {
  const start = (page - 1) * size
  const first = Math.floor(start / 20) + 1
  const last = Math.floor((start + size - 1) / 20) + 1
  const rows: T[] = []
  let hasMore = false
  for (let target = first; target <= last; target++) {
    const result = await read(target)
    rows.push(...result.items)
    hasMore = result.hasMore
    if (!hasMore) break
  }
  const offset = start % 20
  return { items: rows.slice(offset, offset + size), page, hasMore: hasMore || rows.length > offset + size }
}

/**
 * 为仅返回“是否还有下一页”的列表定位末个非空页。
 * 先倍增确定范围，再二分收窄，避免逐页下载全部历史；只在用户点击尾页时调用。
 * maxPage 沿用这些历史接口的 10000 页上限，不能请求接口范围之外的页码。
 * 页面离开或筛选变化后停止后续请求，调用方仍需在提交结果前核对请求序号。
 */
export async function findLastPage<T>(
  read: (page: number) => Promise<T>,
  hasItems: (value: T) => boolean,
  hasMore: (value: T) => boolean,
  isCurrent: () => boolean,
  maxPage = 10000,
): Promise<{ page: number; value: T } | null> {
  let lower = 1
  let upper = maxPage + 1
  let last: { page: number; value: T } | null = null
  let candidate = 1
  while (isCurrent()) {
    const value = await read(candidate)
    if (!isCurrent()) return null
    if (hasItems(value)) {
      last = { page: candidate, value }
      if (!hasMore(value)) return last
      lower = candidate
      // 尚有记录却已达到接口上限时如实失败，不能把截断页称为尾页。
      if (lower === maxPage) throw new Error('记录较多，暂时无法跳至尾页，请缩小查询范围。')
    } else {
      if (candidate === 1) return { page: 1, value }
      upper = candidate
    }
    if (upper - lower <= 1) return last
    candidate = upper === maxPage + 1
      ? Math.min(lower * 2, maxPage)
      : Math.floor((lower + upper) / 2)
  }
  return null
}
