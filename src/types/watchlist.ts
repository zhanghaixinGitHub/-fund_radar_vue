import type { FundType } from '@/types/fund'

/** 服务端计算的当前用户关注额度；试用积分仅扩容并发关注名额，不是现金余额。 */
export interface WatchlistQuota {
  freeWatchlistLimit: number
  activeWatchlistCount: number
  trialCreditTotal: number
  trialCreditLocked: number
  trialCreditAvailable: number
  maxActiveWatchlistCount: number
}

/** 当前登录用户关注列表中已聚合基金行情摘要的一条记录。 */
export interface WatchlistItem {
  fundCode: string
  fundName: string
  fundType: FundType
  asOfDate: string | null
  dayChangeRate: number | string | null
  weekChangeRate: number | string | null
  monthChangeRate: number | string | null
  createdAt: string
}

/** 当前登录用户关注列表的页码查询参数。 */
export interface WatchlistQuery {
  fundType?: FundType
  page?: number
  pageSize?: number
}

/** 服务端按当前用户隔离的关注列表分页响应。 */
export interface WatchlistPage {
  items: WatchlistItem[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  /** 行情服务不可用时仍返回关注记录，但基金行情字段可能暂缺。 */
  marketDataUnavailable: boolean
  /** 当前登录用户的免费额度与试用关注积分状态。 */
  quota: WatchlistQuota
}
