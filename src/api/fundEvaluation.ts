import { get } from '@/api/http'

export interface EvaluationStatus {
  fundCode: string; score: number | null; rank: number | null; scoreDate: string | null
  coverageCheckedAt: string | null; navAsOfDate: string | null; message: string; reasons: string[]; note: string
}

/** 同页批量读取核对结果，缺失值保持为空，不借用其他分析的分数。 */
export const readEvaluationStatus = (codes: string[]) => get<{ items: EvaluationStatus[] }>(
  `/api/v1/funds/evaluation-status?${new globalThis.URLSearchParams({ fundCodes: codes.join(',') })}`,
)
