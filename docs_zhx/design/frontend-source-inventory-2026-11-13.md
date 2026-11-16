# 前端源码功能索引（2026-11-13）

本索引补充功能保全清单。按源码提取，动态表达式原样保留；组件存在不代表已挂载，接口存在不代表有可见入口。此记录不含密钥与业务数据。

## 路由与权限

```ts
import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import type { AccountRole, PermissionCode } from '@/types/auth'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    guestOnly?: boolean
    permissions?: PermissionCode[]
    roles?: AccountRole[]
    appArea?: 'user' | 'admin'
  }
}

/** 所有基金与个人数据路由均由守卫要求已登录会话；后台路由额外需要服务端返回的权限。 */
export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.fullPath === from.fullPath) return false
    return { top: 0 }
  },
  routes: [
    { path: '/', redirect: { name: 'fund-market' } },
    {
      path: '/fund-managers', name: 'fund-managers',
      component: () => import('@/views/FundManagersPage.vue'),
      meta: { title: '基金经理', appArea: 'user', permissions: ['FUND_READ'] },
    },
    {
      path: '/fund-managers/:managerId', name: 'fund-manager-detail',
      component: () => import('@/views/FundManagerDetailPage.vue'),
      meta: { title: '经理详情', appArea: 'user', permissions: ['FUND_READ'] },
    },
    {
      path: '/fund-managers/:managerId/funds/:relatedFundId', name: 'manager-related-fund',
      component: () => import('@/views/ManagerRelatedFundPage.vue'),
      meta: { title: '关联基金资料', appArea: 'user', permissions: ['FUND_READ'] },
    },
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
      path: '/watchlist/prediction-1d',
      name: 'direction-1d',
      component: () => import('@/views/Direction1dPage.vue'),
      meta: { title: '下一交易日实验', appArea: 'user', permissions: ['FUND_READ', 'WATCHLIST_SELF_READ'] },
    },
    {
      path: '/watchlist/:fundCode',
      name: 'watchlist-fund-detail',
      component: () => import('@/views/WatchlistFundDetailPage.vue'),
      meta: { title: '完整关注资料', appArea: 'user', permissions: ['FUND_READ', 'WATCHLIST_SELF_READ'] },
    },
    {
      path: '/portfolio',
      name: 'portfolio-snapshot',
      component: () => import('@/views/SimulatedPortfolioPage.vue'),
      meta: { title: '我的持仓', appArea: 'user', permissions: ['PORTFOLIO_SELF_READ'] },
    },
    {
      path: '/portfolio/earnings',
      name: 'portfolio-earnings',
      component: () => import('@/views/SimulationEarningsPage.vue'),
      meta: { title: '收益明细', appArea: 'user', permissions: ['PORTFOLIO_SELF_READ'] },
    },
    {
      path: '/portfolio/advice',
      name: 'portfolio-advice',
      component: () => import('@/views/PortfolioAdvicePage.vue'),
      meta: { title: '持仓分析', appArea: 'user', permissions: ['PORTFOLIO_SELF_READ'] },
    },
    // 旧的单基金建议地址保留并转发到新地址，外部书签与历史消息中的链接不失效。
    {
      path: '/portfolio/:fundCode/advice',
      name: 'portfolio-advice-legacy',
      redirect: (to) => ({ name: 'portfolio-advice', query: { ...to.query, fund: to.params.fundCode } }),
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('@/views/NotificationsPage.vue'),
      meta: { title: '站内提醒', appArea: 'user', permissions: ['NOTIFICATION_SELF_READ'] },
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
      path: '/admin/sim-fee-rules',
      name: 'admin-sim-fee-rules',
      component: () => import('@/views/SimFeeRulesPage.vue'),
      meta: { title: '费率维护', appArea: 'admin', permissions: ['SIM_FEE_RULE_ADMIN'] },
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
  if (to.meta.roles && (!authStore.user || !to.meta.roles.includes(authStore.user.role))) {
    return { name: 'not-authorized' }
  }
  return true
})

/** 根据当前页面的路由元数据更新浏览器标题。 */
router.afterEach((to) => {
  document.title = `${String(to.meta.title ?? '基金雷达')} · 基金雷达`
})

```

## 页内栏目与返回规则

```ts
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { LocationQuery, RouteLocationRaw } from 'vue-router'

import { fundTypeOptions } from '@/utils/fundPresentation'
import { normalizeRatingFilter } from '@/utils/fundRating'
import { portfolioReturnPath } from '@/utils/advice'
import { managerReturnPath } from '@/utils/fundManagerNavigation'

export interface PageSection {
  key: string
  label: string
  group?: string
}

const pageSections: Record<string, PageSection[]> = {
  'fund-managers': [{ key: 'directory', label: '经理查找' }],
  'fund-manager-detail': [
    { key: 'funds', label: '在管基金' },
    { key: 'history', label: '历史任职' },
    { key: 'profile', label: '职业履历' },
    { key: 'performance', label: '任期表现' },
    { key: 'disclosures', label: '相关披露' },
  ],
  'manager-related-fund': [{ key: 'basic', label: '基础资料' }],
  'portfolio-advice': [
    { key: 'latest', label: '最新建议', group: '持仓分析' },
    { key: 'diagnosis', label: '诊断详情' },
    { key: 'rules', label: '规则草案' },
    { key: 'history', label: '历史记录' },
    { key: 'review', label: '效果回看' },
  ],
  'watchlist-fund-detail': [
    { key: 'basic', label: '基础资料', group: '关注资料' },
    { key: 'manager', label: '基金经理' },
    { key: 'nav', label: '净值走势' },
    { key: 'share', label: '份额规模' },
    { key: 'dividend', label: '分红记录' },
    { key: 'comparison', label: '同类对比' },
    { key: 'rating', label: '基金评级' },
    { key: 'holdings', label: '基金持仓', group: '投资与动态' },
    { key: 'company', label: '持仓公司经营' },
    { key: 'documents', label: '公告与动态' },
    { key: 'research', label: '走势预测', group: '预测与回看' },
    { key: 'prediction-history', label: '预测历史' },
    { key: 'rules', label: '我的提醒', group: '我的设置' },
  ],
  // 市场详情只展示基金资料；走势预测与历史记录统一从“我的关注”进入。
  'fund-detail': [
    { key: 'basic', label: '基础资料', group: '基金资料' },
    { key: 'manager', label: '基金经理' },
    { key: 'nav', label: '净值走势' },
    { key: 'share', label: '份额规模' },
    { key: 'dividend', label: '分红记录' },
    { key: 'comparison', label: '同类对比' },
    { key: 'rating', label: '基金评级' },
    { key: 'holdings', label: '基金持仓', group: '投资与动态' },
    { key: 'company', label: '持仓公司经营' },
    { key: 'documents', label: '公告与动态' },
  ],
  'portfolio-snapshot': [
    { key: 'overview', label: '总览' },
    { key: 'holdings', label: '持仓' },
    { key: 'orders', label: '交易记录' },
    { key: 'earnings', label: '收益明细' },
    { key: 'plans', label: '定投计划' },
    { key: 'funding', label: '本人资金安排' },
    { key: 'account-risk', label: '已录入持仓检查' },
    { key: 'options', label: '调整前的条件比较' },
  ],
  notifications: [
    { key: 'messages', label: '已触发提醒' },
    { key: 'rules', label: '提醒规则' },
  ],
  profile: [
    { key: 'overview', label: '基本信息' },
    { key: 'name', label: '修改姓名' },
  ],
  'admin-dashboard': [{ key: 'overview', label: '工作概览' }],
  'admin-sync-center': [
    { key: 'overview', label: '任务总览' },
    { key: 'marketNav', label: '净值增量同步', group: '任务分类' },
    { key: 'freeDataCompletion', label: '基金资料与市场数据更新' },
    { key: 'fundManagers', label: '基金经理资料更新' },
    { key: 'fundMaterials', label: '基金持仓与公司资料更新' },
    { key: 'fundRatings', label: '基金评级更新' },
    { key: 'fundNews', label: '近期基金公告核验' },
    { key: 'featureSnapshot', label: '历史指标计算' },
    { key: 'direction1dPrediction', label: '一日综合预测' },
    { key: 'simulationFees', label: '模拟费率同步' },
    { key: 'spxManual', label: '标普500手动同步' },
    { key: 'simRecurring', label: '定投手动执行' },
    { key: 'notes', label: '运行说明', group: '帮助' },
  ],
  'admin-users': [
    { key: 'accounts', label: '账户列表' },
    { key: 'credits', label: '关注积分' },
    { key: 'ledger', label: '积分流水' },
    { key: 'sim-portfolio', label: '持仓详情' },
    { key: 'migration', label: '历史关注迁移' },
  ],
}

const moduleNames: Record<string, string> = {
  'fund-managers': '基金经理', 'fund-manager-detail': '基金经理', 'manager-related-fund': '基金经理',
  'fund-market': '基金市场', 'fund-detail': '基金市场',
  watchlist: '我的关注', 'watchlist-fund-detail': '我的关注',
  'portfolio-snapshot': '我的持仓', notifications: '站内提醒', profile: '个人信息',
  'portfolio-earnings': '我的持仓',
  'portfolio-advice': '持仓分析',
  'admin-dashboard': '工作台', 'admin-sync-center': '数据同步', 'admin-users': '用户管理',
  'admin-sim-fee-rules': '费率维护',
}

/** 返回链接指向的模块名称；持仓分析从持仓卡片进入，返回到「我的持仓」。 */
const returnLabels: Record<string, string> = {
  'fund-manager-detail': '上一页', 'manager-related-fund': '经理详情',
  'portfolio-advice': '我的持仓',
  'watchlist-fund-detail': '我的关注',
  'fund-detail': '基金市场',
}

/** 返回路径只接受本模块的列表地址及已知筛选字段，不能成为站外跳转入口。 */
export function listReturnTarget(value: unknown, listPath: '/funds' | '/watchlist'): RouteLocationRaw {
  if (typeof value !== 'string' || value.split('?')[0] !== listPath) return listPath
  const query: Record<string, string> = {}
  const separator = value.indexOf('?')
  const params = new URLSearchParams(separator < 0 ? '' : value.slice(separator + 1))
  for (const key of ['type', 'keyword', 'page', 'size']) {
    const item = params.get(key)
    if (item) query[key] = item
  }
  const rating = listPath === '/funds' ? normalizeRatingFilter(params.get('rating')) : ''
  if (rating) query.rating = rating
  return { path: listPath, query }
}

/** 顶栏、左侧导航和页面共用子页顺序；未指定子页、未知参数及已移除的概览链接均回落到首项。 */
export function usePageNavigation() {
  const route = useRoute()
  const routeName = computed(() => String(route.name ?? ''))
  const isList = computed(() => ['fund-market', 'watchlist'].includes(routeName.value))
  const sections = computed<PageSection[]>(() => isList.value
    ? [{ key: 'all', label: routeName.value === 'watchlist' ? '全部关注' : '全部基金' },
      ...fundTypeOptions.map((type, index) => ({ key: type.value, label: type.label, group: index === 0 ? '按基金类型' : undefined }))]
    : pageSections[routeName.value === 'portfolio-earnings' ? 'portfolio-snapshot' : routeName.value] ?? [])
  const section = computed(() => {
    if (routeName.value === 'portfolio-earnings') return 'earnings'
    const rawCandidate = isList.value ? route.query.type : route.query.section
    // 兼容旧公告链接，改为共用资料页；旧提醒链接在关注入口保留。
    const candidate = rawCandidate === 'events' ? 'documents' : rawCandidate
    // 兼容旧的单基金持仓链接；普通模块入口默认进入总览。
    if (routeName.value === 'portfolio-snapshot' && candidate == null
      && /^\d{6}$/.test(String(route.query.fundCode ?? ''))) return 'holdings'
    return sections.value.find((item) => item.key === candidate)?.key ?? sections.value[0]?.key ?? ''
  })
  const sectionLabel = computed(() => sections.value.find((item) => item.key === section.value)?.label ?? '')
  const moduleLabel = computed(() => moduleNames[routeName.value] ?? String(route.meta.title ?? '基金雷达'))
  const returnTarget = computed(() => {
    if (routeName.value === 'fund-manager-detail') return managerReturnPath(route.query.from)
    if (routeName.value === 'manager-related-fund') return managerReturnPath(route.query.from, `/fund-managers/${route.params.managerId}`)
    if (routeName.value === 'fund-detail' && typeof route.query.from === 'string'
      && route.query.from.startsWith('/fund-managers')) return managerReturnPath(route.query.from)
    // 收益明细属于“我的持仓”的同级菜单，通过子菜单切换，不重复显示模块返回入口。
    if (routeName.value === 'portfolio-earnings') return null
    // 从顶栏直接进入持仓分析时没有来源页，不显示返回链接。
    if (routeName.value === 'portfolio-advice') {
      return typeof route.query.from === 'string' ? portfolioReturnPath(route.query.from) : null
    }
    if (routeName.value === 'watchlist-fund-detail') return listReturnTarget(route.query.from, '/watchlist')
    if (routeName.value === 'fund-detail') return listReturnTarget(route.query.from, '/funds')
    return null
  })
  const returnLabel = computed(() => returnLabels[routeName.value] ?? moduleLabel.value)
  function sectionTarget(key: string): RouteLocationRaw {
    if (['portfolio-snapshot', 'portfolio-earnings'].includes(routeName.value) && key === 'earnings') return { name: 'portfolio-earnings' }
    if (routeName.value === 'portfolio-earnings') return { name: 'portfolio-snapshot', query: { section: key } }
    const query: LocationQuery = { ...route.query }
    if (isList.value) {
      delete query.page
      delete query.section
      if (key === 'all') delete query.type
      else query.type = key
    } else {
      query.section = key
      if (key !== 'rating') delete query.ratingRef
      if (!['company', 'documents'].includes(key)) delete query.stock
      delete query.user
      delete query.tab
      if (routeName.value === 'portfolio-advice') {
        delete query.report
        delete query.page
      }
      // 总览展示整个模拟账户，清除单基金范围，避免汇总提示跳入局部交易记录。
      if (routeName.value === 'portfolio-snapshot' && (key === 'overview' || section.value === 'overview')) {
        delete query.fundCode
      }
    }
    return { path: route.path, query }
  }
  return { sections, section, sectionLabel, moduleLabel, returnTarget, returnLabel, sectionTarget }
}

```

