export type ReviewHorizon = 'T1' | 'T5_V1' | 'T20_V1' | 'M6_V1'
export interface ForecastPeriodDates {
  horizonId: ReviewHorizon
  endDate: string | null
  nominalEndDate?: string | null
  endDateBasis?: string | null
}
export interface PredictionReviewPeriod extends ForecastPeriodDates {
  decision: 'UP' | 'DOWN' | 'FLAT' | 'ABSTAIN'
  kind: 'DATED_ANALYSIS' | 'RETROSPECTIVE' | 'CONDITIONAL_OUTLOOK'
  confidence: 'LOW'
  baseNavDate: string | null
  startDate: string | null
  analysisAt: string
  sourceCutoff?: string
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
export interface CurrentForecast {
  fundCode: string
  window: {
    baseNavDate: string | null
    targetNavDate: string | null
    nextWindowOpenAt: string
    periods: ForecastPeriodDates[]
  }
  review: PredictionReview | null
}
export interface PredictionReviewRequest {
  status: 'PENDING_ANALYSIS' | 'WAITING_FOR_NAV' | 'AVAILABLE'
  summary: string
  requestedAt: string
}
export interface PredictionReviewHistoryItem extends PredictionReview { releaseId: string }
export interface PredictionReviewHistoryPage {
  items: PredictionReviewHistoryItem[]
  nextCursor: { before: string; beforeId: string } | null
}
