import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { fundTypeOptions } from '@/utils/fundPresentation'
import { normalizeRatingFilter } from '@/utils/fundRating'
import type { RatingFilter } from '@/utils/fundRating'

/** 列表筛选与分页由 URL 驱动，浏览器返回及详情返回使用相同状态。 */
export function useListLocation() {
  const route = useRoute()
  const router = useRouter()
  const routeName = route.name
  const isCurrent = computed(() => route.name === routeName)
  const location = computed(() => ({
    type: fundTypeOptions.find((item) => item.value === route.query.type)?.value ?? '',
    keyword: typeof route.query.keyword === 'string' ? route.query.keyword.slice(0, 50) : '',
    rating: routeName === 'fund-market' ? normalizeRatingFilter(route.query.rating) : '',
    page: Math.min(1_000_000, Math.max(1, Number.isInteger(Number(route.query.page)) ? Number(route.query.page) : 1)),
    size: [10, 20, 50].includes(Number(route.query.size)) ? Number(route.query.size) : 10,
  }))
  async function navigate(type: string, keyword: string, page: number, size: number, rating?: RatingFilter | ''): Promise<boolean> {
    const query = { ...route.query, type: type || undefined, keyword: keyword.trim() || undefined,
      page: page > 1 ? String(page) : undefined, size: size !== 10 ? String(size) : undefined }
    // 评级仅用于基金市场；其他列表继续沿用各自原有的筛选条件。
    if (routeName === 'fund-market') Object.assign(query, { rating: rating || undefined })
    const target = { path: route.path, query }
    if (router.resolve(target).fullPath === route.fullPath) return false
    await router.push(target)
    return true
  }
  return { location, navigate, isCurrent }
}