## 页面与组件控件

### AdminDashboardPage.vue

来源：`src/views/AdminDashboardPage.vue`；SHA256：`aac527fd9544e05ea2c7f77f28f605b5426b721523da076f4434d8e70a92b015`。

| 控件 | 内容 / 交互 |
|---|---|
| h1 | 后台工作台 |
| RouterLink | 账户与归属 用户管理 查看脱敏账户、调整角色和状态、人工重置密码，并确认历史关注迁移。 / v-if="authStore.hasPermission('USER_ACCOUNT_READ')"; to="/admin/users" |
| RouterLink | 数据运营 数据同步 查看和发起已授权的基金净值同步任务，不涉及交易操作。 / v-if="authStore.hasPermission('SYNC_JOB_READ')"; to="/admin/sync" |

**子组件引用：** AutomaticModelDiagnostics、RouterLink

### AdminUsersPage.vue

来源：`src/views/AdminUsersPage.vue`；SHA256：`2da2cee824e466ce0f723189034e4d595173d8ff443ea306dc1cfd41411cb550`。

| 控件 | 内容 / 交互 |
|---|---|
| h1 | {{ selectedUser ? accountDisplayLabel(selectedUser) : sectionLabel }} |
| RouterLink | ← 返回{{ sectionLabel }} / :to="sectionTarget(section)" |
| h2 | 账户资料 |
| option | {{ option.label }} |
| button | {{ selectedUser.status === 'ACTIVE' ? '停用账户' : '启用账户' }} / :disabled="selectedUser.legacyRecord \|\| actionUserId !== null"; @click="toggleStatus(selectedUser)" |
| button | 重置密码 / :disabled="selectedUser.legacyRecord \|\| actionUserId !== null"; @click="openPasswordReset(selectedUser)" |
| button | 发放关注积分 / :disabled="selectedUser.legacyRecord \|\| selectedUser.status !== 'ACTIVE' \|\| actionUserId !== null"; @click="openCreditGrant(selectedUser)" |
| h2 | 迁移待归属的历史关注 |
| label | 接收用户 |
| option | 请选择已启用用户 |
| option | {{ accountDisplayLabel(user) }}（{{ user.mobileMasked }}） |
| button | {{ actionUserId === 'legacy-watchlist' ? '正在迁移…' : '确认并迁移' }} / :disabled="actionUserId === 'legacy-watchlist'"; @click="submitLegacyTransfer" |
| h2 | 人工重置密码 |
| label | 新密码 |
| button | {{ actionUserId === resetTarget.userId ? '正在重置…' : '提交重置' }} / :disabled="actionUserId === resetTarget.userId" |
| button | 取消 / @click="resetTarget = null" |
| h2 | 发放试用关注积分 |
| label | 积分数量 |
| label | 发放原因 |
| button | {{ actionUserId === creditTarget.userId ? '正在发放…' : '确认发放' }} / :disabled="actionUserId === creditTarget.userId \|\| creditTarget.legacyRecord \|\| creditTarget.status !== 'ACTIVE'" |
| button | 取消 / @click="router.push(sectionTarget('credits'))" |
| h2 | 账户列表 |
| button | 刷新 / :disabled="loading"; @click="loadUsers" |
| button | 查看详情 / :disabled="actionUserId === user.userId"; @click="openUser(user)" |
| button | 持仓详情 / :disabled="actionUserId === user.userId"; @click="goUserInsight('sim-portfolio', user.userId)" |
| button | 发放积分 / v-if="section === 'credits'"; :disabled="user.legacyRecord \|\| user.status !== 'ACTIVE' \|\| actionUserId === user.userId"; @click="openCreditGrant(user)" |
| button | 查看积分流水 / v-if="section === 'credits'"; :disabled="actionUserId === user.userId"; @click="goUserInsight('ledger', user.userId)" |
| h2 | {{ isLedgerSection ? '查询积分流水' : '查询模拟持仓' }} |
| label | 姓名或手机号 |
| button | {{ searchLoading ? '正在查询…' : '查询' }} / :disabled="searchLoading" |
| button | {{ accountDisplayLabel(user) }}（{{ user.mobileMasked }}） / @click="goUserInsight(isLedgerSection ? 'ledger' : 'sim-portfolio', user.userId)" |
| h2 | {{ accountDisplayLabel(creditLedgerUser) }} 的积分流水 |
| button | 关闭 / @click="closeUserInsight" |
| h2 | {{ accountDisplayLabel(portfolioUser) }} 的模拟持仓 |
| button | 关闭 / @click="closeUserInsight" |

**子组件引用：** ListPagination、RouterLink

### Direction1dPage.vue

来源：`src/views/Direction1dPage.vue`；SHA256：`7e5b1883c2e57b00244fe6bcd66a5e5149c35ed8c78773474f69ef5c145e6a6d`。

| 控件 | 内容 / 交互 |
|---|---|
| RouterLink | ← 我的关注 / :to="{ name: 'watchlist' }" |
| h1 | 提前预测，公布后核对 |
| h2 | 全部关注覆盖 |
| label | 基金代码或名称 |
| button | 筛选 / :disabled="busy" |
| RouterLink | {{ fund.fundName }} / :to="{ name: 'watchlist-fund-detail', params: { fundCode: fund.fundCode }, query: { section: 'research' } }" |
| h2 | 历史判断与实际结果 |
| label | 基金代码 |
| label | 起始目标日 |
| label | 结束目标日 |
| label | 核对状态 全部 待公布 已核对 |
| button | 筛选历史 / :disabled="busy" |
| h3 | {{ record.forecast.fundName }} · 目标 {{ record.forecast.targetNavDate }} |
| RouterLink | 查看当时依据与相反证据 / :to="{ name: 'watchlist-fund-detail', params: { fundCode: record.forecast.fundCode }, query: { section: 'prediction-history' } }" |
| label | 核对统计口径 首次核对（默认） 最新修订（单独观察） |
| label | 判断时间 截止前最后一次 首次判断 |
| h2 | 提前保存情况 |

**子组件引用：** ListPagination、RouterLink

### FundDetailPage.vue

