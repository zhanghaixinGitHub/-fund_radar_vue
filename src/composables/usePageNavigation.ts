import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { LocationQuery, RouteLocationRaw } from 'vue-router'

import { fundTypeOptions } from '@/utils/fundPresentation'
import { normalizeRatingFilter } from '@/utils/fundRating'
import { portfolioReturnPath } from '@/utils/advice'
import { managerReturnPath } from '@/utils/fundManagerNavigation'
import { useAuthStore } from '@/stores/auth'

export interface PageSection {
  key: string
  label: string
  group?: string
}

const pageSections: Record<string, PageSection[]> = {
  'fund-managers': [{ key: 'directory', label: '经理查找' }],
  'fund-manager-detail': [
    { key: 'funds', label: '在管基金', group: '管理基金' },
    { key: 'history', label: '历史任职' },
    { key: 'profile', label: '职业履历', group: '经理资料' },
    { key: 'performance', label: '任期表现' },
    { key: 'disclosures', label: '相关披露' },
  ],
  'manager-related-fund': [{ key: 'basic', label: '基础资料' }],
  'portfolio-advice': [
    { key: 'latest', label: '最新建议', group: '当前建议' },
    { key: 'history', label: '历史记录', group: '历史记录' },
  ],
  'watchlist-fund-detail': [
    { key: 'basic', label: '基础资料', group: '基金概况' },
    { key: 'manager', label: '基金经理' },
    { key: 'nav', label: '净值走势', group: '净值与分红' },
    { key: 'share', label: '份额规模' },
    { key: 'dividend', label: '分红记录' },
    { key: 'comparison', label: '同类对比', group: '评价与对比' },
    { key: 'rating', label: '基金评级' },
    { key: 'holdings', label: '基金持仓', group: '持仓与经营' },
    { key: 'company', label: '持仓公司经营' },
    { key: 'documents', label: '公告与动态', group: '资讯动态' },
    { key: 'research', label: '走势预测', group: '预测分析' },
    { key: 'prediction-history', label: '预测历史' },
    { key: 'rules', label: '提醒设置', group: '我的设置' },
  ],
  // 市场详情只展示基金资料；走势预测与历史记录统一从“我的关注”进入。
  'fund-detail': [
    { key: 'basic', label: '基础资料', group: '基金概况' },
    { key: 'manager', label: '基金经理' },
    { key: 'nav', label: '净值走势', group: '净值与分红' },
    { key: 'share', label: '份额规模' },
    { key: 'dividend', label: '分红记录' },
    { key: 'comparison', label: '同类对比', group: '评价与对比' },
    { key: 'rating', label: '基金评级' },
    { key: 'holdings', label: '基金持仓', group: '持仓与经营' },
    { key: 'company', label: '持仓公司经营' },
    { key: 'documents', label: '公告与动态', group: '资讯动态' },
  ],
  'portfolio-fund-detail': [
    { key: 'position', label: '持仓概况', group: '持仓详情' },
    { key: 'orders', label: '交易记录', group: '交易与收益' },
    { key: 'earnings', label: '收益明细' },
    { key: 'plans', label: '定投计划', group: '定投管理' },
    { key: 'reminders', label: '提醒设置', group: '我的设置' },
  ],
  'portfolio-snapshot': [
    { key: 'overview', label: '总览', group: '账户概览' },
    { key: 'holdings', label: '持仓' },
    { key: 'orders', label: '交易记录', group: '交易与收益' },
    { key: 'earnings', label: '收益明细' },
    { key: 'plans', label: '定投计划', group: '定投与资金' },
    { key: 'preferences', label: '投资偏好' },
    { key: 'funding', label: '本人资金安排' },
  ],
  notifications: [
    { key: 'messages', label: '全部消息', group: '提醒消息' },
    { key: 'thresholds', label: '止盈与下跌提醒' },
    { key: 'events', label: '基金事件提醒' },
    { key: 'signals', label: '走势与风险提醒' },
    { key: 'holding-checks', label: '持仓检查' },
    { key: 'rules', label: '关注提醒设置', group: '提醒设置' },
    { key: 'holding-rules', label: '持仓提醒设置' },
  ],
  profile: [
    { key: 'overview', label: '基本信息', group: '账户概览' },
    { key: 'name', label: '修改姓名' },
  ],
  'admin-dashboard': [{ key: 'overview', label: '工作概览', group: '工作台' }],
  'admin-sync-center': [
    { key: 'overview', label: '任务总览', group: '任务概况' },
    { key: 'marketNav', label: '净值增量同步', group: '任务分类' },
    { key: 'freeDataCompletion', label: '基金资料与市场数据更新' },
    { key: 'fundManagers', label: '基金经理资料更新' },
    { key: 'fundMaterials', label: '基金持仓与公司资料更新' },
    { key: 'fundRatings', label: '基金评级更新' },
    { key: 'fundNews', label: '近期基金公告核验' },
    { key: 'featureSnapshot', label: '历史指标计算', group: '分析与预测' },
    { key: 'direction1dPrediction', label: '一日综合预测' },
    { key: 'simulationFees', label: '模拟费率同步', group: '模拟账户维护' },
    { key: 'spxManual', label: '标普500手动同步', group: '市场补充' },
    { key: 'simRecurring', label: '定投手动执行', group: '定投执行' },
    { key: 'notes', label: '运行说明', group: '帮助' },
  ],
  'admin-users': [
    { key: 'accounts', label: '账户列表', group: '账户管理' },
    { key: 'credits', label: '关注积分', group: '积分管理' },
    { key: 'ledger', label: '积分流水' },
    { key: 'sim-portfolio', label: '持仓详情', group: '持仓与迁移' },
    { key: 'migration', label: '历史关注迁移' },
  ],
}

