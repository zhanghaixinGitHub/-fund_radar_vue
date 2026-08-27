/** 当前本机用户关注列表中的一条基金记录；名称在详情页读取，避免列表页逐条请求。 */
export interface WatchlistItem {
  fundCode: string
  createdAt: string
}
