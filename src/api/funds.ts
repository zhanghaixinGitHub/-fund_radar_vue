import { get } from '@/api/http'
import type {
  FundDetail,
  FundEventPage,
  FundListQuery,
  FundNavHistory,
  FundPage,
  FundSameTypeComparison,
  FundSignalPage,
} from '@/types/fund'

/**
 * 查询 Java 对外发布的基金分页数据。
 * 浏览器不得直接调用 FastAPI 内部服务。
 */
export function getFunds(query: FundListQuery = {}): Promise<FundPage> {
  const search = new URLSearchParams()
  if (query.keyword) {
    search.set('keyword', query.keyword)
  }
  if (query.fundType) {
    search.set('fundType', query.fundType)
  }
  if (query.pageSize) {
    search.set('pageSize', String(query.pageSize))
  }
  if (query.cursor) {
    search.set('cursor', query.cursor)
  }
  if (query.page) {
    search.set('page', String(query.page))
  }
  const queryString = search.toString()
  return get<FundPage>(`/api/v1/funds${queryString ? `?${queryString}` : ''}`)
}

/** 通过 Java 核心服务查询单只基金的公开详情。 */
export function getFundDetail(fundCode: string): Promise<FundDetail> {
  return get<FundDetail>(`/api/v1/funds/${encodeURIComponent(fundCode)}`)
}

/** 查询已落库的历史净值窗口，不在浏览器直接访问 Tushare 或 Python 服务。 */
export function getFundNavHistory(
  fundCode: string,
  startDate: string,
  endDate: string,
): Promise<FundNavHistory> {
  const query = new URLSearchParams({ startDate, endDate })
  return get<FundNavHistory>(`/api/v1/funds/${encodeURIComponent(fundCode)}/nav-history?${query.toString()}`)
}

/** 查询当前基金市场受控样本内的同类型比较，不表示全市场排名。 */
export function getFundSameTypeComparison(fundCode: string): Promise<FundSameTypeComparison> {
  return get<FundSameTypeComparison>(`/api/v1/funds/${encodeURIComponent(fundCode)}/same-type-comparison`)
}

/** 通过 Java 核心服务查询可追溯来源的关联事件摘要。 */
export function getFundEvents(fundCode: string): Promise<FundEventPage> {
  return get<FundEventPage>(`/api/v1/funds/${encodeURIComponent(fundCode)}/events`)
}

/** 查询已落库的 M3 评分结果，不触发任何模型执行。 */
export function getFundSignals(fundCode: string): Promise<FundSignalPage> {
  return get<FundSignalPage>(`/api/v1/funds/${encodeURIComponent(fundCode)}/signals`)
}
