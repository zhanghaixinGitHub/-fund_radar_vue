import { get, post, put } from '@/api/http'
import type { CurrentUser } from '@/types/auth'

/** 用已注册手机号和密码登录；未知手机号由服务端统一返回认证失败。 */
export function login(mobile: string, password: string): Promise<CurrentUser> {
  return post<CurrentUser>('/api/v1/auth/login', { mobile, password })
}

/** 显式注册默认基金用户；姓名只用于账户展示，注册成功后服务端立即建立安全会话。 */
export function register(mobile: string, password: string, displayName: string): Promise<CurrentUser> {
  return post<CurrentUser>('/api/v1/auth/register', { mobile, password, displayName })
}

/** 恢复由 HttpOnly 会话 Cookie 标识的当前登录用户。 */
export function getCurrentUser(): Promise<CurrentUser> {
  return get<CurrentUser>('/api/v1/auth/me')
}

/** 更新当前会话账户的姓名；手机号和角色始终由服务端按既有安全边界管理。 */
export function updateCurrentProfile(displayName: string): Promise<CurrentUser> {
  return put<CurrentUser>('/api/v1/auth/me/profile', { displayName })
}

/** 撤销当前服务端会话，并由服务端清理浏览器 Cookie。 */
export function logout(): Promise<void> {
  return post<void>('/api/v1/auth/logout')
}
