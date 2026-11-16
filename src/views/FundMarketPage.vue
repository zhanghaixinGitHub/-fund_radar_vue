<script setup lang="ts">
import FundListTable from '@/components/FundListTable.vue'
import FundQuickDrawer from '@/components/FundQuickDrawer.vue'
import ListPagination from '@/components/ListPagination.vue'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useFundMarket } from '@/composables/useFundMarket'
import FundRatingBadge from '@/components/FundRatingBadge.vue'
import { ratingFilterOptions } from '@/utils/fundRating'

/**
 * 基金市场页面。
 *
 * 首次进入时加载基金列表，并将搜索、分页和请求状态委托给 useFundMarket 统一管理。
 */
const {
  cachedAt,
  currentPage,
  errorMessage,
  funds,
  heldOnly,
  keyword,
  loading,
  loadPage,
  pageSize,
  search,
  selectedRating,
  stale,
  totalCount,
  watchedOnly,
} = useFundMarket()
const route = useRoute()
const router = useRouter()
const quickCode = ref('')

async function resetFilters(): Promise<void> {
  keyword.value = ''
  heldOnly.value = true
  selectedRating.value = ''
  watchedOnly.value = false
  if (route.fullPath === route.path) await search()
  else await router.push({ path: route.path })
}

/** 清除评级并从第一页查询，名称关键字及基金类型继续沿用当前条件。 */
async function clearRating(): Promise<void> {
  if (loading.value) return
  selectedRating.value = ''
  await search()
}


</script>

<template>
  <section
    class="market-page"
    aria-labelledby="market-title"
  >
    <h1 id="market-title" class="visually-hidden">
      基金市场
    </h1>
    <p
      v-if="stale"
      class="notice-banner"
      role="status"
    >
      数据暂时无法更新，当前展示之前保存的资料（保存时间：{{ cachedAt || '未知' }}）。
    </p>

    <section
      class="fund-results-panel"
      aria-label="基金列表"
    >
      <h2 class="fund-results-title">
        基金列表
      </h2>
      <form
        class="fund-filter-toolbar"
        :aria-busy="loading"
        @submit.prevent="search"
      >
        <div class="fund-filter-search">
          <label
            class="visually-hidden"
            for="fund-keyword"
          >基金代码或名称</label>
          <svg
            class="fund-filter-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            aria-hidden="true"
          ><circle
            cx="10.5"
            cy="10.5"
            r="6.5"
          /><path d="m15.5 15.5 4.5 4.5" /></svg>
          <input
            id="fund-keyword"
            v-model="keyword"
            maxlength="50"
            placeholder="搜索基金名称 / 代码"
            type="search"
          >
        </div>
        <div class="fund-filter-select">
          <label
            class="visually-hidden"
            for="fund-rating"
          >基金评级</label>
          <select
            id="fund-rating"
            v-model="selectedRating"
            :disabled="loading"
            @change="search"
          >
            <option value="">
              全部评级
            </option>
            <option
              v-for="option in ratingFilterOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
          <button
            v-if="selectedRating !== ''"
            class="market-rating-clear"
            :disabled="loading"
            type="button"
            aria-label="查询全部评级"
            title="查询全部评级"
            @click="clearRating"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div class="fund-filter-select">
          <label
            class="visually-hidden"
            for="fund-watched"
          >关注状态</label>
          <select
            id="fund-watched"
            v-model="watchedOnly"
            :disabled="loading"
            @change="search"
          >
            <option :value="false">
              全部基金
            </option>
            <option :value="true">
              已关注
            </option>
          </select>
          <button
            v-if="watchedOnly"
            class="market-rating-clear"
            :disabled="loading"
            type="button"
            aria-label="清除关注筛选"
            title="清除关注筛选"
            @click="watchedOnly = false; search()"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div class="fund-filter-select">
          <label
            class="visually-hidden"
            for="fund-held"
          >持仓状态</label>
          <select
            id="fund-held"
            v-model="heldOnly"
            :disabled="loading"
            @change="search"
          >
            <option :value="false">
              全部基金
            </option>
            <option :value="true">
              已持仓
            </option>
          </select>
          <button
            v-if="heldOnly"
            class="market-rating-clear"
            :disabled="loading"
            type="button"
            aria-label="清除持仓筛选"
            title="清除持仓筛选"
            @click="heldOnly = false; search()"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <button
          class="secondary-button fund-filter-submit"
          :disabled="loading"
          type="submit"
        >
          {{ loading ? '查询中' : '查询' }}
        </button>
        <button
          class="secondary-button fund-filter-reset"
          :disabled="loading"
          type="button"
          @click="resetFilters"
        >
          重置
        </button>
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
        暂无可展示基金（共 {{ totalCount }} 条），可调整查询条件或稍后重试。
      </p>
      <FundListTable
        v-else
        :items="funds"
        label="基金市场列表"
        @quick="quickCode = $event"
      >
        <template #rating="{ fund }">
          <FundRatingBadge :value="fund.rating" />
        </template>
      </FundListTable>
      <ListPagination
        v-if="!loading && !errorMessage && funds.length > 0"
        :page="currentPage"
        :page-size="pageSize"
        :total="totalCount"
        :loading="loading"
        label="基金列表分页"
        @change="(page, size) => { pageSize = size; loadPage(page) }"
      />
    </section>
    <FundQuickDrawer
      v-if="quickCode"
      :code="quickCode"
      @close="quickCode = ''"
    />
  </section>
</template>
