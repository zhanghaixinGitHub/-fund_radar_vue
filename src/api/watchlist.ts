import { get, post, remove } from '@/api/http'
import type { FundShareHistory, WatchlistFundDetail } from '@/types/fund'
import type { WatchlistItem, WatchlistPage, WatchlistQuery } from '@/types/watchlist'
import type { WatchlistPrediction } from '@/types/prediction'
import type { DirectionExperiment } from '@/types/directionExperiment'

/** 查询当前登录用户已关注的分页基金列表；服务端按会话用户隔离数据。 */
export function getWatchlist(query: WatchlistQuery = {}): Promise<WatchlistPage> {
  const search = new URLSearchParams()
  if (query.fundType) {
    search.set('fundType', query.fundType)
  }
  if (query.page) {
    search.set('page', String(query.page))
  }
  if (query.pageSize) {
    search.set('pageSize', String(query.pageSize))
  }
  const queryString = search.toString()
  return get<WatchlistPage>(`/api/v1/watchlist${queryString ? `?${queryString}` : ''}`)
}

/** 将指定基金加入当前登录用户的关注列表；重复调用保持幂等。 */
export function addWatchlistItem(fundCode: string): Promise<WatchlistItem> {
  return post<WatchlistItem>('/api/v1/watchlist', { fundCode })
}

/** 从当前登录用户的关注列表中移除指定基金；不存在时也可安全调用。 */
export function removeWatchlistItem(fundCode: string): Promise<void> {
  return remove<void>(`/api/v1/watchlist/${encodeURIComponent(fundCode)}`)
}

/** 查询当前用户已关注基金的完整资料；授权和数据范围由 Java 服务端校验。 */
export function getWatchlistFundDetail(fundCode: string): Promise<WatchlistFundDetail> {
  return get<WatchlistFundDetail>(`/api/v1/watchlist/${encodeURIComponent(fundCode)}/detail`)
}

/** 仅本人关注详情调用；不请求Python，不传用户编号，不触发计算或训练。 */
export function getWatchlistPrediction(fundCode: string): Promise<WatchlistPrediction> {
  return get<WatchlistPrediction>(`/api/v1/watchlist/${encodeURIComponent(fundCode)}/prediction`)
}

/** 用已保存实验模型计算当前本地输入；不训练、不改变正式发布状态。 */
export function getDirectionExperiment(fundCode: string): Promise<DirectionExperiment> {
  return get<DirectionExperiment>(`/api/v1/watchlist/${encodeURIComponent(fundCode)}/prediction/experiment`)
}

/** 查询当前用户已关注基金的份额规模历史；服务端会再次校验本人关注关系。 */
export function getWatchlistFundShareHistory(
  fundCode: string,
  startDate: string,
  endDate: string,
): Promise<FundShareHistory> {
  const query = new URLSearchParams({ startDate, endDate })
  return get<FundShareHistory>(`/api/v1/watchlist/${encodeURIComponent(fundCode)}/share-history?${query.toString()}`)
}
