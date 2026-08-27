<script setup lang="ts">
/**
 * 重点基金雷达的根布局组件。
 *
 * 负责提供全局顶部导航和页面内容容器，具体页面由 RouterView 根据路由渲染。
 */
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <header class="top-bar">
      <RouterLink
        class="brand"
        to="/"
      >
        <span
          class="brand-mark"
          aria-hidden="true"
        >◒</span>
        <span>重点基金雷达</span>
      </RouterLink>
      <nav aria-label="主导航">
        <RouterLink to="/funds">
          重点基金
        </RouterLink>
        <RouterLink to="/portfolio">
          持仓快照
        </RouterLink>
        <RouterLink to="/sync-center">
          数据同步
        </RouterLink>
      </nav>
      <span class="stage-label">本机数据链路</span>
    </header>

    <main class="page-content">
      <RouterView />
    </main>
  </div>
</template>
