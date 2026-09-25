import { get } from '@/api/http'
import type { FundDocuments, FundMaterials } from '@/types/fundMaterials'
import type { FundShareHistory, WatchlistFundDetail } from '@/types/fund'

/** 两个详情入口读取同一公共资料，关注关系仍由关注接口独立校验。 */
export const getCompleteFundDetail = (code: string) =>
  get<WatchlistFundDetail>(`/api/v1/funds/${encodeURIComponent(code)}/complete-detail`)

export const getPublicFundShareHistory = (code: string, startDate: string, endDate: string) =>
  get<FundShareHistory>(`/api/v1/funds/${encodeURIComponent(code)}/share-history?${new URLSearchParams({ startDate, endDate })}`)

export function getFundMaterials(code: string, reportId = '', stockCode = ''): Promise<FundMaterials> {
  const query = new URLSearchParams()
  if (reportId) query.set('reportId', reportId)
  if (stockCode) query.set('stockCode', stockCode)
  return get<FundMaterials>(`/api/v1/funds/${encodeURIComponent(code)}/materials?${query}`)
}

/** 搜索和分页均由服务端完成，不向浏览器一次发送全部公告。 */
export function getFundDocuments(code: string, query: Record<string, string>): Promise<FundDocuments> {
  return get<FundDocuments>(`/api/v1/funds/${encodeURIComponent(code)}/materials/documents?${new URLSearchParams(query)}`)
}
