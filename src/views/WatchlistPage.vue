<script setup lang="ts">
import ListPagination from '@/components/ListPagination.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SimulationFundActions from '@/components/SimulationFundActions.vue'

import { useWatchlist } from '@/composables/useWatchlist'
import type { WatchlistItem } from '@/types/watchlist'
import {
  changeRateTone,
  formatChangeRate,
  fundTypeLabel,
} from '@/utils/fundPresentation'

/** 当前登录用户的关注列表页面；数据范围、类型排序与基金摘要均由服务端统一控制。 */
const {
  currentPage,
  errorMessage,
  heldOnly,
  keyword,
  loading,
  marketDataUnavailable,
  pageSize,
  quota,
  search,
  totalCount,
  watchlist,
} = useWatchlist()
const route = useRoute()

/** 后端先按类型、再按关注时间稳定排序；页面按同样顺序展示分组。 */
const watchlistGroups = computed(() => {
  const groups = new Map<string, WatchlistItem[]>()
  for (const item of watchlist.value) {
    const items = groups.get(item.fundType) ?? []
    items.push(item)
    groups.set(item.fundType, items)
  }
  return [...groups.entries()].map(([fundType, items]) => ({ fundType, items }))
})

</script>

<template>
  <section
    class="watchlist-page"
    aria-labelledby="watchlist-title"
  >
    <p class="eyebrow">
      我的关注
    </p>
    <h1 id="watchlist-title">
      关注列表
    </h1>
    <p class="lead">
      按类型查看已关注基金的单位净值变化，不含分红和买卖费用，不能当作总收益。
    </p>
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

    <form
      class="search-panel watchlist-search-panel"
      @submit.prevent="search"
    >
      <div class="watchlist-keyword-filter">
        <label for="watchlist-keyword">基金代码或名称</label>
        <div class="search-row">
          <input
            id="watchlist-keyword"
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
      </div>
      <div class="watchlist-held-filter">
        <label for="watchlist-held">持仓状态</label>
        <div class="watchlist-held-control">
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
      </div>
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
    <div
      v-else
      aria-live="polite"
    >
      <section
        v-for="group in watchlistGroups"
        :key="group.fundType"
        class="fund-type-group"
        :aria-labelledby="`watchlist-type-${group.fundType}`"
      >
        <h2 :id="`watchlist-type-${group.fundType}`">
          {{ fundTypeLabel(group.fundType) }}
        </h2>
        <ul class="watchlist-items">
          <li
            v-for="item in group.items"
            :key="item.fundCode"
          >
            <RouterLink
              class="watchlist-card"
              :to="{ name: 'watchlist-fund-detail', params: { fundCode: item.fundCode }, query: { from: route.fullPath } }"
            >
              <span class="fund-code">{{ item.fundCode }}</span>
              <span class="fund-primary">
                <strong>{{ item.fundName }}</strong>
                <span class="as-of-date">数据截至：{{ item.asOfDate || '尚无合规净值同步' }}</span>
              </span>
              <span
                class="change-rate-list"
                aria-label="单位净值变化"
              >
                <span :class="['change-rate', changeRateTone(item.dayChangeRate)]">最新净值日 {{ formatChangeRate(item.dayChangeRate) }}</span>
                <span :class="['change-rate', changeRateTone(item.weekChangeRate)]">近一周 {{ formatChangeRate(item.weekChangeRate) }}</span>
                <span :class="['change-rate', changeRateTone(item.monthChangeRate)]">近一月 {{ formatChangeRate(item.monthChangeRate) }}</span>
              </span>
            </RouterLink>
            <SimulationFundActions :fund-code="item.fundCode" />
          </li>
        </ul>
      </section>
    </div>
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
</template>

<style scoped>
.watchlist-search-panel { grid-template-columns: minmax(0, 1fr) minmax(180px, 280px); gap: 24px; align-items: end; }
.watchlist-keyword-filter, .watchlist-held-filter { display: grid; gap: 10px; min-width: 0; }
.watchlist-keyword-filter { max-width: 660px; }
.watchlist-held-control { position: relative; display: flex; }
.watchlist-held-filter select { flex: 1; width: 100%; min-width: 0; min-height: 44px; padding: 10px 64px 10px 12px; color: #17332e; font: inherit; background: #fff; border: 1px solid #b9d5c5; border-radius: 10px; }
.watchlist-held-clear { position: absolute; top: 50%; right: 28px; display: grid; place-items: center; width: 24px; height: 28px; padding: 0; color: #38639b; font-size: 20px; font-weight: 700; line-height: 1; background: transparent; border: 0; border-radius: 4px; transform: translateY(-50%); cursor: pointer; }
.watchlist-held-clear:hover:not(:disabled) { color: #1b457e; }
.watchlist-held-clear:disabled { opacity: .65; cursor: wait; }
.watchlist-held-filter select:focus-visible, .watchlist-held-clear:focus-visible { outline: 2px solid #0f766e; outline-offset: 3px; }
@media (max-width: 900px) {
  .watchlist-search-panel { grid-template-columns: 1fr; gap: 16px; }
  .watchlist-keyword-filter { max-width: none; }
}
</style>
