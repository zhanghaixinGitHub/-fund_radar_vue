import { get, post } from '@/api/http'
import type { NotificationFeedPage, NotificationItem, NotificationPage } from '@/types/notification'

export function getNotificationFeed(category: string, fund: string, unread: boolean, page: number, pageSize: number): Promise<NotificationFeedPage> {
  const search = new URLSearchParams({ category, unread: String(unread), page: String(page), pageSize: String(pageSize) })
  if (fund) search.set('fund', fund)
  return get<NotificationFeedPage>(`/api/v1/notifications/feed?${search}`)
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
