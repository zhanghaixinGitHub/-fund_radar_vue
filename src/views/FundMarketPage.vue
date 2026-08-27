<script setup lang="ts">
import { onMounted } from 'vue'

import { useFundMarket } from '@/composables/useFundMarket'
import { fundStatusLabel, fundTypeLabel } from '@/utils/fundPresentation'

/**
 * 重点基金清单页面。
 *
 * 首次进入时加载基金列表，并将搜索、分页和请求状态委托给 useFundMarket 统一管理。
 */
const {
  cachedAt,
  currentPageIndex,
  errorMessage,
  funds,
  hasNextPage,
  hasPreviousPage,
  keyword,
  loading,
  nextPage,
  previousPage,
  search,
  stale,
} = useFundMarket()

/** 页面挂载后加载默认首页。 */
onMounted(() => {
  void search()
})
</script>

<template>
  <section
    class="market-page"
    aria-labelledby="market-title"
  >
    <p class="eyebrow">
      重点基金
    </p>
    <h1 id="market-title">
      重点基金清单
    </h1>
    <p class="lead">
      当前仅展示你确认的六只重点基金；不会把它们描述为全市场目录。真实历史净值来自已授权的 Tushare 同步结果。
    </p>
    <p
      v-if="stale"
      class="notice-banner"
      role="status"
    >
      分析服务暂不可用，当前展示缓存读模型（缓存时间：{{ cachedAt || '未知' }}）。
    </p>

    <form
      class="search-panel"
      @submit.prevent="search"
    >
      <label for="fund-keyword">基金代码或名称</label>
      <div class="search-row">
        <input
          id="fund-keyword"
          v-model="keyword"
          maxlength="50"
          placeholder="例如：000001"
          type="search"
        >
        <button
          class="primary-button"
          :disabled="loading"
          type="submit"
        >
          {{ loading ? '查询中…' : '查询基金' }}
        </button>
      </div>
    </form>

    <p
      v-if="errorMessage"
      class="state-message error-message"
      role="alert"
    >
      {{ errorMessage }}
    </p>
    <p
      v-else-if="!loading && funds.length === 0"
      class="state-message"
    >
      暂无可展示重点基金。请先执行受控重点清单同步后重新查询。
    </p>
    <ul
      v-else
      class="fund-list"
      aria-live="polite"
    >
      <li
        v-for="fund in funds"
        :key="fund.fundCode"
      >
        <RouterLink
          class="fund-card"
          :to="`/funds/${fund.fundCode}`"
        >
          <span class="fund-code">{{ fund.fundCode }}</span>
          <strong>{{ fund.fundName }}</strong>
          <span>{{ fundTypeLabel(fund.fundType) }} · {{ fundStatusLabel(fund.status) }}</span>
          <span>数据截至：{{ fund.asOfDate || '尚无合规净值同步' }}</span>
        </RouterLink>
      </li>
    </ul>
    <nav
      v-if="!loading && !errorMessage && funds.length > 0"
      class="pagination"
      aria-label="基金列表分页"
    >
      <button
        :disabled="!hasPreviousPage"
        type="button"
        @click="previousPage"
      >
        上一页
      </button>
      <span>第 {{ currentPageIndex + 1 }} 页</span>
      <button
        :disabled="!hasNextPage"
        type="button"
        @click="nextPage"
      >
        下一页
      </button>
    </nav>
  </section>
</template>
