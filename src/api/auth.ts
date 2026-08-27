import { get, post } from '@/api/http'
import type { CurrentUser } from '@/types/auth'

/** 用已注册手机号和密码登录；未知手机号由服务端统一返回认证失败。 */
export function login(mobile: string, password: string): Promise<CurrentUser> {
  return post<CurrentUser>('/api/v1/auth/login', { mobile, password })
}

/** 显式注册默认基金用户；注册成功后服务端立即建立安全会话。 */
export function register(mobile: string, password: string): Promise<CurrentUser> {
  return post<CurrentUser>('/api/v1/auth/register', { mobile, password })
}

/** 恢复由 HttpOnly 会话 Cookie 标识的当前登录用户。 */
export function getCurrentUser(): Promise<CurrentUser> {
  return get<CurrentUser>('/api/v1/auth/me')
}

/** 撤销当前服务端会话，并由服务端清理浏览器 Cookie。 */
export function logout(): Promise<void> {
  return post<void>('/api/v1/auth/logout')
}
