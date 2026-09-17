import { get, post } from '@/api/http'
import type {
  AdviceDetail, AdviceHistory, AdviceSummary, DiagnosisHistory, DiagnosisSummary, HoldingRulesView, RuleDraftView,
} from '@/types/advice'

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

const ruleBase = '/api/v1/sim-portfolios/current'
/** 读取当前草案；数据不足或不适用时返回明确状态与原因，不返回阈值数字。 */
export const fetchRuleDraft = (code: string) => get<RuleDraftView>(`${ruleBase}/rule-drafts/${encodeURIComponent(code)}`)
/** 重新生成草案；统计未变时幂等沿用，不覆盖已确认规则。 */
export const generateRuleDraft = (code: string) => post<RuleDraftView>(`${ruleBase}/rule-drafts/${encodeURIComponent(code)}/generate`)
export const fetchHoldingRules = (code: string) => get<HoldingRulesView>(`${ruleBase}/rules/${encodeURIComponent(code)}`)
/** 显式确认所选档位或微调值；同一参数重复确认不生成新版本。 */
export function confirmHoldingRule(code: string, request: { tier: string; takeProfitPct?: string; reduceDrawdownPct?: string }) {
  return post<HoldingRulesView>(`${ruleBase}/rules/${encodeURIComponent(code)}/confirm`, request)
}
/** 撤销本人规则；撤销留痕，重复撤销幂等。 */
export const revokeHoldingRule = (code: string) => post<HoldingRulesView>(`${ruleBase}/rules/${encodeURIComponent(code)}/revoke`)
