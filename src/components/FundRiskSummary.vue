<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { get } from '@/api/http'

/** 公共基金风险事实与走势预测分开读取，避免把事后行情包装成预测依据。 */
type RiskSummary = {
  fundCode: string; available: boolean; asOfDate: string | null
  reportDate: string | null; publishedDate: string | null; sourceUrl: string | null
  facts: string[]; limitations: string[]
  crossCheck: { date: string; coverageWeightPct: number; summary: string; limitation: string } | null
}
const props = defineProps<{ fundCode: string }>()
const result = ref<RiskSummary | null>(null)
const error = ref('')
const loading = ref(false)
let sequence = 0

/** 切换基金或离开页面后，不允许较慢的旧请求显示在新基金下。 */
async function load() {
  const ticket = ++sequence
  result.value = null; error.value = ''; loading.value = true
  try {
    const data = await get<RiskSummary>(`/api/v1/funds/${encodeURIComponent(props.fundCode)}/risk-summary`)
    if (ticket === sequence && data.fundCode === props.fundCode) result.value = data
  } catch {
    if (ticket === sequence) error.value = '风险资料暂时无法读取，请稍后重试。'
  } finally {
    if (ticket === sequence) loading.value = false
  }
}
watch(() => props.fundCode, load, { immediate: true })
onBeforeUnmount(() => ++sequence)
</script>

<template>
  <section
    class="risk-summary"
    aria-labelledby="fund-risk-title"
  >
    <header>
      <h2 id="fund-risk-title">
        持仓风险与行情变化
      </h2><span v-if="result?.asOfDate">资料截至 {{ result.asOfDate }}</span>
    </header>
    <p
      v-if="loading"
      role="status"
    >
      风险资料加载中…
    </p>
    <p
      v-else-if="error"
      role="status"
    >
      {{ error }} <button
        type="button"
        @click="load"
      >
        重试
      </button>
    </p>
    <template v-else-if="result">
      <template v-if="result.available">
        <p>
          持仓日期 {{ result.reportDate }} · 披露日期 {{ result.publishedDate }}
        </p>
        <ul>
          <li
            v-for="fact in result.facts"
            :key="fact"
          >
            {{ fact }}
          </li>
        </ul>
        <div v-if="result.crossCheck">
          <p>{{ result.crossCheck.date }} 行情覆盖基金净资产 {{ result.crossCheck.coverageWeightPct.toFixed(2) }}%。{{ result.crossCheck.summary }}</p>
          <p class="muted">
            {{ result.crossCheck.limitation }}
          </p>
        </div>
      </template>
      <ul class="muted">
        <li
          v-for="limitation in result.limitations"
          :key="limitation"
        >
          {{ limitation }}
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
.risk-summary { border-top: 1px solid var(--color-border, #dde3ec); margin-top: 1.5rem; padding: 1.25rem 0; }
header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: .5rem; }
h2 { font-size: 1.05rem; margin: 0; }
p, li { line-height: 1.7; }
ul { padding-left: 1.25rem; }
header span, .muted { color: var(--color-text-secondary, #64748b); font-size: .875rem; }
</style>
