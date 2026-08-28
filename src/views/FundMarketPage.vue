<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { useFundMarket } from '@/composables/useFundMarket'
import {
  changeRateTone,
  formatChangeRate,
  fundStatusLabel,
  fundTypeLabel,
  fundTypeOptions,
  shouldDisplayFundStatus,
} from '@/utils/fundPresentation'

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
  selectedFundType,
  stale,
  totalCount,
  totalPages,
} = useFundMarket()

/** 后端已按基金类型稳定排序；此处只把相邻类型组织为可读的分组。 */
const fundGroups = computed(() => {
  const groups = new Map<string, typeof funds.value>()
  for (const fund of funds.value) {
    const items = groups.get(fund.fundType) ?? []
    items.push(fund)
    groups.set(fund.fundType, items)
  }
  return [...groups.entries()].map(([fundType, items]) => ({ fundType, items }))
})

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
      当前展示基金市场中已完成同步与校验的基金；净值以已授权数据源的最近同步结果为准。
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
      <label for="fund-type-filter">基金类型</label>
      <select
        id="fund-type-filter"
        v-model="selectedFundType"
        :disabled="loading"
        @change="search"
      >
        <option value="">
          全部类型
        </option>
        <option
          v-for="option in fundTypeOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
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
      暂无可展示基金（共 {{ totalCount }} 条）。请先完成基金市场同步后重新查询。
    </p>
    <div
      v-else
      aria-live="polite"
    >
      <section
        v-for="group in fundGroups"
        :key="group.fundType"
        class="fund-type-group"
        :aria-labelledby="`market-type-${group.fundType}`"
      >
        <h2 :id="`market-type-${group.fundType}`">
          {{ fundTypeLabel(group.fundType) }}
        </h2>
        <ul class="fund-list">
          <li
            v-for="fund in group.items"
            :key="fund.fundCode"
          >
            <RouterLink
              class="fund-card"
              :to="`/funds/${fund.fundCode}`"
            >
              <span class="fund-code">{{ fund.fundCode }}</span>
              <span class="fund-primary">
                <strong>{{ fund.fundName }}</strong>
                <span class="fund-tags">
                  <span
                    v-if="shouldDisplayFundStatus(fund.status)"
                    class="fund-status-tag"
                  >
                    {{ fundStatusLabel(fund.status) }}
                  </span>
                  <span
                    v-if="fund.isWatched"
                    class="watched-tag"
                  >
                    已关注
                  </span>
                </span>
              </span>
              <span
                class="change-rate-list"
                aria-label="净值涨跌率"
              >
                <span :class="['change-rate', changeRateTone(fund.dayChangeRate)]">昨日 {{ formatChangeRate(fund.dayChangeRate) }}</span>
                <span :class="['change-rate', changeRateTone(fund.weekChangeRate)]">近一周 {{ formatChangeRate(fund.weekChangeRate) }}</span>
                <span :class="['change-rate', changeRateTone(fund.monthChangeRate)]">近一月 {{ formatChangeRate(fund.monthChangeRate) }}</span>
              </span>
              <span class="as-of-date">数据截至：{{ fund.asOfDate || '尚无合规净值同步' }}</span>
            </RouterLink>
          </li>
        </ul>
      </section>
    </div>
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
