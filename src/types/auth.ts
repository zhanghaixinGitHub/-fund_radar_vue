/** 与 Java 服务端角色枚举一致；用户不能在浏览器侧自行授予或修改。 */
export type AccountRole = 'FUND_USER' | 'DATA_OPERATOR' | 'SYSTEM_ADMIN'

/** 后端返回给浏览器的权限编码；真正鉴权仍由 Java 接口执行。 */
export type PermissionCode =
  | 'FUND_READ'
  | 'WATCHLIST_SELF_READ'
  | 'WATCHLIST_SELF_WRITE'
  | 'ALERT_RULE_SELF_READ'
  | 'ALERT_RULE_SELF_WRITE'
  | 'NOTIFICATION_SELF_READ'
  | 'NOTIFICATION_SELF_WRITE'
  | 'PORTFOLIO_SELF_READ'
  | 'ADMIN_DASHBOARD_VIEW'
  | 'SYSTEM_HEALTH_READ'
  | 'SYNC_JOB_READ'
  | 'SYNC_JOB_START'
  | 'USER_ACCOUNT_READ'
  | 'USER_ACCOUNT_MANAGE'
  | 'LEGACY_WATCHLIST_TRANSFER'
  | 'PORTFOLIO_USER_READ'

/** 登录成功或刷新会话后返回的非敏感账户资料。 */
export interface CurrentUser {
  userId: string
  mobileMasked: string
  displayName: string
  role: AccountRole
  permissions: PermissionCode[]
}
