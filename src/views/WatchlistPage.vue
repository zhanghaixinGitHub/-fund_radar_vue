<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { useWatchlist } from '@/composables/useWatchlist'
import type { WatchlistItem } from '@/types/watchlist'
import {
  changeRateTone,
  formatChangeRate,
  fundTypeLabel,
  fundTypeOptions,
} from '@/utils/fundPresentation'

/** 当前登录用户的关注列表页面；数据范围、类型排序与基金摘要均由服务端统一控制。 */
const {
  changePageSize,
  currentPage,
  errorMessage,
  goToPage,
  hasNextPage,
  hasPreviousPage,
  loading,
  marketDataUnavailable,
  nextPage,
  pageInput,
  pageSize,
  pageSizeOptions,
  previousPage,
  quota,
  search,
  selectedFundType,
  totalCount,
  totalPages,
  watchlist,
} = useWatchlist()

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

/** 将服务端时间安全地格式化为本机可读文本；非法时间保留原始值以避免伪造时间。 */
function formatCreatedAt(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}

onMounted(() => {
  void search()
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
      已关注基金会按类型归类显示，方便查看最近已同步净值计算的阶段涨跌率。
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
      class="search-panel watchlist-filter-panel"
      @submit.prevent="search"
    >
      <label for="watchlist-type-filter">基金类型</label>
      <div class="search-row">
        <select
          id="watchlist-type-filter"
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
        <button
          class="primary-button"
          :disabled="loading"
          type="submit"
        >
          {{ loading ? '查询中…' : '筛选关注' }}
        </button>
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
      <p>可以调整类型筛选，或前往基金市场后在基金详情中加入关注。</p>
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
              :to="`/funds/${item.fundCode}`"
            >
              <span class="fund-code">{{ item.fundCode }}</span>
              <span class="fund-primary">
                <strong>{{ item.fundName }}</strong>
                <span class="as-of-date">数据截至：{{ item.asOfDate || '尚无合规净值同步' }}</span>
              </span>
              <span
                class="change-rate-list"
                aria-label="净值涨跌率"
              >
                <span :class="['change-rate', changeRateTone(item.dayChangeRate)]">昨日 {{ formatChangeRate(item.dayChangeRate) }}</span>
                <span :class="['change-rate', changeRateTone(item.weekChangeRate)]">近一周 {{ formatChangeRate(item.weekChangeRate) }}</span>
                <span :class="['change-rate', changeRateTone(item.monthChangeRate)]">近一月 {{ formatChangeRate(item.monthChangeRate) }}</span>
              </span>
              <time :datetime="item.createdAt">关注于 {{ formatCreatedAt(item.createdAt) }}</time>
            </RouterLink>
          </li>
        </ul>
      </section>
    </div>
    <nav
      v-if="!loading && !errorMessage && watchlist.length > 0"
      class="pagination"
      aria-label="关注列表分页"
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
          for="watchlist-page-size"
        >
          每页
          <select
            id="watchlist-page-size"
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
          for="watchlist-page-jump"
        >
          跳至
          <input
            id="watchlist-page-jump"
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
