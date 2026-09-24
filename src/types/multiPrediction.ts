/** 新多周期原始判断；份额/模型/周期数量与去重基金数分别统计。 */
export interface PredictionError { code: string; stage: string; summary: string; details?: Record<string, unknown>; traceId?: string; nextAction?: string; retryable?: boolean }
export interface MultiPrediction {
  baseNavDate?: string; generationPolicy?: string
  predictionId: string; fundCode: string; horizonId: string; startDate: string; endDate: string | null
  nominalEndDate: string | null; endDateStatus: string; direction: 'UP' | 'FLAT' | 'DOWN' | 'NON_UP'; reason: string
  targetDefinitionId?: string; directionPolicyHash?: string; flatThreshold?: string
  modelId: string; modelHash: string; activationRevision: number; generatedAt: string; dataAsOf: string
  baseline: boolean; fallbackReason: PredictionError[] | null; limitations: string[]; role: string
  modelManifest: { recipeVersion: string; labelEndMax: string | null; trainedAt: string | null; evidenceLevel: string }
}
export interface MultiCurrent {
  fundCode: string; horizons: { horizon_id: string; label: string }[]; predictions: MultiPrediction[]
  latestAttempts: { horizon_id: string; created_at: string; payload: { generationStatus: string; error?: PredictionError; generatedAt: string } }[]
  targetResolutions?: Record<string, { endDate: string }>
}
export interface PredictionTask {
  taskId: string; status: string; fundCount: number; plannedItems: number; createdItems: number; reusedItems: number
  failedItems: number; cancelledItems: number; pendingItems: number; fallbackItems: number; baselineItems: number
  items: { fundCode: string; horizonId: string; status: string; result: { error?: PredictionError } | null }[]
}
export interface DecisionReport {
  reportId: string; fundCode: string; generatedAt: string; validUntil: string; generationStatus: string
  decision: string | null; summary: string; supportingEvidence: string[]; opposingEvidence: string[]; neutralEvidence?: string[]
  facts: string[]; missingOptionalFactors: string[]; strategyVersion: string; preference: string; defaultPreference: boolean
  modelRefs: { predictionId: string; horizonId: string; modelId: string; modelHash: string; activationRevision: number }[]
  executionConstraints: string[]; error?: PredictionError
}
