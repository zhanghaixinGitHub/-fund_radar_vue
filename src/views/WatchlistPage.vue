<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { getWatchlist } from '@/api/watchlist'
import type { WatchlistItem } from '@/types/watchlist'

/**
 * 当前登录用户的关注列表页面。
 *
 * 关注接口仅返回基金代码和关注时间；页面直接展示这两个已确认字段并链接详情，
 * 不为每一行额外查询基金详情，避免关注项增多时形成 N+1 请求。
 */
const watchlist = ref<WatchlistItem[]>([])
const loading = ref(false)
const errorMessage = ref('')

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

/** 加载当前登录用户的关注项；失败时保留空列表并展示可操作错误信息。 */
async function loadWatchlist(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  try {
    watchlist.value = await getWatchlist()
  } catch (error) {
    watchlist.value = []
    errorMessage.value = error instanceof Error ? error.message : '关注列表暂时不可用。'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadWatchlist()
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
      从基金市场或基金详情中加入关注的基金会集中显示在这里，方便后续查看净值、事件和提醒。
    </p>
    <p class="notice-banner">
      每个登录账号仅能查看和维护自己名下的关注基金；账户、角色与数据范围由服务端统一控制。
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
        @click="loadWatchlist"
      >
        重新加载
      </button>
    </div>
    <div
      v-else-if="watchlist.length === 0"
      class="watchlist-state"
    >
      <h2>还没有关注基金</h2>
      <p>前往基金市场，打开一只基金详情后点击“加入关注”。</p>
      <RouterLink
        class="primary-link"
        to="/funds"
      >
        前往基金市场
      </RouterLink>
    </div>
    <ul
      v-else
      class="watchlist-items"
      aria-live="polite"
    >
      <li
        v-for="item in watchlist"
        :key="item.fundCode"
      >
        <RouterLink
          class="watchlist-card"
          :to="`/funds/${item.fundCode}`"
        >
          <span class="fund-code">{{ item.fundCode }}</span>
          <strong>查看基金详情</strong>
          <time :datetime="item.createdAt">关注于 {{ formatCreatedAt(item.createdAt) }}</time>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
