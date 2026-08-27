import type { AccountRole } from '@/types/auth'

/** 后台用户列表中的单个脱敏账户摘要。 */
export interface AdminUser {
  userId: string
  mobileMasked: string
  displayName: string
  status: 'ACTIVE' | 'DISABLED'
  role: AccountRole
  watchlistCount: number
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
