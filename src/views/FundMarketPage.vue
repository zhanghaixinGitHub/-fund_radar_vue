<script setup lang="ts">
import { onMounted } from 'vue'

import { useFundMarket } from '@/composables/useFundMarket'
import { fundStatusLabel, fundTypeLabel } from '@/utils/fundPresentation'

/**
 * 基金市场页面。
 *
 * 首次进入时加载基金列表，并将搜索、分页和请求状态委托给 useFundMarket 统一管理。
 */
const {
  cachedAt,
  changePageSize,
  currentPage,
  errorMessage,
  funds,
  goToPage,
  hasNextPage,
  hasPreviousPage,
  keyword,
  loading,
  nextPage,
  pageInput,
  pageSize,
  pageSizeOptions,
  previousPage,
  search,
  stale,
  totalCount,
  totalPages,
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
      基金市场 · 试运行
    </p>
    <h1 id="market-title">
      基金市场
    </h1>
    <p class="lead">
      当前展示已完成同步与校验的重点基金，不将其描述为全市场目录；净值以已授权数据源的最近同步结果为准。
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
      暂无可展示基金（共 {{ totalCount }} 条）。请先完成受控基金同步后重新查询。
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
      <p
        class="pagination-summary"
        aria-live="polite"
      >
        共 {{ totalCount }} 条
      </p>
      <div class="pagination-controls">
        <label
          class="page-size-control"
          for="fund-page-size"
        >
          每页
          <select
            id="fund-page-size"
            v-model.number="pageSize"
            :disabled="loading"
            @change="changePageSize"
          >
            <option
              v-for="option in pageSizeOptions"
              :key="option"
              :value="option"
            >
              {{ option }}
            </option>
          </select>
          条
        </label>
        <button
          :disabled="loading || !hasPreviousPage"
          type="button"
          @click="previousPage"
        >
          上一页
        </button>
        <span class="page-position">第 {{ currentPage }} / {{ totalPages }} 页</span>
        <button
          :disabled="loading || !hasNextPage"
          type="button"
          @click="nextPage"
        >
          下一页
        </button>
        <label
          class="page-jump-control"
          for="fund-page-jump"
        >
          跳至
          <input
            id="fund-page-jump"
            v-model="pageInput"
            :disabled="loading"
            inputmode="numeric"
            min="1"
            :max="totalPages"
            step="1"
            type="number"
            @keyup.enter="goToPage"
          >
          页
        </label>
        <button
          :disabled="loading"
          type="button"
          @click="goToPage"
        >
          跳转
        </button>
      </div>
    </nav>
  </section>
</template>
