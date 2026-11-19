import { get, post } from '@/api/http'
import type { NotificationFeedPage, NotificationMatrixPage, NotificationItem, NotificationPage } from '@/types/notification'

export function getNotificationFeed(category: string, fund: string, unread: boolean, page: number, pageSize: number, sentOrder = false, todayOnly = false): Promise<NotificationFeedPage> {
  const search = new URLSearchParams({ category, unread: String(unread), page: String(page), pageSize: String(pageSize) })
  if (sentOrder) search.set('sentOrder', 'true')
  if (todayOnly) search.set('todayOnly', 'true')
  if (fund) search.set('fund', fund)
  return get<NotificationFeedPage>(`/api/v1/notifications/feed?${search}`)
}

export function getNotificationMatrix(category: string, fund: string, unread: boolean, page: number, pageSize: number): Promise<NotificationMatrixPage> {
  const search = new URLSearchParams({ category, unread: String(unread), page: String(page), pageSize: String(pageSize) })
  if (fund) search.set('fund', fund)
  return get<NotificationMatrixPage>(`/api/v1/notifications/matrix?${search}`)
}

/** 分页读取当前登录用户的站内提醒，不包含其他用户或外部消息通道。 */
export function getNotifications(page = 1, pageSize = 20): Promise<NotificationPage> {
  const search = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  return get<NotificationPage>(`/api/v1/notifications?${search.toString()}`)
}

/** 幂等标记本人通知为已读；越权项由服务端按不存在处理。 */
export function markNotificationRead(notificationId: string): Promise<NotificationItem> {
  return post<NotificationItem>(`/api/v1/notifications/${encodeURIComponent(notificationId)}/read`)
}

/** 只确认用户实际打开的提醒版本。 */
export function markReviewNoticeRead(id: string, revision: number): Promise<{ revision: number; read: boolean }> {
  return post(`/api/v1/notifications/reviews/${encodeURIComponent(id)}/read`, { revision })
}
