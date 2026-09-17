import { get, post } from '@/api/http'
import type { AdviceDetail, AdviceHistory, AdviceSummary, DiagnosisHistory, DiagnosisSummary } from '@/types/advice'

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

const diagnosisBase = '/api/v1/sim-portfolios/current/diagnosis'
/** 批量读取本人各持仓基金的最新诊断摘要；失败时由调用方降级展示，不伪造「正常」结论。 */
export const fetchCurrentDiagnosis = () => get<DiagnosisSummary[]>(diagnosisBase)
/** 单基金诊断：返回分页历史与最新报告的逐项明细（结论、证据、来源、数据截至日）。 */
export function fetchFundDiagnosis(code: string, options: { page?: number; pageSize?: number } = {}) {
  const params = new URLSearchParams({ page: String(options.page ?? 1), pageSize: String(options.pageSize ?? 20) })
  return get<DiagnosisHistory>(`${diagnosisBase}/${encodeURIComponent(code)}?${params}`)
}