const holdingMaterialPrefix = 'material-'
const holdingMaterialSections = pageSections['fund-detail']!.map(item => ({
  ...item,
  key: holdingMaterialPrefix + item.key,
}))

const moduleNames: Record<string, string> = {
  'fund-managers': '基金经理', 'fund-manager-detail': '基金经理', 'manager-related-fund': '基金经理',
  'fund-market': '基金市场', 'fund-detail': '基金市场',
  watchlist: '我的关注', 'watchlist-fund-detail': '我的关注',
  'portfolio-snapshot': '我的持仓', notifications: '站内提醒', profile: '个人信息',
  'portfolio-earnings': '我的持仓', 'portfolio-fund-detail': '我的持仓',
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
  if (params.get('heldOnly') === 'false') query.heldOnly = 'false'
  if (listPath === '/funds' && params.get('watchedOnly') === 'true') query.watchedOnly = 'true'
  const rating = listPath === '/funds' ? normalizeRatingFilter(params.get('rating')) : ''
  if (rating) query.rating = rating
  return { path: listPath, query }
}

/** 顶栏、左侧导航和页面共用子页顺序；未指定子页、未知参数及已移除的概览链接均回落到首项。 */
export function usePageNavigation() {
  const route = useRoute()
  const auth = useAuthStore()
  const routeName = computed(() => String(route.name ?? ''))
  const isHoldingDetail = computed(() => routeName.value === 'portfolio-fund-detail')
  const isList = computed(() => ['fund-market', 'watchlist'].includes(routeName.value))
  const sections = computed<PageSection[]>(() => {
    if (isList.value) return [{ key: 'all', label: routeName.value === 'watchlist' ? '全部关注' : '全部基金' },
      ...fundTypeOptions.map((type, index) => ({ key: type.value, label: type.label, group: index === 0 ? '按基金类型' : undefined }))]
    const items = pageSections[routeName.value === 'portfolio-earnings' ? 'portfolio-snapshot' : routeName.value] ?? []
    return isHoldingDetail.value && auth.hasPermission('FUND_READ') ? [...items, ...holdingMaterialSections] : items
  })
  const section = computed(() => {
    if (routeName.value === 'portfolio-earnings') return 'earnings'
    if (isHoldingDetail.value) {
      if (route.query.tab === 'materials') {
        if (!auth.hasPermission('FUND_READ')) return 'position'
        return holdingMaterialSections.find(item => item.key === holdingMaterialPrefix + route.query.material)?.key
          ?? holdingMaterialPrefix + 'basic'
      }
      return pageSections['portfolio-fund-detail']!.find(item => item.key === route.query.tab)?.key ?? 'position'
    }
    const rawCandidate = isList.value ? route.query.type : route.query.section
    // 兼容旧公告链接，改为共用资料页；旧提醒链接在关注入口保留。
    const candidate = rawCandidate === 'events' && routeName.value !== 'notifications' ? 'documents' : rawCandidate
    // 兼容旧的单基金持仓链接；普通模块入口默认进入总览。
    if (routeName.value === 'portfolio-snapshot' && candidate == null
      && /^\d{6}$/.test(String(route.query.fundCode ?? ''))) return 'holdings'
    return sections.value.find((item) => item.key === candidate)?.key ?? sections.value[0]?.key ?? ''
  })
  const sectionLabel = computed(() => sections.value.find((item) => item.key === section.value)?.label ?? '')
  const holdingMaterialSection = computed(() => isHoldingDetail.value && section.value.startsWith(holdingMaterialPrefix)
    ? section.value.slice(holdingMaterialPrefix.length) : '')
  const moduleLabel = computed(() => moduleNames[routeName.value] ?? String(route.meta.title ?? '基金雷达'))
  const returnTarget = computed(() => {
    if (routeName.value === 'fund-manager-detail') return managerReturnPath(route.query.from)
    if (routeName.value === 'manager-related-fund') return managerReturnPath(route.query.from, `/fund-managers/${route.params.managerId}`)
    if (routeName.value === 'fund-detail' && typeof route.query.from === 'string'
      && route.query.from.startsWith('/fund-managers')) return managerReturnPath(route.query.from)
    // 收益明细属于“我的持仓”的同级菜单，通过子菜单切换，不重复显示模块返回入口。
    if (routeName.value === 'portfolio-earnings') return null
    if ((routeName.value === 'watchlist-fund-detail' || routeName.value === 'portfolio-snapshot')
      && typeof route.query.from === 'string' && route.query.from.split('?')[0] === '/portfolio') return portfolioReturnPath(route.query.from)
    // 从顶栏直接进入持仓分析时没有来源页，不显示返回链接。
    if (routeName.value === 'portfolio-advice') {
      return typeof route.query.from === 'string' ? portfolioReturnPath(route.query.from) : null
    }
    if (routeName.value === 'watchlist-fund-detail') return listReturnTarget(route.query.from, '/watchlist')
    if (routeName.value === 'fund-detail') return listReturnTarget(route.query.from, '/funds')
    return null
  })
  const returnLabel = computed(() => typeof route.query.from === 'string' && route.query.from.split('?')[0] === '/portfolio'
    ? '我的持仓' : returnLabels[routeName.value] ?? moduleLabel.value)
  function sectionTarget(key: string): RouteLocationRaw {
    if (isHoldingDetail.value) {
      if (key === section.value) return route.fullPath
      if (key.startsWith(holdingMaterialPrefix)) {
        const material = key.slice(holdingMaterialPrefix.length)
        return { path: route.path, query: { tab: 'materials', material: material === 'basic' ? undefined : material, from: route.query.from } }
      }
      return { path: route.path, query: { tab: key === 'position' ? undefined : key, from: route.query.from } }
    }
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
      if (routeName.value === 'notifications'
        && (['rules', 'holding-rules'].includes(key) || section.value === 'holding-rules')) delete query.fund
      if (routeName.value === 'portfolio-snapshot' && key !== 'holdings') delete query.holding
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
  return { sections, section, sectionLabel, holdingMaterialSection, moduleLabel, returnTarget, returnLabel, sectionTarget }
}

// 开发时导航表被多个已挂载页面引用，局部热更新可能使侧栏与正文使用不同版本。
// 导航规则变更后统一重载，保留当前地址，重新建立整页的栏目状态。
if (import.meta.hot) {
  import.meta.hot.accept(() => { globalThis.location.reload() })
}
