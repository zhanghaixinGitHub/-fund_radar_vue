import { get, post, put } from '@/api/http'
import type { AccountRole } from '@/types/auth'
import type { AdminUserPage } from '@/types/adminUser'
import type { PortfolioSnapshot } from '@/types/portfolio'

/** 分页读取脱敏用户账户及关注数；仅管理员可用。 */
export function getAdminUsers(page = 0, pageSize = 20): Promise<AdminUserPage> {
  return get<AdminUserPage>(`/api/v1/admin/users?page=${page}&pageSize=${pageSize}`)
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

/** 在二次确认后迁移历史本机关注，接口不会迁移提醒或持仓。 */
export function transferLegacyWatchlist(targetUserId: string): Promise<{ transferredCount: number }> {
  return post<{ transferredCount: number }>('/api/v1/admin/legacy-watchlist/transfer', {
    targetUserId,
    confirmed: true,
  })
}

/** 受控读取指定用户的已确认持仓快照；仅管理员可用。 */
export function getAdminUserPortfolio(userId: string): Promise<PortfolioSnapshot> {
  return get<PortfolioSnapshot>(`/api/v1/admin/users/${encodeURIComponent(userId)}/portfolio/current`)
}
