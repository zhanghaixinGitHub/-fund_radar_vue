import { get, post } from './http'

export interface PredictionEffects {
  mode: string; fundCount: number; followedFundCount: number; failedPeriods: number; note: string
  horizons: { horizon_id: string; target_definition_id: string; direction_policy_hash: string; up_actual: number; flat_actual: number; down_actual: number; up_correct: number; flat_correct: number; down_correct: number; records: number; funds: number; matured: number; unmatured: number; pending_answers: number; check_failed: number; correct: number; matured_funds: number }[]
}
export interface LedgerResult { finalEquity: number; netReturn: number; maxDrawdown: number; fees: number; tradeCount: number }
export interface AdviceEffects {
  status: string; message?: string; note: string; startDate: string; endDate: string; actualStartDate?: string
  reportCount?: number; effectiveDays?: number; failedReports?: number; missingReportDays?: number
  system?: LedgerResult; buyHold?: LedgerResult; evidenceHash?: string
}
export interface AutoCycle { cycleId: string; status: string; trigger: string; fundCount: number; createdAt: string; updatedAt: string; decision: string | null; error: { summary: string; code: string } | null; retries: number; nextAttemptAt: string | null }
const root = '/api/v1/predictions/automatic'
export const readPredictionEffects = () => get<PredictionEffects>(`${root}/effects`)
export const readAdviceEffects = (fundCode: string, startDate: string, endDate: string) => post<AdviceEffects>(`${root}/advice-effects`, { fundCode, startDate, endDate })
export const readAutoCycles = (before?: string, beforeId?: string) => get<{ items: AutoCycle[] }>(`${root}/cycles${before ? `?before=${encodeURIComponent(before)}&beforeId=${encodeURIComponent(beforeId ?? '')}` : ''}`)
export const readAutoCycleDetail = (id: string) => get<Record<string, unknown>>(`${root}/cycles/${encodeURIComponent(id)}`)
export const controlAutoCycle = (id: string, action: 'cancel' | 'resume') => post<Record<string, unknown>>(`${root}/cycles/${encodeURIComponent(id)}/${action}`, {})
