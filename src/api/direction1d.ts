import { get, post, put } from '@/api/http'
import type { Direction1dCoverage, Direction1dCurrent, Direction1dPage, Direction1dRecord, Direction1dStatus, Direction1dCursor, Direction1dMetrics } from '@/types/direction1d'

const base = '/api/v1/watchlist/prediction-1d'
export const getDirection1dStatus = () => get<Direction1dStatus>(`${base}/status`)
export const setDirection1dSubscription = (enabled: boolean) => put<Direction1dStatus>(`${base}/subscription`, { enabled })
export const getDirection1dCoverage = (page: number, keyword = '') => get<Direction1dPage<Direction1dCoverage> & {
  checkedCount: number; statusCounts: Record<string, number>
}>(`${base}/coverage?${new URLSearchParams({ page: String(page), pageSize: '20', keyword })}`)
export const getDirection1dHistory = (page: number, fundCode = '', cursor?: Direction1dCursor, filters: Record<string, string> = {}) => get<Direction1dPage<Direction1dRecord>>(
  `${base}/history?${new URLSearchParams({ page: String(page), pageSize: '20', fundCode, ...cursor, ...filters })}`,
)
export const getDirection1dCurrent = (code: string) => get<Direction1dCurrent>(`/api/v1/watchlist/${encodeURIComponent(code)}/prediction-1d`)
export const generateDirection1d = (code: string) => post<{ status: string; reason?: string }>(
  `/api/v1/watchlist/${encodeURIComponent(code)}/prediction-1d/generate`,
)
export const getDirection1dMetrics = (labelBasis = 'FIRST_OBSERVED') => get<Direction1dMetrics>(`${base}/metrics?${new URLSearchParams({ labelBasis })}`)
