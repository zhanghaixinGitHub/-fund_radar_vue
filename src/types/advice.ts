import type { DirectionExperiment } from '@/types/directionExperiment'
import type { DecimalValue, SimOverview, SimPage, SimPosition } from '@/types/simulation'

/** 操作建议与依据分开；概率/分数只能出现在依据正文，卡片没有预测指标。 */
export type AdviceDecision = 'HOLD' | 'SELL' | 'UNAVAILABLE'
export interface AdviceEvidence {
  type: 'MODEL' | 'RULE' | 'DATA_STATUS' | 'NEWS' | 'ANNOUNCEMENT' | 'POLICY'
  relation: 'SUPPORT' | 'AGAINST' | 'CONTEXT'
  title: string; content: string; source: string; sourceDate: string | null; sourceUrl: string | null
}
export interface AdviceSummary {
  reportId: string; fundCode: string; fundName: string; reportDate: string; generatedAt: string
  decision: AdviceDecision; summary: string; ruleVersion: string; cutoffDate: string | null
  observationStart: string | null; observationEnd: string | null; originalReportId: string | null
  reviewStatus: 'WAITING' | 'DATA_INSUFFICIENT' | 'ASSESSED' | 'NOT_APPLICABLE'
  totalReturn: DecimalValue | null; support: 'SUPPORTED' | 'UNSUPPORTED' | 'FLAT' | null
}
export interface AdviceSnapshot {
  ruleVersion: string; decision: AdviceDecision; summary: string; evidence: AdviceEvidence[]
  limitations: string[]; position: SimPosition; experiment: DirectionExperiment | null
  observationStart: string | null; observationEnd: string | null
}
export interface AdviceOutcome {
  fundCode: string; startDate: string; endDate: string; status: 'WAITING' | 'DATA_INSUFFICIENT' | 'ASSESSED'
  checkedAt: string; totalReturn: DecimalValue | null; message: string; basis: string; source: string
  evidenceHash: string | null; evidence: Record<string, unknown> | null
}
export interface AdviceDetail { report: AdviceSummary; snapshot: AdviceSnapshot; outcome: AdviceOutcome | null }
export interface AdviceStats {
  reports: number; samples: number; assessed: number; supported: number; unsupported: number; flat: number
  pending: number; carried: number; noAdvice: number; ruleVersion: string
}
export interface AdviceHistory {
  fundCode: string; fundName: string; reports: SimPage<AdviceSummary>; stats: AdviceStats; job: SimOverview['job']
}
