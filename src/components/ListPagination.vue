<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { normalizePageSize, normalizePage } from '@/utils/pagination'

/** 所有列表沿用基金市场的分页入口；未提供总数的历史只展示已知页码，不能推算虚假总数。 */
const props = withDefaults(defineProps<{
  page: number
  pageSize: number
  total?: number
  hasNext?: boolean
  loading?: boolean
  label?: string
}>(), { total: undefined, hasNext: undefined, loading: false, label: '列表分页' })
const emit = defineEmits<{ change: [page: number, pageSize: number]; last: [] }>()
const id = useId()
const input = ref(String(props.page))
const pages = computed(() => props.total === undefined ? undefined : Math.max(1, Math.ceil(props.total / props.pageSize)))
const next = computed(() => props.hasNext ?? (pages.value !== undefined && props.page < pages.value))
watch(() => props.page, value => { input.value = String(value) })

/** 每次只提交一组页码和条数，切换条数从首页读取，避免两个独立事件触发重复请求。 */
function move(page: number, size = props.pageSize) {
  if (props.loading) return
  const target = normalizePage(page, props.page, pages.value)
  input.value = String(target)
  emit('change', target, normalizePageSize(size))
}
function last() {
  if (props.loading || !next.value) return
  if (pages.value === undefined) emit('last')
  else move(pages.value)
}
</script>

<template>
  <nav
    class="pagination"
    :aria-label="label"
    :aria-busy="loading"
  >
    <p
      v-if="total !== undefined"
      class="pagination-summary"
      aria-live="polite"
    >
      共 {{ total }} 条
    </p>
    <div class="pagination-controls">
      <label
        class="page-size-control"
        :for="`${id}-size`"
      >
        每页
        <select
          :id="`${id}-size`"
          :value="pageSize"
          :disabled="loading"
          @change="move(1, Number(($event.target as HTMLSelectElement).value))"
        >
          <option
            v-for="size in [10, 20, 50]"
            :key="size"
            :value="size"
          >{{ size }}</option>
        </select>
        条
      </label>
      <button
        type="button"
        :disabled="loading || page <= 1"
        @click="move(1)"
      >
        首页
      </button>
      <button
        type="button"
        :disabled="loading || page <= 1"
        @click="move(page - 1)"
      >
        上一页
      </button>
      <span
        class="page-position"
        aria-live="polite"
      >第 {{ page }}<template v-if="pages !== undefined"> / {{ pages }}</template> 页</span>
      <button
        type="button"
        :disabled="loading || !next"
        @click="move(page + 1)"
      >
        下一页
      </button>
      <button
        type="button"
        :disabled="loading || !next"
        @click="last"
      >
        尾页
      </button>
      <label
        class="page-jump-control"
        :for="`${id}-jump`"
      >
        跳至
        <input
          :id="`${id}-jump`"
          v-model="input"
          :disabled="loading"
          inputmode="numeric"
          min="1"
          :max="pages ?? 10000"
          step="1"
          type="number"
          @keyup.enter="move(Number(input))"
        >
        页
      </label>
      <button
        type="button"
        :disabled="loading"
        @click="move(Number(input))"
      >
        跳转
      </button>
    </div>
  </nav>
</template>
