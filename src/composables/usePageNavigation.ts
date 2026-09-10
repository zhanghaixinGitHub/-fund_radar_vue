import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { LocationQuery, RouteLocationRaw } from 'vue-router'

import { fundTypeOptions } from '@/utils/fundPresentation'

export interface PageSection {
  key: string
  label: string
  group?: string
}

const pageSections: Record<string, PageSection[]> = {
  'watchlist-fund-detail': [
    { key: 'overview', label: '资料概览', group: '关注资料' },
    { key: 'basic', label: '基础资料' },
    { key: 'nav', label: '净值走势' },
    { key: 'manager', label: '基金经理' },
    { key: 'share', label: '份额规模' },
    { key: 'dividend', label: '分红记录' },
    { key: 'research', label: '模型分析', group: '研究参考' },
  ],
  'fund-detail': [
    { key: 'overview', label: '基金概览', group: '基金资料' },
    { key: 'basic', label: '基础资料' },
    { key: 'nav', label: '净值走势' },
    { key: 'comparison', label: '同类对比' },
    { key: 'events', label: '关联事件' },
    { key: 'research', label: '研究分析', group: '分析与提醒' },
    { key: 'rules', label: '提醒规则' },
  ],
  'portfolio-snapshot': [
    { key: 'holdings', label: '持仓' },
    { key: 'plans', label: '定投计划' },
    { key: 'orders', label: '交易记录' },
  ],
  'portfolio-confirmed-snapshot': [
    { key: 'overview', label: '持仓概览' },
    { key: 'holdings', label: '持仓明细' },
    { key: 'source', label: '数据说明' },
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
    { key: 'marketDetail', label: '完整资料同步' },
    { key: 'freeDataCompletion', label: '免费数据补齐' },
    { key: 'featureSnapshot', label: '特征快照同步' },
    { key: 'notes', label: '运行说明', group: '帮助' },
  ],
  'admin-users': [
    { key: 'accounts', label: '账户列表' },
    { key: 'credits', label: '关注积分' },
    { key: 'migration', label: '历史关注迁移' },
  ],
}

const moduleNames: Record<string, string> = {
  'fund-market': '基金市场', 'fund-detail': '基金市场',
  watchlist: '我的关注', 'watchlist-fund-detail': '我的关注',
  'portfolio-snapshot': '我的持仓', notifications: '站内提醒', profile: '个人信息',
  'admin-dashboard': '工作台', 'admin-sync-center': '数据同步', 'admin-users': '用户管理',
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
  return { path: listPath, query }
}

/** 顶栏、左侧导航和页面共用同一份子页定义；未知参数回落到首项。 */
export function usePageNavigation() {
  const route = useRoute()
  const routeName = computed(() => String(route.name ?? ''))
  const isList = computed(() => ['fund-market', 'watchlist'].includes(routeName.value))
  const sections = computed<PageSection[]>(() => isList.value
    ? [{ key: 'all', label: routeName.value === 'watchlist' ? '全部关注' : '全部基金' },
      ...fundTypeOptions.map((type, index) => ({ key: type.value, label: type.label, group: index === 0 ? '按基金类型' : undefined }))]
    : pageSections[routeName.value] ?? [])
  const section = computed(() => {
    const candidate = isList.value ? route.query.type : route.query.section
    return sections.value.find((item) => item.key === candidate)?.key ?? sections.value[0]?.key ?? ''
  })
  const sectionLabel = computed(() => sections.value.find((item) => item.key === section.value)?.label ?? '')
  const moduleLabel = computed(() => moduleNames[routeName.value] ?? String(route.meta.title ?? '基金雷达'))
  const returnTarget = computed(() => {
    if (routeName.value === 'watchlist-fund-detail') return listReturnTarget(route.query.from, '/watchlist')
    if (routeName.value === 'fund-detail') return listReturnTarget(route.query.from, '/funds')
    return null
  })
  function sectionTarget(key: string): RouteLocationRaw {
    const query: LocationQuery = { ...route.query }
    if (isList.value) {
      delete query.page
      delete query.section
      if (key === 'all') delete query.type
      else query.type = key
    } else {
      query.section = key
      delete query.user
      delete query.tab
    }
    return { path: route.path, query }
  }
  return { sections, section, sectionLabel, moduleLabel, returnTarget, sectionTarget }
}