来源：`src/views/FundDetailPage.vue`；SHA256：`7db0aa65439e92dbeecff75b966872fd7ed2be1ad6027e224426aea30b40e26d`。

| 控件 | 内容 / 交互 |
|---|---|

**子组件引用：** FundDetailContent

### FundManagerDetailPage.vue

来源：`src/views/FundManagerDetailPage.vue`；SHA256：`ffca3498513d4907004f1520510843cfeb8292030daa239352d2f06284c260cb`。

| 控件 | 内容 / 交互 |
|---|---|
| button | 重试 / @click="load()" |
| h1 | {{ detail.managerName }} |
| h2 | 在管基金 |
| h2 | 历史任职 |
| h2 | 职业履历 |
| h2 | 任期表现 |
| label | 选择基金与任期 {{ fund.fundName }} · {{ fund.beginDate \|\| '起始日期暂缺' }} 至 {{ fund.endDate \|\| '今' }} |
| label | 查看阶段 完整任期 任期内最近独立管理阶段 |
| h2 | 相关披露 |

**子组件引用：** ManagerFundTable

### FundManagersPage.vue

来源：`src/views/FundManagersPage.vue`；SHA256：`56d2195ff44a21461eded0378577ac6a849a5c05415b2de288f25a68e3cab7ae`。

| 控件 | 内容 / 交互 |
|---|---|
| h1 | 查找基金经理 |
| label | 经理姓名 |
| label | 基金公司 |
| label | 任职范围 含历史任职 有在管基金 有离任记录 |
| label | 基金类型 全部类型 股票型 混合型 债券型 指数型 货币型 QDII FOF 其他 |
| button | 查找 / :disabled="loading" |
| button | 重试 / @click="load()" |
| RouterLink | {{ manager.managerName }} / :to="{ name: 'fund-manager-detail', params: { managerId: manager.managerId }, query: { from: route.fullPath } }" |

**子组件引用：** ListPagination、RouterLink

### FundMarketPage.vue

来源：`src/views/FundMarketPage.vue`；SHA256：`3a19b6410dbd18cb929ddd2d3cc6ad0bc247b0363803d2cbd2b105c0df17181c`。

| 控件 | 内容 / 交互 |
|---|---|
| h1 | 基金市场 |
| label | 基金代码或名称 |
| button | {{ loading ? '查询中…' : '查询基金' }} / :disabled="loading" |
| label | 基金评级 |
| option | 全部评级 |
| option | {{ option.label }} |
| button | × / :disabled="loading"; @click="clearRating" |
| label | 关注状态 |
| option | 全部基金 |
| option | 已关注 |
| button | × / :disabled="loading"; @click="watchedOnly = false; search()" |
| label | 持仓状态 |
| option | 全部基金 |
| option | 已持仓 |
| button | × / :disabled="loading"; @click="heldOnly = false; search()" |
| h2 | {{ fundTypeLabel(group.fundType) }} |
| RouterLink | {{ fund.fundCode }} {{ fund.fundName }} {{ fundStatusLabel(fund.status) }} 已关注 最新净值日 {{ formatChangeRate(fund.dayChangeRate) }} 近一周 {{ formatChangeRate(fund.weekChangeRate) }} 近一月 {{ formatChangeRate(fund.monthChangeRate) }} 数据截至：{{ fund.asOfDate \|\| '尚无合规净值同步' }} / :to="{ name: 'fund-detail', params: { fundCode: fund.fundCode }, query: { from: route.fullPath } }" |

**子组件引用：** FundRatingBadge、ListPagination、RouterLink

### LoginPage.vue

来源：`src/views/LoginPage.vue`；SHA256：`3c8b51828560668daf09f8f0c2602db79973fbd30e86765517886c8e6eccd896`。

| 控件 | 内容 / 交互 |
|---|---|
| h1 | 登录后查看你的基金关注 |
| label | 手机号 |
| label | 密码 |
| button | {{ submitting ? '正在登录…' : '登录并进入基金雷达' }} / :disabled="submitting" |
| RouterLink | 去注册 / :to="{ name: 'register', query: { redirect: redirectPath } }" |

**子组件引用：** RouterLink

### ManagerRelatedFundPage.vue

来源：`src/views/ManagerRelatedFundPage.vue`；SHA256：`da113b5c9cc4c94522d5e0bca1f8ce57c86c9826b0c55a4c4db203e5bbca2ceb`。

| 控件 | 内容 / 交互 |
|---|---|
| h1 | {{ value.fund.fundName }} |
| RouterLink | {{ value.manager.managerName }} / :to="{ name: 'fund-manager-detail', params: { managerId: value.manager.managerId } }" |
| h2 | 任职记录 |

**子组件引用：** RouterLink

### NotAuthorizedPage.vue

来源：`src/views/NotAuthorizedPage.vue`；SHA256：`ee786476e947a70a0c2af21b427b9832891ad276ee51948426ce8f0377137ef1`。

| 控件 | 内容 / 交互 |
|---|---|
| h1 | 当前账号没有访问此页面的权限 |
| RouterLink | 返回基金市场 / to="/funds" |

**子组件引用：** RouterLink

### NotFoundPage.vue

来源：`src/views/NotFoundPage.vue`；SHA256：`c003ed97466ccb1e5438e608ee9df7ab76db12447437ee0b4f35078d9ccab2c6`。

| 控件 | 内容 / 交互 |
|---|---|
| h1 | 页面不存在 |
| RouterLink | 返回基金市场 / to="/" |

**子组件引用：** RouterLink

### NotificationsPage.vue

来源：`src/views/NotificationsPage.vue`；SHA256：`5dac3de4016664e4e285fea05d5927e4fe27d7465b3f14727d5016e144814494`。

| 控件 | 内容 / 交互 |
|---|---|
| h1 | {{ sectionLabel }} |
| h2 | 已触发提醒 |
| RouterLink | 基金 {{ item.fundCode }} / :to="{ name: 'fund-detail', params: { fundCode: item.fundCode } }" |
| button | {{ readingIds.has(item.notificationId) ? '处理中…' : '标记已读' }} / v-if="item.status === 'UNREAD'"; :disabled="readingIds.has(item.notificationId)"; @click="markRead(item)" |
| label | 提醒状态 |
| option | 全部 |
| option | 已开启 |
| option | 已关闭 |
| button | {{ savingRuleIds.has(rule.ruleId) ? '保存中…' : rule.enabled ? '关闭提醒' : '开启提醒' }} / :disabled="savingRuleIds.has(rule.ruleId)"; @click="saveRule(rule, !rule.enabled)" |

**子组件引用：** ListPagination、ReviewNoticePanel、RouterLink

### PortfolioAdvicePage.vue

来源：`src/views/PortfolioAdvicePage.vue`；SHA256：`47546afcc1929f44e87c2fbd604ce638e4feae93ab87077db0a3eba7164ab896`。

| 控件 | 内容 / 交互 |
|---|---|
| label | 基金代码或名称 |
| button | 查询基金 |
| h1 | {{ code ? `${history?.fundName \|\| code} · 持仓建议` : '持仓分析' }} |
| button | 刷新记录 / :disabled="loading \|\| generating"; @click="load" |
| button | {{ generating ? '正在检查并留档…' : '更新并留档' }} / v-if="canGenerate && section === 'legacy'"; :disabled="loading \|\| generating"; @click="generate" |
| h2 | {{ diagnosisVerdictLabel(diagnosis.latest.report.verdict) }} |
| h2 | 逐项核对 |
| h3 | {{ diagnosisItemLabel(item.item) }} |
| button | {{ expandedDiagnosisId === item.reportId ? '收起' : '查看详情' }} / @click="toggleDiagnosisReport(item.reportId)" |
| h2 | 当前生效规则 统计已更新 |
| button | {{ revokeArmed ? '确认撤销？撤销后立即失效并留痕' : '撤销规则' }} / :disabled="revoking"; @click="revokeRule" |
| button | 取消 / v-if="revokeArmed"; :disabled="revoking"; @click="revokeArmed = false" |
| h2 | 规则草案 |
| h3 | {{ ruleTierLabel(tier.tier) }} |
| button | {{ selectedTier === tier.tier ? '已选中' : '选择此档' }} / :disabled="!canConfirmRule"; @click="selectTier(tier.tier)" |
| h3 | 微调「{{ ruleTierLabel(selectedTier) }}」档阈值（限草案值 ±20% 步进） |
| button | = ruleAdjustMaxSteps(selectedTierDraft.reduceDrawdownPct)" @click="stepReduce(-1)" > 更深 |
| button | = ruleAdjustMaxSteps(selectedTierDraft.reduceDrawdownPct)" @click="stepReduce(1)" > 更浅 |
| button | = ruleAdjustMaxSteps(selectedTierDraft.takeProfitPct)" @click="stepProfit(-1)" > 更低 |
| button | = ruleAdjustMaxSteps(selectedTierDraft.takeProfitPct)" @click="stepProfit(1)" > 更高 |
| button | 恢复草案值 / @click="resetAdjust" |
| button | {{ confirming ? '正在确认…' : '确认此规则' }} / :disabled="confirming"; @click="confirmRule" |
| button | 取消选择 / :disabled="confirming"; @click="selectedTier = ''" |
| button | {{ generatingDraft ? '正在检查统计…' : '重新生成草案' }} / :disabled="generatingDraft"; @click="regenerateDraft" |
| button | {{ generatingDraft ? '正在检查统计…' : '重新检查数据' }} / :disabled="generatingDraft"; @click="regenerateDraft" |
| h2 | 确认历史 |
| h2 | 旧版二十日建议历史（V1） |
| label | 开始日期 |
| label | 结束日期 |
| button | 按日期查看 / :disabled="loading" |
| button | 查看原报告 / @click="selectReport(item.reportId)" |
| button | ← 返回记录列表 / v-if="section !== 'latest'"; @click="selectReport()" |
| h2 | {{ adviceLabel(detail.report.decision) }} |
| h2 | 为什么给出这条建议 |
| h3 | {{ item.title }} |
| h3 | 这次判断还没有覆盖什么 |
| h2 | 后来实际怎么样 |
| summary | 当时持仓与留档信息 |

**子组件引用：** AutomaticEffectsPanel、DecisionPanelV2、ListPagination

### ProfilePage.vue

