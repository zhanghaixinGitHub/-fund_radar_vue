<script setup lang="ts">
import FundListTable from '@/components/FundListTable.vue'
import FundQuickDrawer from '@/components/FundQuickDrawer.vue'
import ListPagination from '@/components/ListPagination.vue'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useWatchlist } from '@/composables/useWatchlist'

/** 当前登录用户的关注列表页面；数据范围、类型排序与基金摘要均由服务端统一控制。 */
const {
  currentPage,
  errorMessage,
  heldOnly,
  keyword,
  loadPage,
  loading,
  marketDataUnavailable,
  pageSize,
  quota,
  search,
  totalCount,
  watchlist,
} = useWatchlist()
const route = useRoute()
const router = useRouter()
const quickCode = ref('')

async function resetFilters(): Promise<void> {
  keyword.value = ''
  heldOnly.value = true
  if (route.fullPath === route.path) await search()
  else await router.push({ path: route.path })
}


</script>

<template>
  <section
    class="watchlist-page"
    aria-labelledby="watchlist-title"
  >
    <h1 id="watchlist-title" class="visually-hidden">
      关注列表
    </h1>
    <p class="notice-banner">
      每个登录账号仅能查看和维护自己名下的关注基金；账户、角色与数据范围由服务端统一控制。
    </p>
    <section
      v-if="quota"
      class="watchlist-quota-card"
      aria-label="关注额度"
    >
      <span>关注额度</span>
      <strong>{{ quota.activeWatchlistCount }} / {{ quota.maxActiveWatchlistCount }}</strong>
      <p>
        免费 {{ quota.freeWatchlistLimit }} 个；试用关注积分可用 {{ quota.trialCreditAvailable }} 个，已锁定 {{ quota.trialCreditLocked }} 个。
      </p>
    </section>

    <section
      class="fund-results-panel"
      aria-label="关注的基金"
    >
      <h2 class="fund-results-title">
        关注的基金
      </h2>
      <form
        class="fund-filter-toolbar"
        :aria-busy="loading"
        @submit.prevent="search"
      >
        <div class="fund-filter-search">
          <label
            class="visually-hidden"
            for="watchlist-keyword"
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
            id="watchlist-keyword"
            v-model="keyword"
            maxlength="50"
            placeholder="搜索基金名称 / 代码"
            type="search"
          >
        </div>
        <div class="fund-filter-select">
          <label
            class="visually-hidden"
            for="watchlist-held"
          >持仓状态</label>
          <select
            id="watchlist-held"
            v-model="heldOnly"
            :disabled="loading"
            @change="search"
          >
            <option :value="false">
              全部关注
            </option>
            <option :value="true">
              已持仓
            </option>
          </select>
          <button
            v-if="heldOnly"
            class="watchlist-held-clear"
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
        v-if="marketDataUnavailable && !errorMessage"
        class="notice-banner warning-banner"
        role="status"
      >
        行情摘要暂时不可用，仍显示你的关注记录；涨跌率将在行情服务恢复后补齐。
      </p>
      <p
        v-if="loading"
        class="state-message"
        role="status"
      >
        正在加载关注列表…
      </p>
      <div
        v-else-if="errorMessage"
        class="watchlist-state error-message"
        role="alert"
      >
        <p>{{ errorMessage }}</p>
        <button
          class="secondary-button"
          type="button"
          @click="search"
        >
          重新加载
        </button>
      </div>
      <div
        v-else-if="watchlist.length === 0"
        class="watchlist-state"
      >
        <h2>还没有符合条件的关注基金</h2>
        <p>可以调整搜索关键词或类型筛选，或前往基金市场后在基金详情中加入关注。</p>
        <RouterLink
          class="primary-link"
          to="/funds"
        >
          前往基金市场
        </RouterLink>
      </div>
      <FundListTable
        v-else
        :items="watchlist"
        :watched="true"
        label="我的关注列表"
        @quick="quickCode = $event"
      />
      <ListPagination
        v-if="!loading && !errorMessage && watchlist.length > 0"
        :page="currentPage"
        :page-size="pageSize"
        :total="totalCount"
        :loading="loading"
        label="关注列表分页"
        @change="(page, size) => { pageSize = size; loadPage(page) }"
      />
    </section>
    <FundQuickDrawer
      v-if="quickCode"
      :code="quickCode"
      :watched="true"
      @close="quickCode = ''"
    />
  </section>
</template>
