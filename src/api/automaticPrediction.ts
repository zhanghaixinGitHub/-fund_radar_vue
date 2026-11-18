import { get, post } from './http'

export interface AutoCycle { cycleId: string; status: string; trigger: string; fundCount: number; createdAt: string; updatedAt: string; decision: string | null; error: { summary: string; code: string } | null; retries: number; nextAttemptAt: string | null }
const root = '/api/v1/predictions/automatic'
export const readAutoCycles = (before?: string, beforeId?: string) => get<{ items: AutoCycle[] }>(`${root}/cycles${before ? `?before=${encodeURIComponent(before)}&beforeId=${encodeURIComponent(beforeId ?? '')}` : ''}`)
export const readAutoCycleDetail = (id: string) => get<Record<string, unknown>>(`${root}/cycles/${encodeURIComponent(id)}`)
export const controlAutoCycle = (id: string, action: 'cancel' | 'resume') => post<Record<string, unknown>>(`${root}/cycles/${encodeURIComponent(id)}/${action}`, {})