来源：`src/views/ProfilePage.vue`；SHA256：`fa6b0290de99a3d4d79e7589b1a6606b20ac78141fba7e1f78317dbc11d74dab`。

| 控件 | 内容 / 交互 |
|---|---|
| h1 | {{ sectionLabel }} |
| RouterLink | 修改姓名 → / :to="sectionTarget('name')" |
| h2 | 修改姓名 |
| label | 姓名 * |
| button | {{ submitting ? '正在保存…' : '保存姓名' }} / :disabled="submitting \|\| nameUnchanged" |

**子组件引用：** RouterLink

### RegisterPage.vue

来源：`src/views/RegisterPage.vue`；SHA256：`e0da257335003d01ee7c125d7da363d4f766784250a629f6a1c16c8249deb4cb`。

| 控件 | 内容 / 交互 |
|---|---|
| h1 | 注册你的基金账号 |
| label | 手机号 |
| label | 姓名 |
| label | 设置密码 |
| label | 确认密码 |
| button | {{ submitting ? '正在注册…' : '注册并进入基金雷达' }} / :disabled="submitting" |
| RouterLink | 去登录 / :to="{ name: 'login', query: { redirect: redirectPath } }" |

**子组件引用：** RouterLink

### SimFeeRulesPage.vue

来源：`src/views/SimFeeRulesPage.vue`；SHA256：`eeef4618cde736ef25a96703bfb1d66dc73d5c77acdb63dadbe55dffa26b49c8`。

| 控件 | 内容 / 交互 |
|---|---|
| h1 | {{ sectionLabel }} |
| label | 基金代码或名称 |
| button | {{ loading ? '查询中…' : '查询基金' }} / :disabled="loading \|\| hasSaving" |
| h2 | 费率规则 |
| button | {{ edits[rule.ruleId]!.saving ? '保存中…' : '保存' }} / :disabled="!canMaintain \|\| loading \|\| hasSaving"; @click="saveEdit(rule)" |
| button | 取消 / :disabled="edits[rule.ruleId]!.saving"; @click="cancelEdit(rule.ruleId)" |
| button | 编辑 / :disabled="!canMaintain \|\| loading \|\| rule.effectiveTo !== null"; @click="startEdit(rule)" |

**子组件引用：** ListPagination、Teleport

### SimulatedPortfolioPage.vue

来源：`src/views/SimulatedPortfolioPage.vue`；SHA256：`564290c458748346736ece6ac921ab8355b62248068634212bf215f763430416`。

| 控件 | 内容 / 交互 |
|---|---|
| h1 | {{ section === 'overview' ? '持仓总览' : sectionLabel }} |
| button | 添加基金 / v-if="canWrite"; @click="openPicker('BUY')" |
| button | {{ loading ? '刷新中…' : '刷新记录' }} / :disabled="loading"; @click="load()" |
| label | 基金代码或名称 |
| button | {{ loading ? '查询中…' : '查询基金' }} / :disabled="loading" |
| label | 排序方式 {{ option.label }} / v-if="section === 'holdings'" |
| RouterLink | 查看交易 / :to="sectionTarget('orders')" |
| label | 基金代码或名称 |
| button | {{ loading ? '查询中…' : '查询基金' }} / :disabled="loading" |
| label | 计划状态 {{ option.label }} / v-if="section === 'plans'" |
| h2 | {{ selectedPosition?.fundName ?? '持仓明细' }} |
| label | 显示已清仓基金 |
| h3 | 没有符合条件的持仓基金 |
| h3 | 还没有{{ selectedCode ? '这只基金的' : '' }}模拟持仓 |
| button | 模拟买入 / v-if="canWrite"; @click="selectedCode ? trade = { fundCode: selectedCode, mode: 'BUY' } : openPicker('BUY')" |
| button | 设置定投 / v-if="canPlan"; @click="selectedCode ? openPlan(selectedCode) : openPicker('PLAN')" |
| RouterLink | {{ p.fundName }} / :to="`/watchlist/${p.fundCode}`" |
| RouterLink | {{ p.fundName }} / :to="`/watchlist/${p.fundCode}`" |
| button | 加仓 / v-if="canWrite"; @click="trade = { fundCode: p.fundCode, mode: 'BUY' }" |
| button | 卖出 / v-if="canWrite && p.additionalPosition"; :disabled="!!p.additionalPosition.issue \|\| Number(p.additionalPosition.availableShares) <= 0"; @click="trade = { fundCode: p.fundCode, mode: 'SELL' }" |
| button | {{ planFor(p.fundCode) ? '管理定投' : '设置定投' }} / v-if="canPlan"; @click="openPlan(p.fundCode)" |
| RouterLink | 查看收益明细 / v-if="p.additionalPosition"; :to="earningsTarget(p.fundCode)" |
| RouterLink | {{ p.fundName }} / :to="earningsTarget(p.fundCode)" |
| RouterLink | 查看收益明细 › / :to="earningsTarget(p.fundCode)" |
| button | {{ Number(p.shares) > 0 ? '加仓' : '买入' }} / v-if="canWrite"; :disabled="!!p.issue"; @click="trade = { fundCode: p.fundCode, mode: 'BUY' }" |
| button | 卖出 / v-if="canWrite"; :disabled="!!p.issue \|\| Number(p.availableShares) <= 0"; @click="trade = { fundCode: p.fundCode, mode: 'SELL' }" |
| button | {{ planFor(p.fundCode) ? '管理定投' : '设置定投' }} / v-if="canPlan"; @click="openPlan(p.fundCode)" |
| button | 交易记录 / @click="router.replace({ path: route.path, query: { section: 'orders', fundCode: p.fundCode } })" |
| h2 | 我的定投 |
| button | 新建定投 / v-if="canPlan"; @click="openPicker('PLAN')" |
| h3 | {{ plan.fundName }} |
| button | 修改 / :disabled="busy"; @click="editPlan(plan)" |
| button | {{ plan.status === 'ACTIVE' ? '暂停' : '恢复' }} / :disabled="busy"; @click="act(plan, plan.status === 'ACTIVE' ? 'PAUSE' : 'RESUME')" |
| button | 结束计划 / :disabled="busy"; @click="act(plan, 'END')" |
| button | 执行记录 / @click="viewPeriods(plan)" |
| button | 确认结束 / :disabled="busy"; @click="act(plan, 'END')" |
| button | 继续保留 / :disabled="busy"; @click="endingPlan = null" |
| h2 | {{ periodPlan.fundName }} · 执行记录 |
| button | 收起 / @click="periodPlan = null" |
| h2 | 交易记录 |
| label | 记录类型 买卖订单 账务与分红变动 |
| summary | 订单编号及确认时间 |
| button | 撤销订单 / v-if="canWrite && cancellable(order)"; :disabled="busy"; @click="cancel(order)" |

**子组件引用：** AccountFundingPanel、AccountOptionsPanel、AccountRiskPanel、DecisionPanelV2、ListPagination、RouterLink、SimulationFundPicker、SimulationTradeDialog

### SimulationEarningsPage.vue

来源：`src/views/SimulationEarningsPage.vue`；SHA256：`99c14ca29d8620fb69b47ca253e40aeb7b3e1de89faf4a4d0ecd7579a84c99d7`。

| 控件 | 内容 / 交互 |
|---|---|
| h1 | 收益明细 |
| RouterLink | 返回持仓 / :to="returnTarget" |
| button | {{ result?.fund?.fundName ?? (code \|\| '全部基金') }} 切换 / @click="openFundPicker" |
| button | 全部基金 / v-if="code"; @click="chooseFund('')" |
| button | {{ item.label }} / @click="changeRange(item.value)" |
| label | 开始日期 |
| label | 结束日期 |
| button | 查询 |
| RouterLink | 交易记录 / :to="{ name: 'portfolio-snapshot', query: { section: 'orders', fundCode: code } }" |
| RouterLink | 定投计划 / :to="{ name: 'portfolio-snapshot', query: { section: 'plans', fundCode: code } }" |
| button | 重试 / @click="load" |
| h2 | {{ showCurve ? '累计收益走势' : '每日收益' }} |
| button | 每日明细 / @click="showCurve = false" |
| button | 收益走势 / @click="showCurve = true" |
| button | 查看构成 / @click="openDetails(day.date)" |
| label | 基金名称或代码 |
| button | {{ searching ? '查询中…' : '查询' }} / :disabled="searching" |
| button | 全部基金 查看账户整体收益 / @click="chooseFund('')" |
| button | 重试 / @click="search()" |
| button | {{ fund.fundName }} {{ fund.fundCode }} · 已清仓 {{ code === fund.fundCode ? '当前基金' : '查看收益' }} / @click="chooseFund(fund.fundCode)" |
| button | 重试 / @click="openDetails(selectedDate)" |
| h3 | 基金贡献 |
| RouterLink | {{ fund.fundName }} / :to="{ name: 'portfolio-earnings', query: { ...route.query, fundCode: fund.fundCode, page: undefined } }" |

**子组件引用：** ListPagination、RouterLink、SimulationEarningsPanel、SimulationPerformanceChart

### SyncCenterPage.vue

来源：`src/views/SyncCenterPage.vue`；SHA256：`a8512fdc61ce623ea69a45d2c729392f5a26a1ae4caad2147072828fa0c93e1f`。

| 控件 | 内容 / 交互 |
|---|---|
| h1 | {{ sectionLabel }} |
| h2 | 一键同步全部 |
| button | {{ startingAll ? '正在创建批次…' : allActive ? '全部同步进行中…' : '一键同步全部' }} / v-if="auth.hasPermission('SYNC_JOB_START') && canMaintainFees"; :disabled="!canStartAll"; @click="startAll" |
| button | 刷新状态 / :disabled="loading \|\| anyStarting"; @click="loadSyncCenter" |
| h2 | 各类任务最近状态 |
| RouterLink | 运行说明 / :to="sectionTarget('notes')" |
| RouterLink | 查看详情 → / :to="sectionTarget('spxManual')" |
| RouterLink | 查看详情 → / :to="sectionTarget(task.key)" |
| h2 | {{ task.title }} |
| label | 基金代码 |
| button | 更新所在类别评级 / :disabled="!canStart"; @click="startSingleRatingSync(task)" |
| label | 基金代码 |
| button | 单只刷新 / :disabled="!canStart"; @click="startSingleFeeSync(task)" |
| button | {{ starting[task.key] ? '正在创建任务…' : isActive(task) ? (task.key === 'direction1dPrediction' ? '正在生成预测…' : task.key === 'featureSnapshot' ? '正在计算…' : '同步任务进行中…') : task.actionLabel }} / v-if="auth.hasPermission('SYNC_JOB_START') && (task.key !== 'simulationFees' \|\| canMaintainFees)"; :disabled="!canStart"; @click="startSync(task)" |
| h2 | 运行说明 |

