import { get, post, put } from '@/api/http'
import type { AccountRole } from '@/types/auth'
import type { AdminUser, AdminUserPage, WatchlistCreditLedgerPage } from '@/types/adminUser'
import type { SimOverview } from '@/types/simulation'
import type { WatchlistQuota } from '@/types/watchlist'

/** 分页读取脱敏用户账户及关注数；仅管理员可用。keyword 由服务端按姓名或完整手机号匹配，浏览器不接触原始手机号。 */
export function getAdminUsers(page = 0, pageSize = 20, keyword?: string): Promise<AdminUserPage> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  const trimmed = keyword?.trim()
  if (trimmed) params.set('keyword', trimmed)
  return get<AdminUserPage>(`/api/v1/admin/users?${params.toString()}`)
}

/** 按用户标识读取单个脱敏账户；用于积分流水和模拟持仓页的直接跳转或刷新恢复。 */
export function getAdminUser(userId: string): Promise<AdminUser> {
  return get<AdminUser>(`/api/v1/admin/users/${encodeURIComponent(userId)}`)
}

/** 调整指定用户角色；服务端会撤销其会话，令新权限下次登录生效。 */
export function updateAdminUserRole(userId: string, role: AccountRole): Promise<void> {
  return put<void>(`/api/v1/admin/users/${encodeURIComponent(userId)}/role`, { role })
}

/** 启用或停用指定用户；停用会立即撤销服务端会话。 */
export function updateAdminUserStatus(userId: string, status: 'ACTIVE' | 'DISABLED'): Promise<void> {
  return put<void>(`/api/v1/admin/users/${encodeURIComponent(userId)}/status`, { status })
}

/** 由管理员人工重置指定用户密码；密码不保存在浏览器状态中。 */
export function resetAdminUserPassword(userId: string, newPassword: string): Promise<void> {
  return post<void>(`/api/v1/admin/users/${encodeURIComponent(userId)}/reset-password`, { newPassword })
}

/** 仅系统管理员可向启用账户发放试用关注积分；积分不支持充值、支付或转赠。 */
export function grantAdminUserWatchlistCredits(
  userId: string,
  amount: number,
  reason: string,
): Promise<WatchlistQuota> {
  return post<WatchlistQuota>(`/api/v1/admin/users/${encodeURIComponent(userId)}/watchlist-credits`, { amount, reason })
}

/** 仅系统管理员可按时间倒序读取指定账户的积分流水；响应不包含完整手机号或内部标识。 */
export function getAdminUserWatchlistCreditLedger(
  userId: string,
  page = 0,
  pageSize = 20,
): Promise<WatchlistCreditLedgerPage> {
  return get<WatchlistCreditLedgerPage>(
    `/api/v1/admin/users/${encodeURIComponent(userId)}/watchlist-credit-ledger?page=${page}&pageSize=${pageSize}`,
  )
}

/** 在二次确认后迁移历史本机关注，接口不会迁移提醒或持仓。 */
export function transferLegacyWatchlist(targetUserId: string): Promise<{ transferredCount: number }> {
  return post<{ transferredCount: number }>('/api/v1/admin/legacy-watchlist/transfer', {
    targetUserId,
    confirmed: true,
  })
}

/** 受控读取指定用户的当前模拟账本持仓；仅管理员可用，响应结构与自助模拟持仓接口一致。 */
export function getAdminUserSimPortfolio(userId: string): Promise<SimOverview> {
  return get<SimOverview>(`/api/v1/admin/users/${encodeURIComponent(userId)}/sim-portfolio/current`)
}
