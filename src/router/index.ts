import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import type { PermissionCode } from '@/types/auth'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    guestOnly?: boolean
    permissions?: PermissionCode[]
    appArea?: 'user' | 'admin'
  }
}

/** 所有基金与个人数据路由均由守卫要求已登录会话；后台路由额外需要服务端返回的权限。 */
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: { name: 'fund-market' } },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginPage.vue'),
      meta: { title: '登录', requiresAuth: false, guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterPage.vue'),
      meta: { title: '注册', requiresAuth: false, guestOnly: true },
    },
    {
      path: '/funds',
      name: 'fund-market',
      component: () => import('@/views/FundMarketPage.vue'),
      meta: { title: '基金市场', appArea: 'user' },
    },
    {
      path: '/funds/:fundCode',
      name: 'fund-detail',
      component: () => import('@/views/FundDetailPage.vue'),
      meta: { title: '基金详情', appArea: 'user' },
    },
    {
      path: '/watchlist',
      name: 'watchlist',
      component: () => import('@/views/WatchlistPage.vue'),
      meta: { title: '我的关注', appArea: 'user', permissions: ['WATCHLIST_SELF_READ'] },
    },
    {
      path: '/portfolio',
      name: 'portfolio-snapshot',
      component: () => import('@/views/PortfolioSnapshotPage.vue'),
      meta: { title: '我的持仓', appArea: 'user', permissions: ['PORTFOLIO_SELF_READ'] },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfilePage.vue'),
      meta: { title: '个人信息', appArea: 'user' },
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: () => import('@/views/AdminDashboardPage.vue'),
      meta: { title: '后台工作台', appArea: 'admin', permissions: ['ADMIN_DASHBOARD_VIEW'] },
    },
    {
      path: '/admin/sync',
      name: 'admin-sync-center',
      component: () => import('@/views/SyncCenterPage.vue'),
      meta: { title: '数据同步中心', appArea: 'admin', permissions: ['SYNC_JOB_READ'] },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/views/AdminUsersPage.vue'),
      meta: { title: '用户管理', appArea: 'admin', permissions: ['USER_ACCOUNT_READ'] },
    },
    {
      path: '/admin/system-health',
      name: 'admin-system-health',
      component: () => import('@/views/SystemHealthPage.vue'),
      meta: { title: '运行状态', appArea: 'admin', permissions: ['SYSTEM_HEALTH_READ'] },
    },
    {
      path: '/not-authorized',
      name: 'not-authorized',
      component: () => import('@/views/NotAuthorizedPage.vue'),
      meta: { title: '访问受限' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundPage.vue'),
      meta: { title: '页面不存在', requiresAuth: false },
    },
  ],
})

/** 前端守卫只用于用户体验；每个业务接口仍由 Java 服务端完成认证、授权与数据范围隔离。 */
router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  await authStore.restoreSession()

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    const redirect = typeof to.query.redirect === 'string' && to.query.redirect.startsWith('/')
      ? to.query.redirect
      : '/funds'
    return redirect
  }

  if (to.meta.requiresAuth === false) {
    return true
  }
  if (!authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.permissions?.some((permission) => !authStore.hasPermission(permission))) {
    return { name: 'not-authorized' }
  }
  return true
})

/** 根据当前页面的路由元数据更新浏览器标题。 */
router.afterEach((to) => {
  document.title = `${String(to.meta.title ?? '基金雷达')} · 基金雷达`
})
