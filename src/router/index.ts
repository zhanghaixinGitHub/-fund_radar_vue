import { createRouter, createWebHistory } from 'vue-router'

import NotFoundPage from '@/views/NotFoundPage.vue'
import FundDetailPage from '@/views/FundDetailPage.vue'
import FundMarketPage from '@/views/FundMarketPage.vue'
import SystemHealthPage from '@/views/SystemHealthPage.vue'
import PortfolioSnapshotPage from '@/views/PortfolioSnapshotPage.vue'
import SyncCenterPage from '@/views/SyncCenterPage.vue'

/**
 * 前端路由表。
 *
 * 定义系统状态、基金列表、基金详情及未匹配地址的页面映射；页面只经 Java 核心服务访问业务数据。
 */
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'system-health',
      component: SystemHealthPage,
      meta: { title: '系统状态' },
    },
    {
      path: '/funds',
      name: 'fund-market',
      component: FundMarketPage,
      meta: { title: '重点基金清单' },
    },
    {
      path: '/funds/:fundCode',
      name: 'fund-detail',
      component: FundDetailPage,
      meta: { title: '基金详情' },
    },
    {
      path: '/portfolio',
      name: 'portfolio-snapshot',
      component: PortfolioSnapshotPage,
      meta: { title: '持仓快照' },
    },
    {
      path: '/sync-center',
      name: 'sync-center',
      component: SyncCenterPage,
      meta: { title: '数据同步中心' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundPage,
      meta: { title: '页面不存在' },
    },
  ],
})

/** 根据当前页面的路由元数据更新浏览器标题。 */
router.afterEach((to) => {
  document.title = `${String(to.meta.title ?? '重点基金雷达')} · 重点基金雷达`
})
