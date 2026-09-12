/** 1日实验独立契约；正式概率永远为空，分数仅用于尚未校准的实验方向。 */
export interface Direction1dCoverage {
  fundCode: string
  fundName: string
  fundType: string
  shareClass: string
  groupId: string | null
  productFamilyId: string | null
  status: string
  reasonCodes: string[]
  historyStart: string | null
  historyEnd: string | null
  historyCount: number
  missingCount: number
  missingDates: string[]
  latestNavDate: string | null
  observedAt: string
  predictionStatus: string
  modelIds: string[]
  groupEvidence?: { benchmark: string | null; source: string | null; historicalMappingEvidence: string }
}
export interface Direction1dWindow {
  baseNavDate: string
  targetNavDate: string
  deadlineAt: string
  windowOpenAt: string
  nextWindowOpenAt: string
  status: string
}
export interface Direction1dBranch {
  branchId: 'FIXED' | 'WEEKLY'
  modelId: string | null
  modelHash: string | null
  score: number | null
  predictedDirection: 'UP' | 'NON_UP' | null
  status: string
  trainedAt?: string
  registeredAt?: string
  modelSelectedAt?: string
  trainAsOf?: string
}
export interface Direction1dForecast extends Direction1dWindow {
  activationPolicy?: 'BEFORE_WINDOW_V1' | 'AVAILABLE_AT_PREDICTION_V2'
  fundCode: string
  fundName: string
  schemaVersion: 'DIRECTION_1D_EXPERIMENT_V1'
  horizonTradingDays: 1
  targetDefinition: 'UNIT_NAV_DIRECTION_V1'
  modelReleased: false
  upProbability: null
  generatedAt: string
  inputHash: string
  branches: Direction1dBranch[]
  input: { eventStatus: string; featureAsOf: string; values: { navDate: string; unitNav: string }[] }
}
export interface Direction1dOutcome {
  actualDirection: 'UP' | 'DOWN' | 'FLAT'
  y: 0 | 1
  baseUnitNav: string
  targetUnitNav: string
  navReturn: string
  labelObservedAt: string
}
export interface Direction1dRecord {
  status?: string
  forecastId: string
  forecast: Direction1dForecast
  storedAt: string
  receiptVerifiedAt: string | null
  receiptStatus: string | null
  outcomes: Direction1dOutcome[]
}
export interface Direction1dCursor { beforeDate: string; beforeId: string }
export interface Direction1dPage<T> { items: T[]; totalCount: number; page: number; pageSize: number; nextCursor?: Direction1dCursor }
export interface Direction1dMetric {
  kind: string; key: string; branch_id: string; assessed_count: number; correct_count: number
  pending_count: number; distinct_target_dates: number; flat_count: number; unavailable_count: number
  accuracy: number | null; balanced_accuracy: number | null; up_recall: number | null; non_up_recall: number | null
  family_date_weighted_accuracy: number | null
}
export interface Direction1dMetrics {
  branches: Direction1dMetric[]; strata: Direction1dMetric[]; strataTruncated: boolean; observationNote: string
  paired: { paired_count: number; assessed_pair_count: number; fixed_only_count: number; weekly_only_count: number; weekly_extra_correct: number | null }
  coverage: { checked_fund_days: number; applicable_fund_days: number; missed_deadline_count: number; failed_count: number; verified_forecast_count: number }
}
export interface Direction1dStatus {
  enabled: boolean
  backendEnabled: boolean
  forecastEnabled: boolean
  modelReleased: false
  upProbability: null
  python: { window: Direction1dWindow; serverTime: string; trainingPolicyNote: string; recentJobs: { kind: string; state: string; reason: string | null }[] }
  health: { state: string; message: string; finished_at: string; checked_count: number; failed_count: number }[]
}
export interface Direction1dCurrent {
  coverage: Direction1dCoverage
  window: Direction1dWindow
  history: Direction1dPage<Direction1dRecord>
  enabled: boolean
}
