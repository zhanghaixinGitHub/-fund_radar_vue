import { createRouter, createWebHistory } from 'vue-router'

import NotFoundPage from '@/views/NotFoundPage.vue'
import SystemHealthPage from '@/views/SystemHealthPage.vue'

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
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundPage,
      meta: { title: '页面不存在' },
    },
  ],
})

router.afterEach((to) => {
  document.title = `${String(to.meta.title ?? '全市场基金雷达')} · 全市场基金雷达`
})