**子组件引用：** RouterLink、SimRecurringRunPanel、SpxManualSyncPanel

### WatchlistFundDetailPage.vue

来源：`src/views/WatchlistFundDetailPage.vue`；SHA256：`7db0aa65439e92dbeecff75b966872fd7ed2be1ad6027e224426aea30b40e26d`。

| 控件 | 内容 / 交互 |
|---|---|

**子组件引用：** FundDetailContent

### WatchlistPage.vue

来源：`src/views/WatchlistPage.vue`；SHA256：`143a897030a99bce6798c15f2fcff6c5fe2b4b35f2f48c758844ec834c14c1c1`。

| 控件 | 内容 / 交互 |
|---|---|
| h1 | 关注列表 |
| label | 基金代码或名称 |
| button | {{ loading ? '查询中…' : '查询基金' }} / :disabled="loading" |
| label | 持仓状态 |
| option | 全部关注 |
| option | 已持仓 |
| button | × / :disabled="loading"; @click="heldOnly = false; search()" |
| button | 重新加载 / @click="search" |
| h2 | 还没有符合条件的关注基金 |
| RouterLink | 前往基金市场 / to="/funds" |
| h2 | {{ fundTypeLabel(group.fundType) }} |
| RouterLink | {{ item.fundCode }} {{ item.fundName }} 数据截至：{{ item.asOfDate \|\| '尚无合规净值同步' }} 最新净值日 {{ formatChangeRate(item.dayChangeRate) }} 近一周 {{ formatChangeRate(item.weekChangeRate) }} 近一月 {{ formatChangeRate(item.monthChangeRate) }} / :to="{ name: 'watchlist-fund-detail', params: { fundCode: item.fundCode }, query: { from: route.fullPath } }" |

**子组件引用：** ListPagination、RouterLink、SimulationFundActions

### AccountFundingPanel.vue

来源：`src/components/AccountFundingPanel.vue`；SHA256：`6599f7bd5e2a1fb46eb5985616c5562191cb779265750a96490bd549458f68e0`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | 本人资金安排 |
| label | 适用范围 已录入的本人确认持仓 模拟组合 |
| button | 重新读取 / :disabled="saving"; @click="load()" |
| label | 资金用途 |
| label | 预计用款日期 |
| label | 预计需要金额（人民币元） |
| label | 心理上愿意接受的损失比例（%） |
| label | 现实资金可承担的损失金额（人民币元） |
| label | 定期复查间隔（天） |
| label | 我已核对适用范围与填写内容，确认保存本次设置或撤销当前安排。 |
| button | 确认保存 / :disabled="!confirmed \|\| saving \|\| loading" |
| button | 撤销当前安排 / v-if="result.current?.status === 'ACTIVE'"; :disabled="!confirmed \|\| saving \|\| loading"; @click="submit(true)" |
| summary | 查看确认历史 |
| h3 | {{ direction1dTime(item.confirmedAt) }} · {{ item.status === 'ACTIVE' ? '本人确认' : '本人撤销' }} |

**子组件引用：** ListPagination

### AccountOptionsPanel.vue

来源：`src/components/AccountOptionsPanel.vue`；SHA256：`f9d6beddfa85233166c881afb4da77859c9be530dc33d31179f1a4a2efc9a68b`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | 先核对本人条件 |
| label | 持仓范围 本人确认持仓 模拟组合 |
| label | 已录入基金 请选择 {{ holding.fundName }} · {{ holding.fundCode }} |
| label | 假设整体下跌（%） |
| button | {{ busy ? '核对中…' : '比较条件与代价' }} / :disabled="busy \|\| !code" |
| h3 | {{ result.fundName }} · {{ result.fundCode }} |
| h3 | 本人资金条件 |
| RouterLink | 核对资金安排 / to="/portfolio?section=funding" |
| h3 | 各条路径的条件与代价 |
| summary | {{ path.title }} · {{ path.status }} |

**子组件引用：** RouterLink

### AccountRiskPanel.vue

来源：`src/components/AccountRiskPanel.vue`；SHA256：`86c13a25b11ca51c468618e8d2746cfeb5b454aac59082febfabbca3ca80d1cc`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | 资料与情景 |
| label | 持仓范围 本人确认持仓 模拟组合 |
| label | 假设整体下跌（%） |
| button | {{ loading ? '核对中…' : '检查与计算情景' }} / :disabled="loading" |
| h3 | 已知行业分布 |
| h3 | 已知重叠公司（前十项） |
| summary | 查看使用的持仓与披露日期 |
| RouterLink | 查看本人资金安排 / :to="{ name: 'portfolio-snapshot', query: { section: 'funding' } }" |

**子组件引用：** ListPagination、RouterLink

### AnalysisReviewBody.vue

来源：`src/components/AnalysisReviewBody.vue`；SHA256：`9ab114f6f634f25ad13ee63a65ac154b06a77f2e7a80035217d17d574662ad36`。

| 控件 | 内容 / 交互 |
|---|---|
| summary | 查看综合依据 |

**子组件引用：** 

### AutomaticEffectsPanel.vue

来源：`src/components/AutomaticEffectsPanel.vue`；SHA256：`5d6bf30efb5a4a0a2787ae6e585fe621c7b71e89ad6f61c3f330f69e20990d1d`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | 真实预测效果 |
| h3 | {{ labels[item.horizon_id] ?? item.horizon_id }} |
| h2 | 系统建议模拟效果 |
| label | 开始日期 |
| label | 结束日期 |
| button | {{ busy ? '正在读取…' : '查看效果' }} / :disabled="busy" |
| h3 | 系统当时的建议 |
| h3 | 买入后一直持有 |
| summary | 不同持仓比例的对照 |
| summary | 卖出与买回区间 |

**子组件引用：** 

### AutomaticModelDiagnostics.vue

来源：`src/components/AutomaticModelDiagnostics.vue`；SHA256：`d4321bfca84a14be3903f0c7243bdc51daa696bfcf5aeeee8bda11a9f09a8320`。

| 控件 | 内容 / 交互 |
|---|---|
| summary | 自动预测技术排查（管理员） |
| button | 刷新技术状态 / :disabled="busy"; @click="load()" |
| button | 读取采用与比较证据 / :disabled="busy"; @click="detail(cycle.cycleId)" |
| button | 取消本轮 / v-if="['QUEUED', 'TRAINING', 'EVALUATING', 'REPLAYING', 'INTERRUPTED'].includes(cycle.status)"; :disabled="busy"; @click="control(cycle.cycleId, 'cancel')" |
| button | 沿原检查点恢复 / v-if="['CANCELLED', 'FAILED', 'INTERRUPTED'].includes(cycle.status)"; :disabled="busy"; @click="control(cycle.cycleId, 'resume')" |
| summary | 冻结范围、发布身份与决策原文 |
| button | = 20" class="secondary-button" :disabled="busy" @click="load(true)" > 读取更早周期 |
| summary | 版本与研究证据 |

**子组件引用：** ModelRoutesPanel、PredictionResearchPanel

### DecisionPanelV2.vue

来源：`src/components/DecisionPanelV2.vue`；SHA256：`85c135193240f076048ebf7ce0e56e39cd1b94faa3a9ec42abcc4bd70b3472e0`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | {{ historyOnly ? '综合建议历史' : report?.generationStatus === 'FAILED' ? '本次建议生成失败' : labels[report?.decision ?? ''] ?? '尚无综合建议' }} |
| button | {{ busy ? '正在计算并留档…' : '生成当前综合建议' }} / v-if="!historyOnly && auth.hasPermission('SIM_PORTFOLIO_SELF_WRITE')"; :disabled="busy"; @click="generate" |
| button | 重新读取 / @click="load" |
| summary | 支持、中性、反对因素与本次未覆盖信息 |
| h3 | 中性因素 |
| h3 | 支持因素 |
| h3 | 反对因素 |
| h3 | 已接入事实 |
| h3 | 未覆盖信息 |
| h3 | 执行条件 |
| label | 综合建议偏好 |
| option | 短线 |
| option | 均衡 |
| option | 长线 |
| label | 建议版本 三分类综合建议 旧版二分类综合建议 |
| summary | 当时依据与预测到期结果 |
| RouterLink | 查看综合依据与历史 → / v-if="compact"; :to="{ name: 'portfolio-advice', query: { fund: fundCode } }" |

**子组件引用：** ListPagination、RouterLink

### Direction1dFundHistory.vue

来源：`src/components/Direction1dFundHistory.vue`；SHA256：`53f28a810bddb455425c51840b343796e9a659c80aa5d01cbcc290340c086e2f`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | 本基金预测历史 |
| button | 刷新记录 / :disabled="loading"; @click="refresh" |
| button | 重新加载 / @click="retry" |
| h3 | {{ page === 1 ? '这只基金暂时没有预测记录' : '这一页暂时没有更多记录' }} |

**子组件引用：** ListPagination

### Direction1dPanel.vue

来源：`src/components/Direction1dPanel.vue`；SHA256：`78aaae15f51f18e80361ecb62665f70d1a91f3450cfde21f7d95a1187efdd141`。

| 控件 | 内容 / 交互 |
|---|---|
| button | 一天预测 看一天的涨跌 {{ busy && !value ? '正在读取…' : error && !forecast ? '暂不可用' : summary && !['暂无预测', '方向不明确', '暂不判断'].includes(summary.direction) ? `预计${summary.direction}` : summary?.direction ?? '暂无预测' }} {{ targetDate ?? '日期待确认' }} 已取得净值截至 {{ forecast.schemaVersion === 'DIRECTION_1D_ANALYSIS_V1' ? forecast.latestNavDate ?? '暂缺' : forecast.baseNavDate }} {{ selected ? '正在查看依据' : '点击查看依据' }} / @click="emit('select')" |

