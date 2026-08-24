import { get } from '@/api/http'
import type { FundDetail, FundListQuery, FundPage } from '@/types/fund'

/** Query the Java public fund page; the browser must never call FastAPI directly. */
export function getFunds(query: FundListQuery = {}): Promise<FundPage> {
  const search = new URLSearchParams()
  if (query.keyword) {
    search.set('keyword', query.keyword)
  }
  if (query.pageSize) {
    search.set('pageSize', String(query.pageSize))
  }
  if (query.cursor) {
    search.set('cursor', query.cursor)
  }
  const queryString = search.toString()
  return get<FundPage>(`/api/v1/funds${queryString ? `?${queryString}` : ''}`)
}

/** Query one public fund detail through the Java core service. */
export function getFundDetail(fundCode: string): Promise<FundDetail> {
  return get<FundDetail>(`/api/v1/funds/${encodeURIComponent(fundCode)}`)
}
