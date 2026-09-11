import { get, post } from '@/api/http'
import type { AdviceDetail, AdviceHistory, AdviceSummary } from '@/types/advice'

const base = '/api/v1/sim-portfolios/current/advice'
export const getLatestAdvice = () => get<AdviceSummary[]>(base)
export const getAdviceReport = (code: string, id: string) => get<AdviceDetail>(`${base}/${encodeURIComponent(code)}/reports/${encodeURIComponent(id)}`)
export const generateAdvice = (code: string) => post<AdviceDetail>(`${base}/${encodeURIComponent(code)}/generate`)
/** 历史按服务端真实生成日期分页；筛选条件不作为重新生成历史的参数。 */
export function getAdviceHistory(code: string, page = 1, start = '', end = '') {
  const params = new URLSearchParams({ page: String(page), pageSize: '20', ruleVersion: 'HOLDING_ADVICE_V1' })
  if (start) params.set('startDate', start)
  if (end) params.set('endDate', end)
  return get<AdviceHistory>(`${base}/${encodeURIComponent(code)}?${params}`)
}