**子组件引用：** 

### DirectionExperimentPanel.vue

来源：`src/components/DirectionExperimentPanel.vue`；SHA256：`69c5711e8c2c419505a66587fc53875ded1ed76070ccc62f5b7e92d0bde26b3b`。

| 控件 | 内容 / 交互 |
|---|---|
| h3 | 用当前本地净值试算 |
| button | {{ loading ? '正在计算…' : '重新试算' }} / :disabled="loading"; @click="load" |
| summary | 本次试算依据 |

**子组件引用：** 

### FieldHelpTooltip.vue

来源：`src/components/FieldHelpTooltip.vue`；SHA256：`0595fde02439e0de88266b1796dd114917ddc7ace38594e5ccaf189111ecee75`。

| 控件 | 内容 / 交互 |
|---|---|
| button | @click="toggle"; @keydown.esc.prevent="closeOnEscape" |

**子组件引用：** 

### FundAlertRules.vue

来源：`src/components/FundAlertRules.vue`；SHA256：`c6d22d68ab4d87b1b854ce777d02d2d43af015c1da8ba4480ecdada16f98d918`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | 我的提醒 |
| RouterLink | 站内提醒 / to="/notifications" |
| button | 重新加载 / @click="load" |
| h3 | {{ row.title }} |
| button | 重新加载 / @click="load" |
| button | {{ pending.has(row.type) ? '保存中…' : row.rule.enabled ? '关闭提醒' : '开启提醒' }} / :disabled="pending.has(row.type)"; @click="toggle(row.type)" |

**子组件引用：** RouterLink

### FundComparisonSection.vue

来源：`src/components/FundComparisonSection.vue`；SHA256：`2de8c3a2b886591b5c8e873bbb50d34dd0dbcf47d7f0ea65509f1ec0ac627c4d`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | 同类对比 |

**子组件引用：** FundSameTypeComparison

### FundDetailContent.vue

来源：`src/components/FundDetailContent.vue`；SHA256：`1ff70ab2ccd5bc1179d1a15ec8977f4540d1e4ae892605c0d462f3e57d18cbba`。

| 控件 | 内容 / 交互 |
|---|---|
| RouterLink | ← 返回{{ moduleTitle }} / :to="returnTarget ?? (watchContext ? '/watchlist' : '/funds')" |
| h1 | {{ basic.fundName }} |
| button | {{ changingWatchlist ? '处理中…' : basic.isWatched ? '取消关注' : '加入关注' }} / :disabled="changingWatchlist"; @click="toggleWatchlist" |
| h2 | 完整基础资料 |
| h2 | 最新净值 |
| h2 | 历史单位净值 |
| button | {{ option.label }} / @click="selectedNavRange = option.value" |
| h2 | 任职记录 |
| h3 | 其他任职记录 |
| h2 | 基金份额规模趋势 |
| h2 | 历史分红 |

**子组件引用：** FieldHelpTooltip、FundAlertRules、FundComparisonSection、FundManagerCard、FundMaterialsPanel、FundNavHistoryChart、FundNewsFacts、FundRatingSection、FundRiskSummary、FundShareClassLinks、FundShareHistoryChart、MultiPredictionHistory、MultiPredictionPanel、RouterLink、SimulationFundActions

### FundEvaluationStatus.vue

来源：`src/components/FundEvaluationStatus.vue`；SHA256：`5822d52ff846e7e677c427705e5ff1d6e49510cda7a9af6630be0690f2128387`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | 历史综合评价 |

**子组件引用：** 

### FundManagerCard.vue

来源：`src/components/FundManagerCard.vue`；SHA256：`c4415c91df5ae17ca8f036e37f1de7d41c8e11b1069c3d33f16c3b51edd5d356`。

| 控件 | 内容 / 交互 |
|---|---|
| h3 | {{ profile.managerName }} {{ profile.managerName }} |

**子组件引用：** RouterLink

### FundMaterialsPanel.vue

来源：`src/components/FundMaterialsPanel.vue`；SHA256：`23aeda8756a1631bba97783ac62aa4c866819e6181fc632087bd0320a3936441`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | {{ title }} |
| button | 重试 / @click="load" |
| label | 选择报告 最新收录报告 {{ r.title }} |
| button | 经营情况 / v-if="companyCodes.has(h.stockCode)"; @click="navigate('company', h.stockCode)" |
| button | 公告 / v-if="companyCodes.has(h.stockCode)"; @click="navigate('documents', h.stockCode)" |
| h3 | 资产配置 占总资产 |
| h3 | 行业分布 占净资产 |
| label | 选择公司 {{ c.stockName }} · {{ c.stockCode }} |
| h3 | {{ company.stockName }} · 财务表现 |
| button | 查看公司公告 → / @click="navigate('documents', stockCode)" |
| summary | 主营业务构成 · {{ company.business[0]?.endDate }} |
| summary | 业绩预告、审计及分红动态 |
| button | 重试 / @click="load" |

**子组件引用：** 

### FundNavHistoryChart.vue

来源：`src/components/FundNavHistoryChart.vue`；SHA256：`a9b64ef77c47b63bd3214072fad7087cee8b8824b1641f8aa44839267e62cd3f`。

| 控件 | 内容 / 交互 |
|---|---|
| summary | 最近 12 条净值数据表 |

**子组件引用：** 

### FundNewsFacts.vue

来源：`src/components/FundNewsFacts.vue`；SHA256：`89802f0418f0316b3d46b7fa65cefd70b51cc215a219e868c518b59317b2e8b1`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | 近期公告要点 |
| button | 重试 / @click="load" |
| label | 关联公司 全部公告 {{ company.label }} |
| h3 | {{ item.subject }} |

**子组件引用：** ListPagination

### FundRatingBadge.vue

来源：`src/components/FundRatingBadge.vue`；SHA256：`d354c2173f66182c6bc8936d1cf6af11f9af1b9f848a926164f772be4acc87e9`。

| 控件 | 内容 / 交互 |
|---|---|

**子组件引用：** 

### FundRatingSection.vue

来源：`src/components/FundRatingSection.vue`；SHA256：`220a98e478d2ef757b365198d749d538aff813d7f1c20a35bfde0102dfbfbf97`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | 基金评级 |
| button | 重新读取 / @click="load" |
| h3 | {{ dimension.name }} |
| h3 | 主要优势 |
| h3 | 主要不足 |
| h3 | 资料限制 |

**子组件引用：** 

### FundRiskSummary.vue

来源：`src/components/FundRiskSummary.vue`；SHA256：`03adcfc14d32b8a327250772d927ab46bf8aeb570b53565f89e363ecbae741ba`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | 持仓风险与行情变化 |
| button | 重试 / @click="load" |

**子组件引用：** 

### FundSameTypeComparison.vue

来源：`src/components/FundSameTypeComparison.vue`；SHA256：`bbc6da5dcf393197bf5ebbfbfbd93b9d4bcff2a5180c709d83260c796e00b53e`。

| 控件 | 内容 / 交互 |
|---|---|

**子组件引用：** 

### FundShareClassLinks.vue

来源：`src/components/FundShareClassLinks.vue`；SHA256：`f9426258a48b473500d5360778e4d12c62b4a7061ab7523d46ca7706d3b5fa51`。

| 控件 | 内容 / 交互 |
|---|---|

**子组件引用：** 

### FundShareHistoryChart.vue

来源：`src/components/FundShareHistoryChart.vue`；SHA256：`711914e0add3eba0106ecac4742d79e081a281dbd7e59b77b86965d762389caa`。

| 控件 | 内容 / 交互 |
|---|---|
| summary | 最近 12 条份额规模数据表 |

**子组件引用：** 

### ListPagination.vue

来源：`src/components/ListPagination.vue`；SHA256：`76337e6477251c2091f0e33928c1e2953a7bac5fd8187cb372a0a1834a92bc63`。

| 控件 | 内容 / 交互 |
|---|---|
| label | 每页 {{ size }} 条 |
| button | 首页 / :disabled="loading \|\| page <= 1"; @click="move(1)" |
| button | 上一页 / :disabled="loading \|\| page <= 1"; @click="move(page - 1)" |
| button | 下一页 / :disabled="loading \|\| !next"; @click="move(page + 1)" |
| button | 尾页 / :disabled="loading \|\| !next"; @click="last" |
| label | 跳至 页 |
| button | 跳转 / :disabled="loading"; @click="move(Number(input))" |

**子组件引用：** 

### ManagerFundTable.vue

来源：`src/components/ManagerFundTable.vue`；SHA256：`45869868943d62fd2939ddab63ccbbf7bd27d1cfd8517c721f6b8020448e446a`。

| 控件 | 内容 / 交互 |
|---|---|
| RouterLink | {{ fund.fundName }} / :to="managerFundTarget(managerId, fund, route.fullPath)" |

**子组件引用：** ListPagination、RouterLink

### ModelRoutesPanel.vue

来源：`src/components/ModelRoutesPanel.vue`；SHA256：`6e779555beb29cd42c2ac65d2a199cfe07cd75f18b0f141f6ad47757759fc99b`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | 现在用什么方法预测 |
| button | {{ loading ? '正在刷新…' : '刷新状态' }} / :disabled="loading"; @click="load" |
| h3 | {{ horizonName(route) }} |
| summary | 查看历史比较结果 |
| summary | 模型与训练详情（排查用） |
| summary | 旧目标或其他规则的路由（不用于当前三分类） |
| summary | 查看方法更换与故障记录 |
| summary | 原始记录 |

**子组件引用：** 

### MultiPredictionHistory.vue

来源：`src/components/MultiPredictionHistory.vue`；SHA256：`e23afb72cad7676ed4d3cb7b3d8aaf3397714629fb1a4072275129a584d95915`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | 预测历史 |
| button | 重试 / :disabled="busy"; @click="load(source)" |
| button | 重试 / :disabled="dayBusy"; @click="loadDays(visibleDates)" |
| h3 | {{ day.date }} |
| label | 1" class="history-revisions" > 当日历次判断 {{ timeText(revision.generatedAt) }} · {{ historyItemView(revision).direction }}{{ index === 0 ? '（首次）' : index === day.revisions.length - 1 ? '（最后一次）' : '' }} |
| button | {{ expandedId === slot.item.id ? '收起依据' : '查看依据' }} {{ expandedId === slot.item.id ? '−' : '+' }} / @click="toggleEvidence(slot.item, $event)" |
| button | 重试 / @click="readEvidence(selected.item)" |

