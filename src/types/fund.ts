/** Java 核心服务返回的 M0 基金列表项契约。 */
export interface FundSummary {
  fundCode: string
  fundName: string
  fundType: string
  status: string
  asOfDate: string | null
}

/** 基金公开详情；`M0_MOCK` 仅用于演示，界面不得将其描述为真实行情。 */
export interface FundDetail extends FundSummary {
  navStatus: string
  dataSource: string
  stale: boolean
  cachedAt: string | null
}

/** 支持游标翻页的基金列表响应。 */
export interface FundPage {
  items: FundSummary[]
  nextCursor: string | null
  stale: boolean
  cachedAt: string | null
}

/** 基金列表查询参数；游标由上一页响应提供。 */
export interface FundListQuery {
  keyword?: string
  pageSize?: number
  cursor?: string
}

/** Java 对外接口返回的 M2 可追溯来源关联事件。 */
export interface FundEvent {
  eventId: string
  eventType: string
  summary: string
  sourceName: string
  sourceUrl: string
  publishedAt: string
  confidence: number | string
  relevanceScore: number | string
  relationReason: string
}

/** 支持游标翻页的关联事件响应。 */
export interface FundEventPage {
  items: FundEvent[]
  nextCursor: string | null
  stale: boolean
  cachedAt: string | null
}

/** M3 概率型评分结果；未评分项目不得携带方向性字段。 */
export interface FundSignal {
  forecastId: string
  asOfDate: string
  scoreStatus: 'SCORED' | 'DATA_INSUFFICIENT' | 'NOT_APPLICABLE' | 'MODEL_REJECTED'
  direction: 'UP' | 'DOWN' | 'NEUTRAL' | null
  directionalProbability: number | string | null
  confidence: number | string | null
  riskLevel: string | null
  maxDrawdownEstimate: number | string | null
  explanation: string
  modelVersion: string
  featureVersion: string
  featureCompleteness: number | string
  scoredAt: string
}

/** 支持游标翻页的评分结果响应。 */
export interface FundSignalPage {
  items: FundSignal[]
  nextCursor: string | null
  stale: boolean
  cachedAt: string | null
}
