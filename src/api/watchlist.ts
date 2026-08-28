import { get, post, remove } from '@/api/http'
import type { WatchlistItem, WatchlistPage, WatchlistQuery } from '@/types/watchlist'

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
