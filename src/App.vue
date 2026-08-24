<script setup lang="ts">
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
      <span class="stage-label">M0 · 工程基线</span>
    </header>

    <main class="page-content">
      <RouterView />
    </main>
  </div>
</template>
