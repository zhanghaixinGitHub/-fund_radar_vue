import { get, post } from './http'
import type { DecisionReport, MultiCurrent, PredictionTask } from '@/types/multiPrediction'

export const readMultiPrediction = (code: string) => get<MultiCurrent>(`/api/v1/watchlist/${encodeURIComponent(code)}/predictions`)
export const generateMultiPrediction = (code?: string) => post<PredictionTask>(code
  ? `/api/v1/watchlist/${encodeURIComponent(code)}/predictions/generate` : '/api/v1/watchlist/predictions/generate')
export const readPredictionTask = (id: string) => get<PredictionTask>(`/api/v1/watchlist/predictions/tasks/${encodeURIComponent(id)}`)
export const readLatestPredictionTask = () => get<PredictionTask | null>('/api/v1/watchlist/predictions/tasks/latest')
export const retryPredictionTask = (id: string) => post<PredictionTask>(`/api/v1/watchlist/predictions/tasks/${encodeURIComponent(id)}/retry`)
export const readDecision = (code: string) => get<DecisionReport | null>(`/api/v1/portfolio/funds/${encodeURIComponent(code)}/decision`)
export const readLatestDecisions = () => get<DecisionReport[]>('/api/v1/portfolio/decisions/latest')
export const generateDecision = (code: string) => post<DecisionReport>(`/api/v1/portfolio/funds/${encodeURIComponent(code)}/decision/generate`)
export const readDecisionHistory = (code: string, page = 1, version = 'HOLDING_ADVICE_V3_THREE_STATE') => get<DecisionReport[]>(`/api/v1/portfolio/funds/${encodeURIComponent(code)}/decision/history?page=${page}&version=${encodeURIComponent(version)}`)
export interface DecisionOutcome { horizon_id: string; outcomes: { correct: boolean; totalReturn: string; checkedAt: string }[] | null; check_state: { summary?: string } | null }
export const readDecisionOutcomes = (code: string, page = 1, version = 'HOLDING_ADVICE_V3_THREE_STATE') => get<Record<string, DecisionOutcome>>(`/api/v1/portfolio/funds/${encodeURIComponent(code)}/decision/outcomes?page=${page}&version=${encodeURIComponent(version)}`)
export const readStrategyPreference = () => get<{ preference: string; defaultPreference: boolean }>('/api/v1/portfolio/strategy-preference')
export const saveStrategyPreference = (preference: string) => post('/api/v1/portfolio/strategy-preference', { preference })
