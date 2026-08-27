import { get, post, remove } from '@/api/http'
import type { WatchlistItem } from '@/types/watchlist'

/** 查询当前登录用户已关注的基金列表；服务端按会话用户隔离数据。 */
export function getWatchlist(): Promise<WatchlistItem[]> {
  return get<WatchlistItem[]>('/api/v1/watchlist')
}

/** 将指定基金加入当前登录用户的关注列表；重复调用保持幂等。 */
export function addWatchlistItem(fundCode: string): Promise<WatchlistItem> {
  return post<WatchlistItem>('/api/v1/watchlist', { fundCode })
}

/** 从当前登录用户的关注列表中移除指定基金；不存在时也可安全调用。 */
export function removeWatchlistItem(fundCode: string): Promise<void> {
  return remove<void>(`/api/v1/watchlist/${encodeURIComponent(fundCode)}`)
}
