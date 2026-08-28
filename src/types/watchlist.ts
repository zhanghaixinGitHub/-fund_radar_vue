import type { FundType } from '@/types/fund'

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
}
