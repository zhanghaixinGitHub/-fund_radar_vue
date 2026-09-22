import { get, post } from '@/api/http'
import type { Direction1dCoverage, Direction1dCurrent, Direction1dPage, Direction1dRecord, Direction1dStatus, Direction1dCursor, Direction1dMetrics } from '@/types/direction1d'
import { assertDirection1dFundHistory } from '@/utils/direction1d'

const base = '/api/v1/watchlist/prediction-1d'
export const getDirection1dStatus = () => get<Direction1dStatus>(`${base}/status`)
export const getDirection1dCoverage = (page: number, keyword = '') => get<Direction1dPage<Direction1dCoverage> & {
  checkedCount: number; statusCounts: Record<string, number>
}>(`${base}/coverage?${new URLSearchParams({ page: String(page), pageSize: '20', keyword })}`)
export const getDirection1dHistory = (page: number, fundCode = '', cursor?: Direction1dCursor, filters: Record<string, string> = {}) => get<Direction1dPage<Direction1dRecord>>(
  `${base}/history?${new URLSearchParams({ page: String(page), pageSize: '20', fundCode, ...cursor, ...filters })}`,
)
/** 单基金入口必传代码；沿用服务端的当前账号授权与基金过滤，不读取覆盖清单或账号统计。 */
export async function getDirection1dFundHistory(fundCode: string, page: number, cursor?: Direction1dCursor): Promise<Direction1dPage<Direction1dRecord>> {
  assertDirection1dFundHistory(fundCode, [])
  const result = await getDirection1dHistory(page, fundCode, cursor)
  assertDirection1dFundHistory(fundCode, result.items)
  return result
}
export const getDirection1dCurrent = (code: string) => get<Direction1dCurrent>(`/api/v1/watchlist/${encodeURIComponent(code)}/prediction-1d`)
export const generateDirection1d = (code: string) => post<{ status: string; reason?: string }>(
  `/api/v1/watchlist/${encodeURIComponent(code)}/prediction-1d/generate`,
)
export const getDirection1dMetrics = (labelBasis = 'FIRST_OBSERVED') => get<Direction1dMetrics>(`${base}/metrics?${new URLSearchParams({ labelBasis })}`)
