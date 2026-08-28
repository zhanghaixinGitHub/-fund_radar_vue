import { defineStore } from 'pinia'

import { getCurrentUser, login, logout, register, updateCurrentProfile } from '@/api/auth'
import { ApiRequestError } from '@/api/http'
import type { CurrentUser, PermissionCode } from '@/types/auth'

/** 浏览器会话状态；不保存密码、原始手机号或会话 Cookie。 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as CurrentUser | null,
    initialized: false,
    loading: false,
    errorMessage: '',
  }),
  getters: {
    isAuthenticated: (state) => state.user !== null,
  },
  actions: {
    /** 页面刷新后向 Java 服务恢复会话，401 仅表示尚未登录而不是系统错误。 */
    async restoreSession(): Promise<void> {
      if (this.initialized || this.loading) {
        return
      }
      this.loading = true
      this.errorMessage = ''
      try {
        this.user = await getCurrentUser()
      } catch (error) {
        this.user = null
        if (!(error instanceof ApiRequestError && error.status === 401)) {
          this.errorMessage = error instanceof Error ? error.message : '无法确认登录状态。'
        }
      } finally {
        this.initialized = true
        this.loading = false
      }
    },

    /** 登录成功后替换内存中的公开账户资料；登录不会创建新账户。 */
    async signIn(mobile: string, password: string): Promise<void> {
      this.loading = true
      this.errorMessage = ''
      try {
        this.user = await login(mobile, password)
        this.initialized = true
      } catch (error) {
        this.user = null
        this.errorMessage = error instanceof Error ? error.message : '登录暂时不可用。'
        throw error
      } finally {
        this.loading = false
      }
    },

    /** 注册成功后替换内存中的公开账户资料；角色仅由服务端固定为基金用户。 */
    async signUp(mobile: string, password: string, displayName: string): Promise<void> {
      this.loading = true
      this.errorMessage = ''
      try {
        this.user = await register(mobile, password, displayName)
        this.initialized = true
      } catch (error) {
        this.user = null
        this.errorMessage = error instanceof Error ? error.message : '注册暂时不可用。'
        throw error
      } finally {
        this.loading = false
      }
    },

    /** 仅更新当前账户公开姓名；手机号、角色和权限不允许由浏览器自行修改。 */
    async updateProfile(displayName: string): Promise<void> {
      if (!this.user) {
        throw new ApiRequestError('请先登录后再修改个人信息。', 401, 'AUTHENTICATION_REQUIRED')
      }
      this.loading = true
      this.errorMessage = ''
      try {
        this.user = await updateCurrentProfile(displayName)
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : '个人信息暂时无法更新。'
        throw error
      } finally {
        this.loading = false
      }
    },

    /** 尽力撤销服务端会话；无论网络结果如何都清理浏览器内存中的身份资料。 */
    async signOut(): Promise<void> {
      try {
        await logout()
      } finally {
        this.user = null
        this.initialized = true
        this.errorMessage = ''
      }
    },

    /** 判断当前会话是否包含某项后端已授予的权限，仅用于导航和页面体验。 */
    hasPermission(permission: PermissionCode): boolean {
      return this.user?.permissions.includes(permission) ?? false
    },
  },
})
