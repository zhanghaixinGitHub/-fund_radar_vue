/** 评分触发的站内提醒载荷；其字段来自 Java 已固化的通知 JSON，不包含交易或账户信息。 */
export interface NotificationPayload {
  fundCode?: string
  asOfDate?: string
  ruleType?: string
  direction?: string
  riskLevel?: string
  confidence?: number | string
  explanation?: string
  scoredAt?: string
  notice?: string
}

/** 当前用户的一条站内提醒；服务端始终按本人数据范围返回。 */
export interface NotificationItem {
  notificationId: string
  fundCode: string
  ruleType: 'RISK_LEVEL' | 'SIGNAL_CHANGE' | 'EVENT'
  triggerType: string
  triggerRef: string
  status: 'UNREAD' | 'READ'
  payload: NotificationPayload
  createdAt: string
  readAt: string | null
}

/** 当前用户通知的页码响应。 */
export interface NotificationPage {
  items: NotificationItem[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}
