import type { AccountRole } from '@/types/auth'

/** 后台用户列表中的单个脱敏账户摘要。 */
export interface AdminUser {
  userId: string
  mobileMasked: string
  displayName: string
  status: 'ACTIVE' | 'DISABLED'
  role: AccountRole
  watchlistCount: number
  trialCreditTotal: number
  trialCreditLocked: number
  trialCreditAvailable: number
  createdAt: string
  legacyRecord: boolean
}

/** 管理员用户分页响应。 */
export interface AdminUserPage {
  items: AdminUser[]
  total: number
  page: number
  pageSize: number
}

/** 试用关注积分流水类型；由 Java 服务端生成，浏览器仅负责中文展示。 */
export type WatchlistCreditLedgerEntryType =
  | 'ADMIN_GRANT'
  | 'MIGRATION_GRANT'
  | 'WATCHLIST_CREDIT_LOCKED'
  | 'WATCHLIST_CREDIT_RELEASED'

/** 管理员按需查看的单条积分流水，不含手机号、用户 ID 或基金代码。 */
export interface WatchlistCreditLedgerEntry {
  entryType: WatchlistCreditLedgerEntryType
  creditDelta: number
  reason: string
  actorDisplayName: string
  createdAt: string
}

/** 管理员积分流水分页响应。 */
export interface WatchlistCreditLedgerPage {
  items: WatchlistCreditLedgerEntry[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}
