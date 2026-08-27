<script setup lang="ts">
/**
 * 基金雷达的根布局组件。
 *
 * 负责提供全局顶部导航和页面内容容器，具体页面由 RouterView 根据路由渲染。
 */
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <a
      class="skip-link"
      href="#main-content"
    >跳至正文</a>
    <header class="top-bar">
      <RouterLink
        class="brand"
        to="/"
      >
        <span
          class="brand-mark"
          aria-hidden="true"
        >◒</span>
        <span>基金雷达</span>
      </RouterLink>
      <nav aria-label="主导航">
        <RouterLink to="/funds">
          基金市场
        </RouterLink>
        <RouterLink to="/watchlist">
          我的关注
        </RouterLink>
        <RouterLink to="/portfolio">
          持仓快照
        </RouterLink>
        <RouterLink to="/sync-center">
          数据同步
        </RouterLink>
      </nav>
      <RouterLink
        class="stage-link"
        to="/system-health"
      >
        运行状态
      </RouterLink>
    </header>

    <main
      id="main-content"
      class="page-content"
      tabindex="-1"
    >
      <RouterView />
    </main>
  </div>
</template>
