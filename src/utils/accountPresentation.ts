import type { AccountRole } from '@/types/auth'

/** 账户展示所需的最小公开字段；不包含原始手机号、密码或会话凭据。 */
interface AccountIdentity {
  displayName: string
  mobileMasked: string
  role: AccountRole
}

/** 对外中文角色名；内部枚举保持与 Java 服务端一致。 */
export const ACCOUNT_ROLE_OPTIONS: ReadonlyArray<{ value: AccountRole, label: string }> = [
  { value: 'FUND_USER', label: '基金用户' },
  { value: 'DATA_OPERATOR', label: '数据运营' },
  { value: 'SYSTEM_ADMIN', label: '管理员' },
]

/** 返回当前角色的中文业务名，未知角色保留原值以避免静默误导。 */
export function accountRoleLabel(role: AccountRole): string {
  return ACCOUNT_ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role
}

/**
 * 以“角色：姓名”组合账户展示，避免把“系统管理员”这一账户姓名与“管理员”这一角色混为一谈。
 * 历史自动生成的“基金用户+脱敏手机号”没有独立姓名，展示时仅保留手机号后缀作为兼容回退。
 */
export function accountDisplayLabel(account: AccountIdentity | null | undefined): string {
  if (!account) {
    return ''
  }
  const displayName = account.displayName === `基金用户${account.mobileMasked}`
    ? account.mobileMasked
    : account.displayName
  return `${accountRoleLabel(account.role)}：${displayName}`
}
