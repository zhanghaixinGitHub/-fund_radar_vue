export type ReviewHorizon = 'T1' | 'T5_V1' | 'T20_V1' | 'M6_V1'
export interface PredictionReviewPeriod {
  horizonId: ReviewHorizon
  decision: 'UP' | 'DOWN' | 'ABSTAIN'
  kind: 'DATED_ANALYSIS' | 'RETROSPECTIVE' | 'CONDITIONAL_OUTLOOK'
  confidence: 'LOW'
  baseNavDate: string | null
  startDate: string | null
  endDate: string | null
  nominalEndDate: string | null
  analysisAt: string
  summary: string
  primaryReason: string
  counterReason: string
  conditions: string[]
  limitations: string[]
  awaitingReason: string | null
}
export interface PredictionReview {
  fundCode: string
  adoptedAt: string
  reviewedAt: string
  marketAsOf: string | null
  periods: PredictionReviewPeriod[]
}
export interface PredictionReviewRequest {
  status: 'PENDING_ANALYSIS' | 'WAITING_FOR_NAV' | 'AVAILABLE'
  summary: string
  requestedAt: string
}
