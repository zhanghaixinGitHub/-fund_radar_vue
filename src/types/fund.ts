/** Java 核心服务使用的稳定基金类型枚举。 */
export type FundType = 'BOND' | 'STOCK' | 'MIXED' | 'INDEX' | 'MONEY' | 'QDII' | 'FOF' | 'OTHER'

/** Java 核心服务返回的基金列表项契约。 */
export interface FundSummary {
  fundCode: string
  fundName: string
  fundType: FundType
  status: string
  asOfDate: string | null
  /** 以最近同步净值为锚点计算的上一交易日涨跌率。 */
  dayChangeRate: number | string | null
  /** 以最近同步净值为锚点计算的近一周涨跌率。 */
  weekChangeRate: number | string | null
  /** 以最近同步净值为锚点计算的近一月涨跌率。 */
  monthChangeRate: number | string | null
  /** 当前登录用户是否已关注；仅由服务端按会话用户计算。 */
  isWatched: boolean
}

/** 基金公开详情；`M0_MOCK` 仅用于演示，界面不得将其描述为真实行情。 */
export interface FundDetail extends FundSummary {
  /** 最新已落库的单位净值；缺失不补零，也不代表实时行情。 */
  unitNav: number | string | null
  /** 最新已落库的累计净值；数据源未提供时明确为空。 */
  accumulatedNav: number | string | null
  navStatus: string
  dataSource: string
  stale: boolean
  cachedAt: string | null
}

/** 一条已同步的历史日净值；不等同于盘中估值或未来收益。 */
export interface FundNavPoint {
  navDate: string
  unitNav: number | string
  accumulatedNav: number | string | null
}

/** Java 对外返回的指定日期窗口历史净值。 */
export interface FundNavHistory {
  items: FundNavPoint[]
  stale: boolean
  cachedAt: string | null
}

/** 基金列表响应；页码模式返回总数，游标模式仅为兼容已发布调用方保留。 */
export interface FundPage {
  items: FundSummary[]
  nextCursor: string | null
  page: number | null
  pageSize: number
  totalCount: number
  totalPages: number
  stale: boolean
  cachedAt: string | null
}

/** 基金列表查询参数；`page` 与 `cursor` 不能同时传入。 */
export interface FundListQuery {
  keyword?: string
  fundType?: FundType
  pageSize?: number
  cursor?: string
  page?: number
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
