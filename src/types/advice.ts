import type { DirectionExperiment } from '@/types/directionExperiment'
import type { DecimalValue, SimOverview, SimPage, SimPosition } from '@/types/simulation'

/** 操作建议与依据分开；BUY 仅展示明确的买入建议，HOLD 仍为继续持有，概率/分数只出现在依据正文。 */
export type AdviceDecision = 'BUY' | 'HOLD' | 'SELL' | 'UNAVAILABLE'
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

/** 持仓诊断是逐项事实核对，结论只表达「持有理由是否仍成立」，不是涨跌预测。 */
export type DiagnosisVerdict = 'VALID' | 'CHANGED' | 'INSUFFICIENT'
export type DiagnosisItemKey = 'MANAGER' | 'SCALE' | 'SAME_TYPE_RANK' | 'BENCHMARK' | 'DRAWDOWN' | 'FEE' | 'DIVIDEND'
export interface DiagnosisSummary {
  reportId: string; fundCode: string; fundName: string; reportDate: string; generatedAt: string
  verdict: DiagnosisVerdict; cutoffDate: string | null
}
export interface DiagnosisItem {
  item: DiagnosisItemKey; verdict: DiagnosisVerdict; evidence: string; source: string
  dataAsOfDate: string | null; facts: Record<string, unknown> | null
}
export interface DiagnosisReportDetail { report: DiagnosisSummary; items: DiagnosisItem[] }
/** 尚无持仓或首份报告未生成时 latest 为空，页面如实展示而不是伪造「全部成立」。 */
export interface DiagnosisHistory {
  fundCode: string; fundName: string; reports: SimPage<DiagnosisSummary>
  latest: DiagnosisReportDetail | null; job: SimOverview['job']
}

/** 规则草案只是参考数字，止盈/减仓线触发只产生复核提示，不构成投资建议。 */
export type RuleTier = 'CONSERVATIVE' | 'BALANCED' | 'LOOSE' | 'CUSTOM'
export type RuleDraftStatus = 'AVAILABLE' | 'DATA_INSUFFICIENT' | 'NOT_APPLICABLE'
/** 末端无法完整观察的触发记 censored，不补造数值。 */
export interface RuleTriggerStats {
  triggerCount: number; medianFurtherDecline: DecimalValue | null; medianRecoveryDays: DecimalValue | null; censoredCount: number
}
export interface RuleDraftTier {
  tier: Exclude<RuleTier, 'CUSTOM'>; reduceDrawdownPct: DecimalValue; takeProfitPct: DecimalValue
  reduceTrigger: RuleTriggerStats | null; takeProfitTrigger: RuleTriggerStats | null
}
/** 数据不足或不适用时只有 status 与 reason，不给阈值数字；未归档结果 draftId/generatedAt 为空。 */
export interface RuleDraftView {
  draftId: string | null; fundCode: string | null; status: RuleDraftStatus; reason: string | null
  statsCutoffDate: string | null; generatedAt: string | null; historyDays: number | null; windowCount: number | null
  navBasis: string | null; stats: Record<string, unknown> | null; tiers: RuleDraftTier[]; assumption: string | null
}
export interface HoldingRule {
  ruleId: string; fundCode: string; tier: RuleTier; takeProfitPct: DecimalValue; reduceDrawdownPct: DecimalValue
  ruleParams: Record<string, unknown> | null; sourceDraftId: string | null; ruleVersion: string
  status: 'ACTIVE' | 'REVOKED'; confirmedAt: string; supersededAt: string | null
}
export interface HoldingRulesView { fundCode: string; active: HoldingRule | null; history: HoldingRule[] }