**子组件引用：** AnalysisReviewBody、ListPagination、PredictionEvidenceBody

### MultiPredictionPanel.vue

来源：`src/components/MultiPredictionPanel.vue`；SHA256：`9731001c6778926a01df1bc1077e249e4a4e3652558e85ed619408f101494084`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | 接下来，可能涨还是跌？ |
| button | {{ updating ? '正在更新…' : canWrite ? '更新预测' : '刷新结果' }} / :disabled="updating"; @click="generate" |
| button | {{ card.title }} {{ card.duration }} {{ card.period ? reviewDirection(card.period) : loading ? '正在读取…' : error ? '暂时无法读取' : '分析待更新' }} {{ reviewDateRange(card.period) }} 区间已结束 · 仅供复盘 条件展望{{ card.period.endDate ? '' : ' · 终点待核' }} 区间内补充判断 · 非事前预测 {{ card.period.awaitingReason \|\| card.period.summary \|\| '现有依据还不足以作出方向判断。' }} 行情截至 {{ current.marketAsOf }} {{ selectedPeriod === card.id ? '正在查看依据' : '点击查看依据' }} / @click="selectedPeriod = card.id" |
| h2 | {{ selectedCard.title }} · 判断依据 |
| h3 | 主要依据 |
| h3 | 相反因素如何取舍 |
| h3 | 什么情况下需要改变判断 |
| h3 | 还要注意 |

**子组件引用：** 

### PortfolioAdviceCard.vue

来源：`src/components/PortfolioAdviceCard.vue`；SHA256：`71f0f94f8f793dda55ae66d99c620d3c495819ed08edef6df19287be2dbcb426`。

| 控件 | 内容 / 交互 |
|---|---|
| RouterLink | 持仓分析 → / :to="{ name: 'portfolio-advice', query: { fund: fundCode, from: route.fullPath } }" |

**子组件引用：** RouterLink

### PredictionEvidenceBody.vue

来源：`src/components/PredictionEvidenceBody.vue`；SHA256：`227c086bff49ee0769cadda510be82bcbca110dfd68531bbc6bacd62ef0fe51f`。

| 控件 | 内容 / 交互 |
|---|---|
| h3 | {{ group.title }} |
| h3 | 综合考虑 |
| h3 | 什么时候需要重新判断 |
| h3 | 阅读时需要留意 |
| h3 | 参考报告 |
| h3 | 阅读时需要留意 |

**子组件引用：** 

### PredictionResearchPanel.vue

来源：`src/components/PredictionResearchPanel.vue`；SHA256：`af2dda48a5259eb1d46f2285fb02275c1b514d90c303e32931caae6596f3bd92`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | 过去按建议买卖，结果会怎样？ |
| label | 基金代码 |
| label | 从哪天开始 |
| label | 到哪天结束 |
| button | {{ replayBusy ? '正在模拟，请稍候…' : result ? '重新比较这段时间' : '看看哪种方式更好' }} / :disabled="busy" |
| h3 | {{ headline }} |
| summary | 查看详细对照与指标解释 |
| summary | 查看模拟假设与任务记录 |
| summary | 比较五日、二十日、半年预测方法（进阶实验） |
| label | 方法比较到哪天 |
| button | {{ researchBusy ? '正在处理…' : '开始比较三个周期的方法' }} / :disabled="busy"; @click="train" |
| summary | 查看模型编号 |
| button | 刷新比较进度 / :disabled="busy \|\| !researchId"; @click="readResearch()" |
| summary | 读取以前的任务，或恢复未完成的比较 |
| label | 任务编号 |
| button | 读取这个任务 / :disabled="busy \|\| !researchId.trim()"; @click="readResearch()" |
| button | 取消这个任务 / :disabled="busy \|\| !researchId.trim()"; @click="readResearch('cancel')" |
| button | 继续未完成的比较 / :disabled="busy \|\| !researchId.trim()"; @click="readResearch('resume')" |

**子组件引用：** 

### ReviewNoticePanel.vue

来源：`src/components/ReviewNoticePanel.vue`；SHA256：`99101d0d93f96e225dba45c6a1d6568d7e935b9c940c5131a12c65a0daa7bd81`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | 事实与本人条件复查 |
| button | 刷新 / :disabled="busy"; @click="load()" |
| h3 | {{ item.payload.title }} |
| RouterLink | 前往复查 / :to="destination(item)" |
| button | 标记已读 / v-if="!item.read"; :disabled="pending.has(item.noticeId)"; @click="markRead(item)" |
| button | 查看变化历史 / :disabled="pending.has(item.noticeId)"; @click="history(item)" |

**子组件引用：** ListPagination、RouterLink

### SimRecurringRunPanel.vue

来源：`src/components/SimRecurringRunPanel.vue`；SHA256：`8b534f50cca2de43e964c5338a03eef79760879552dc85fc14d8f2d2515bd9cf`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | 定投计划手动执行 |
| button | {{ running ? '正在补入定投…' : '立即补入一期定投' }} / v-if="auth.hasPermission('SYNC_JOB_START')"; :disabled="!canRun"; @click="run" |

**子组件引用：** 

### SimulationEarningsPanel.vue

来源：`src/components/SimulationEarningsPanel.vue`；SHA256：`8e85bc25f9aab4538173b97cf885a4b463fb34aaa2ab95dc3f849171fab458c9`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | {{ title }} |
| button | 关闭 / @click="emit('close')" |

**子组件引用：** Teleport

### SimulationFundActions.vue

来源：`src/components/SimulationFundActions.vue`；SHA256：`a177dc4a2affb0687f1f0d4169d0b7717ae9f467f0ce7c56f00c102c4681ba99`。

| 控件 | 内容 / 交互 |
|---|---|
| button | 模拟买入 / 加仓 / v-if="canBuy"; @click="mode = 'BUY'" |
| button | 设置定投 / v-if="canPlan"; @click="mode = 'PLAN'" |
| RouterLink | 查看持仓 / :to="{ path: '/portfolio', query: { section: 'holdings', fundCode } }" |

**子组件引用：** RouterLink、SimulationTradeDialog

### SimulationFundPicker.vue

来源：`src/components/SimulationFundPicker.vue`；SHA256：`94faa0f0cb68a2c80a4e0bae036810a4c215c162bffbdf4e229a88a65c28b20b`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | 选择基金 |
| button | 关闭 / @click="emit('close')" |
| button | 我的关注 / @click="switchSource('watchlist')" |
| button | 基金市场 / @click="switchSource('market')" |
| label | 代码或名称 |
| button | 搜索 / :disabled="loading" |
| button | {{ fund.fundName }} {{ fund.fundCode }} → / @click="emit('select', fund.fundCode)" |

**子组件引用：** ListPagination

### SimulationPerformanceChart.vue

来源：`src/components/SimulationPerformanceChart.vue`；SHA256：`644257b30e661c3277058131d71dfe7da95e0e15ae97f4fa436c29719c3dc858`。

| 控件 | 内容 / 交互 |
|---|---|

**子组件引用：** 

### SimulationTradeDialog.vue

来源：`src/components/SimulationTradeDialog.vue`；SHA256：`ef704b694fad6b290173c2152fca42e08850467b6b4a077cf5d1fc89bfc54415`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | {{ heading }} |
| button | 关闭 / :disabled="saving"; @click="close" |
| button | 重新加载 / v-if="!loading && !preview"; @click="load" |
| label | {{ mode === 'PLAN' ? '每期投入金额（元）' : '买入金额（元）' }} |
| label | 卖出份额 |
| button | {{ part === 1 ? '全部' : part === 2 ? '一半' : '四分之一' }} / :disabled="saving"; @click="shares = fractionShares(preview.availableShares, part)" |
| label | 同时暂停该基金定投 |
| label | 定投周期 |
| option | 每个交易日 |
| option | 每周 |
| option | 每月 |
| label | {{ frequency === 'WEEKLY' ? '星期' : '每月日期' }} |
| option | {{ frequency === 'WEEKLY' ? `星期${['一','二','三','四','五','六','日'][day - 1]}` : `${day} 日` }} |
| label | 开始日期 |
| label | 结束日期（可选） |
| label | 总期数（可选；留空持续执行） |
| summary | 查看模拟规则 |
| button | 取消 / :disabled="saving"; @click="close" |
| button | {{ saving ? '正在提交…' : mode === 'PLAN' ? '保存定投计划' : '确认模拟交易' }} / :disabled="saving \|\| !preview.supported \|\| (mode === 'PLAN' && (!firstExecution \|\| previewing)) \|\| (mode === 'SELL' && Number(preview.availableShares) <= 0)" |

**子组件引用：** 

### SpxManualSyncPanel.vue

来源：`src/components/SpxManualSyncPanel.vue`；SHA256：`a2157c1287b87811d443f05052313f5b0f9620f952ef4c7001f1f3435b509fec`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | 美国标普500（SPX） |
| button | {{ running \|\| syncing ? '正在同步标普500…' : cooldownSeconds ? `${cooldownSeconds}秒后可再次同步` : '手动同步标普500' }} / v-if="auth.hasPermission('SYNC_JOB_START')"; :disabled="!canSync"; @click="synchronize" |
| button | {{ loading ? '正在读取…' : '刷新状态' }} / :disabled="loading"; @click="refresh()" |
| summary | 标普500、SPX和早上8点分别是什么意思？ |

**子组件引用：** 

### WatchlistPredictionCard.vue

来源：`src/components/WatchlistPredictionCard.vue`；SHA256：`74db9686a5530a835b8f71dc6130b8dca8b6ddf528b85c29bb295099c73670cd`。

| 控件 | 内容 / 交互 |
|---|---|
| h2 | 未来 20 个交易日方向 |
| summary | 正式模型发布状态 |
| button | {{ loading ? '正在读取…' : '刷新正式状态' }} / :disabled="loading"; @click="load" |
| summary | 为什么现在没有预测数字？ |

**子组件引用：** DirectionExperimentPanel

## 接口导出索引

