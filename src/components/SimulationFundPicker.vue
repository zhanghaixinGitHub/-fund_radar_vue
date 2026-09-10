<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { getFunds } from '@/api/funds'
import { getWatchlist } from '@/api/watchlist'

const emit = defineEmits<{ close: []; select: [fundCode: string] }>()
const dialog = ref<InstanceType<typeof globalThis.HTMLDialogElement> | null>(null)
const source = ref<'watchlist' | 'market'>('watchlist')
const keyword = ref('')
const page = ref(1)
const total = ref(0)
const items = ref<{ fundCode: string; fundName: string }[]>([])
const loading = ref(false)
const error = ref('')
let request = 0
let alive = true
async function load(reset = false) {
  if (reset) page.value = 1
  const current = ++request
  loading.value = true; error.value = ''; items.value = []
  try {
    const result = await (source.value === 'watchlist' ? getWatchlist : getFunds)({ keyword: keyword.value, page: page.value, pageSize: 10 })
    if (alive && current === request) { items.value = result.items; total.value = result.totalCount ?? result.items.length }
  } catch (reason) { if (alive && current === request) error.value = reason instanceof Error ? reason.message : '加载失败。' }
  finally { if (alive && current === request) loading.value = false }
}
function switchSource(value: 'watchlist' | 'market') { source.value = value; void load(true) }
function move(delta: number) { page.value += delta; void load() }
onMounted(() => { dialog.value?.showModal(); void load() })
onBeforeUnmount(() => { alive = false; dialog.value?.close() })
</script>

<template>
  <dialog
    ref="dialog"
    class="sim-dialog"
    aria-labelledby="sim-picker-title"
    @cancel.prevent="emit('close')"
  >
    <header class="sim-dialog-header">
      <h2 id="sim-picker-title">
        选择基金
      </h2><button
        class="secondary-button"
        type="button"
        @click="emit('close')"
      >
        关闭
      </button>
    </header>
    <div
      class="sim-actions"
      aria-label="选择来源"
    >
      <button
        class="secondary-button"
        type="button"
        :aria-pressed="source === 'watchlist'"
        @click="switchSource('watchlist')"
      >
        我的关注
      </button>
      <button
        class="secondary-button"
        type="button"
        :aria-pressed="source === 'market'"
        @click="switchSource('market')"
      >
        基金市场
      </button>
    </div>
    <form
      class="sim-picker-search"
      @submit.prevent="load(true)"
    >
      <label for="sim-search">代码或名称</label><div class="sim-actions">
        <input
          id="sim-search"
          v-model="keyword"
          maxlength="50"
          type="search"
          placeholder="输入基金代码或名称"
        ><button
          class="primary-button"
          type="submit"
          :disabled="loading"
        >
          搜索
        </button>
      </div>
    </form>
    <p
      v-if="loading"
      role="status"
    >
      正在加载…
    </p>
    <p
      v-else-if="error"
      class="error-message"
      role="alert"
    >
      {{ error }}
    </p>
    <p v-else-if="items.length === 0">
      暂无匹配基金。{{ source === 'watchlist' ? '可以切换到基金市场搜索。' : '' }}
    </p>
    <ul
      v-else
      class="sim-picker-list"
    >
      <li
        v-for="fund in items"
        :key="fund.fundCode"
      >
        <button
          type="button"
          @click="emit('select', fund.fundCode)"
        >
          <strong>{{ fund.fundName }}</strong><span>{{ fund.fundCode }} →</span>
        </button>
      </li>
    </ul>
    <nav
      class="sim-pagination"
      aria-label="基金选择分页"
    >
      <button
        class="secondary-button"
        type="button"
        :disabled="loading || page <= 1"
        @click="move(-1)"
      >
        上一页
      </button><span>第 {{ page }} 页</span><button
        class="secondary-button"
        type="button"
        :disabled="loading || page * 10 >= total"
        @click="move(1)"
      >
        下一页
      </button>
    </nav>
  </dialog>
</template>
