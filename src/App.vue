<script setup lang="ts">
/**
 * 全市场基金雷达的根布局组件。
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
        <span>全市场基金雷达</span>
      </RouterLink>
      <nav aria-label="主导航">
        <RouterLink to="/funds">
          基金市场
        </RouterLink>
      </nav>
      <span class="stage-label">M1 · 基础看板</span>
    </header>

    <main class="page-content">
      <RouterView />
    </main>
  </div>
</template>