包含查询、生成、写入、状态变更。具体参数和挂载调用须回到源码核对。

### adminUsers.ts

来源：`src/api/adminUsers.ts`

- `getAdminUsers`
- `getAdminUser`
- `updateAdminUserRole`
- `updateAdminUserStatus`
- `resetAdminUserPassword`
- `grantAdminUserWatchlistCredits`
- `getAdminUserWatchlistCreditLedger`
- `transferLegacyWatchlist`
- `getAdminUserSimPortfolio`

### advice.ts

来源：`src/api/advice.ts`

- `getLatestAdvice`
- `getAdviceReport`
- `generateAdvice`
- `getAdviceHistory`
- `fetchCurrentDiagnosis`
- `fetchFundDiagnosis`
- `fetchRuleDraft`
- `generateRuleDraft`
- `fetchHoldingRules`
- `confirmHoldingRule`
- `revokeHoldingRule`

### alerts.ts

来源：`src/api/alerts.ts`

- `getAlertRules`
- `getAlertRulePage`
- `getAlertAvailability`
- `upsertAlertRule`

### auth.ts

来源：`src/api/auth.ts`

- `login`
- `register`
- `getCurrentUser`
- `updateCurrentProfile`
- `logout`

### automaticPrediction.ts

来源：`src/api/automaticPrediction.ts`

- `readPredictionEffects`
- `readAdviceEffects`
- `readAutoCycles`
- `readAutoCycleDetail`
- `controlAutoCycle`

### direction1d.ts

来源：`src/api/direction1d.ts`

- `getDirection1dStatus`
- `getDirection1dCoverage`
- `getDirection1dHistory`
- `getDirection1dFundHistory`
- `getDirection1dCurrent`
- `getDirection1dEvidence`
- `generateDirection1d`
- `getDirection1dMetrics`

### fundEvaluation.ts

来源：`src/api/fundEvaluation.ts`

- `readEvaluationStatus`

### fundManagers.ts

来源：`src/api/fundManagers.ts`

- `getManagerLinks`
- `getFundManagers`
- `getFundManager`
- `getManagerRelatedFund`

### fundMaterials.ts

来源：`src/api/fundMaterials.ts`

- `getCompleteFundDetail`
- `getPublicFundShareHistory`
- `getFundMaterials`
- `getFundDocuments`

### fundRating.ts

来源：`src/api/fundRating.ts`

- `readFundRatings`
- `readFundRating`

### funds.ts

来源：`src/api/funds.ts`

- `getFunds`
- `getFundDetail`
- `getFundShareClasses`
- `getFundNavHistory`
- `getFundSameTypeComparison`
- `getFundEvents`
- `getFundSignals`
- `getFundAnalysisSummary`
- `getFundFeatureStatus`

### http.ts

来源：`src/api/http.ts`

- `get`
- `post`
- `put`
- `remove`

### multiPrediction.ts

来源：`src/api/multiPrediction.ts`

- `readAnalysisReviews`
- `readMultiPrediction`
- `generateMultiPrediction`
- `readPredictionTask`
- `readLatestPredictionTask`
- `retryPredictionTask`
- `readDecision`
- `readLatestDecisions`
- `generateDecision`
- `readDecisionHistory`
- `readDecisionOutcomes`
- `readStrategyPreference`
- `saveStrategyPreference`

### notifications.ts

来源：`src/api/notifications.ts`

- `getNotifications`
- `markNotificationRead`

### predictionReview.ts

来源：`src/api/predictionReview.ts`

- `readPredictionReview`
- `requestPredictionReview`

### simulation.ts

来源：`src/api/simulation.ts`

- `getSimOverview`
- `getSimEarnings`
- `getSimEarningsFunds`
- `getSimEarningsDetails`
- `getSimPreview`
- `placeSimOrder`
- `cancelSimOrder`
- `getSimOrders`
- `getSimLedger`
- `getSimPlans`
- `previewSimPlan`
- `saveSimPlan`
- `changeSimPlan`
- `getSimPeriods`
- `getSimPerformance`
- `runSimRecurringDue`
- `getSimFeeRules`
- `updateSimFeeRule`

### spxManual.ts

来源：`src/api/spxManual.ts`

- `getSpxManualStatus`
- `synchronizeSpxManually`

### syncJobs.ts

来源：`src/api/syncJobs.ts`

- `startFundManagersSync`
- `getLatestFundManagersSync`
- `startFundRatingsSync`
- `getLatestFundRatingsSync`
- `startFundNewsSync`
- `getLatestFundNewsSync`
- `startFundMaterialsSync`
- `getLatestFundMaterialsSync`
- `startDirection1dPredictionSync`
- `getLatestDirection1dPredictionSync`
- `startMultiPredictionSync`
- `getLatestMultiPredictionSync`
- `startSimulationFeeSync`
- `getLatestSimulationFeeSync`
- `startAllSync`
- `getLatestAllSync`
- `startMarketNavIncrementalSync`
- `startMarketFreeDataCompletionSync`
- `startStockFeatureSnapshotSync`
- `getSyncJob`
- `getLatestMarketNavIncrementalSync`
- `getLatestMarketFreeDataCompletionSync`
- `getLatestStockFeatureSnapshotSync`
- `getLastSuccessfulSyncTimes`

### watchlist.ts

来源：`src/api/watchlist.ts`

- `getWatchlist`
- `addWatchlistItem`
- `removeWatchlistItem`
- `getWatchlistFundDetail`
- `getWatchlistPrediction`
- `getDirectionExperiment`
- `getWatchlistFundShareHistory`

## 页面、组件及组合逻辑中的直接请求

| 文件 | 请求表达式 |
|---|---|
| `src/views/AdminUsersPage.vue` | } from '@/api/adminUsers' |
| `src/views/PortfolioAdvicePage.vue` | } from '@/api/advice' |
| `src/views/SyncCenterPage.vue` | } from '@/api/syncJobs' |
| `src/components/AccountFundingPanel.vue` | const value = await get<Page>(`/api/v1/account/funding?scope=${selectedScope}&page=${target}`) |
| `src/components/AccountFundingPanel.vue` | await post<View>(`/api/v1/account/funding/${revoke ? 'revoke' : 'confirm'}?scope=${selected}`, |
| `src/components/AccountOptionsPanel.vue` | const value = await get<{ scope: Scope; holdings: Holding[] }>(`/api/v1/account/risk?scope=${scope.value}`) |
| `src/components/AccountOptionsPanel.vue` | const value = await get<Result>(`/api/v1/account/options?${query}`) |
| `src/components/AccountRiskPanel.vue` | const value = await get<Result>(`/api/v1/account/risk?${query}`) |
| `src/components/FundNewsFacts.vue` | get<NewsFacts>(`/api/v1/funds/${encodeURIComponent(fundCode)}/news-facts`), |
| `src/components/FundRiskSummary.vue` | const data = await get<RiskSummary>(`/api/v1/funds/${encodeURIComponent(props.fundCode)}/risk-summary`) |
| `src/components/ModelRoutesPanel.vue` | try { value.value = await get<ModelStatus>('/api/v1/admin/model-routes') } |
| `src/components/MultiPredictionHistory.vue` | multi: (code, cursor) => get<{ items: MultiHistoryRow[] }>(`/api/v1/watchlist/${code}/predictions/history${cursor |
| `src/components/MultiPredictionHistory.vue` | `/api/v1/watchlist/${code}/predictions/history-days?${new globalThis.URLSearchParams({ dates: dates.join(',') })}`), |
| `src/components/PredictionEvidenceBody.vue` | ? `/api/v1/watchlist/${encodeURIComponent(fundCode)}/prediction-1d/evidence/${encodeURIComponent(recordId)}/narrative` |
| `src/components/PredictionEvidenceBody.vue` | : `/api/v1/watchlist/${encodeURIComponent(fundCode)}/predictions/${encodeURIComponent(recordId)}/narrative` |
| `src/components/PredictionResearchPanel.vue` | const answer = await post<Replay>('/api/v1/admin/prediction-research/strategy', calculationScope.value) |
| `src/components/PredictionResearchPanel.vue` | research.value = await post<Research>('/api/v1/admin/prediction-research', { fundCodes: [code.value.trim()], horizonIds: ['T5_V1', 'T20_V1', 'M6_V1'], trainStart: '2022-01-04', trainEnd: '2023-12-29', validationEnd: '2024-06-28', selectionEnd: researchEnd.value, stride: 5, evidenceLevel: 'DEVELOPMENT_ONLY' }) |
| `src/components/PredictionResearchPanel.vue` | const path = `/api/v1/admin/prediction-research/${encodeURIComponent(researchId.value.trim())}` |
| `src/components/ReviewNoticePanel.vue` | return get<Page<Notice>>(`/api/v1/notifications/reviews?page=${serverPage}`) |
| `src/components/ReviewNoticePanel.vue` | const saved = await post<Notice>(`/api/v1/notifications/reviews/${item.noticeId}/read`, { revision: item.revision }) |
| `src/components/ReviewNoticePanel.vue` | try { histories.value[item.noticeId] = await readFixedPage(target => get<Page<Revision>>(`/api/v1/notifications/reviews/${item.noticeId}/history?page=${target}`), page, historySizes.value[item.noticeId] ?? 10) } |

## 权限类型

```ts
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
  | 'SIM_PORTFOLIO_SELF_WRITE'
  | 'SIM_PLAN_SELF_WRITE'
  | 'ADMIN_DASHBOARD_VIEW'
  | 'SYSTEM_HEALTH_READ'
  | 'SYNC_JOB_READ'
  | 'SYNC_JOB_START'
  | 'USER_ACCOUNT_READ'
  | 'USER_ACCOUNT_MANAGE'
  | 'LEGACY_WATCHLIST_TRANSFER'
  | 'PORTFOLIO_USER_READ'
  | 'SIM_FEE_RULE_ADMIN'
  | 'MODEL_EXPERIMENT_ADMIN'
  | 'RESEARCH_RUN_ADMIN'

/** 登录成功或刷新会话后返回的非敏感账户资料。 */
export interface CurrentUser {
  userId: string
  mobileMasked: string
  displayName: string
  role: AccountRole
  permissions: PermissionCode[]
}

```

提取统计：487个控件条目，134个接口导出名。这是静态盘点，不能替代真实流程验证。
