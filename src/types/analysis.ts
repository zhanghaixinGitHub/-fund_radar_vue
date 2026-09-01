/** 已发布或暂停模型关联的回测事实摘要；不代表个人收益预测或交易建议。 */
export interface FundBacktestSummary {
  runId: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'REJECTED' | 'FAILED'
  publicationStatus: 'NOT_EVALUATED' | 'ELIGIBLE' | 'INELIGIBLE'
  windowStart: string
  windowEnd: string
  testStart: string | null
  testEnd: string | null
  dataCutoff: string | null
  feeRate: number | string
  sampleCount: number | null
  rollingFoldCount: number | null
  annualizedReturn: number | string | null
  maxDrawdown: number | string | null
  volatility: number | string | null
  hitRate: number | string | null
  longHoldResult: number | string | null
  dcaResult: number | string | null
  benchmarkStatus: 'AVAILABLE' | 'NOT_CONFIGURED' | null
  benchmarkResult: number | string | null
  completedAt: string | null
}

/** 已通过人工发布或已暂停的模型版本；候选版本不会返回给浏览器。 */
export interface FundModelAnalysisSummary {
  modelReleaseId: string
  modelVersion: string
  featureVersion: string
  releaseStatus: 'ACTIVE' | 'SUSPENDED'
  effectiveAt: string | null
  suspendedAt: string | null
}

/** 基金详情的已发布模型可用性与关联回测摘要。 */
export interface FundAnalysisSummary {
  fundCode: string
  fundType: string | null
  availabilityStatus: 'ACTIVE' | 'MODEL_PAUSED' | 'MODEL_UNAVAILABLE'
  message: string
  model: FundModelAnalysisSummary | null
  backtest: FundBacktestSummary | null
  stale: boolean
  cachedAt: string | null
}

/** 管理员受控回测的持久状态；浏览器仅查询和显示，不可自行改写。 */
export interface AnalysisRunStatus {
  analysisRunId: string
  runType: 'ROLLING_BACKTEST'
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  fundType: string
  taskId: string | null
  backtestRunId: string | null
  modelReleaseId: string | null
  modelReleaseStatus: 'DRAFT' | 'ELIGIBLE' | 'ACTIVE' | 'SUSPENDED' | 'RETIRED' | null
  failureReason: string | null
  requestedAt: string
  startedAt: string | null
  finishedAt: string | null
}
