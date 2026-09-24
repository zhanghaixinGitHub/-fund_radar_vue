<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { generateMultiPrediction, readMultiPrediction, readPredictionTask, readLatestPredictionTask, retryPredictionTask } from '@/api/multiPrediction'
import type { MultiCurrent, PredictionTask } from '@/types/multiPrediction'
import { useAuthStore } from '@/stores/auth'
import { directionLabel, flatRange } from '@/utils/predictionDirection'
import { comparePredictionHorizons, sortPredictionHorizons } from '@/utils/predictionHorizon'
const props = defineProps<{ fundCode: string }>()
const auth = useAuthStore()
const current = ref<MultiCurrent | null>(null), task = ref<PredictionTask | null>(null)
const busy = ref(false), error = ref('')
const filterFund = ref(''), filterHorizon = ref(''), filterError = ref('')
const filteredItems = computed(() => task.value?.items.filter(item => item.fundCode.includes(filterFund.value) &&
  (!filterHorizon.value || item.horizonId === filterHorizon.value) &&
  (!filterError.value || (item.result?.error?.code ?? '').includes(filterError.value.toUpperCase())))
  .sort((left, right) => left.fundCode.localeCompare(right.fundCode) || comparePredictionHorizons(left.horizonId, right.horizonId)) ?? [])
let sequence = 0, timer: ReturnType<typeof globalThis.setTimeout> | undefined
const cards = computed(() => sortPredictionHorizons(current.value?.horizons, h => h.horizon_id).map(h => ({ ...h,
  prediction: current.value?.predictions.find(p => p.horizonId === h.horizon_id),
  attempt: current.value?.latestAttempts.find(a => a.horizon_id === h.horizon_id),
})))
const time = (value: string) => new Date(value).toLocaleString('zh-CN', { hour12: false })
async function load() {
  const run = ++sequence
  error.value = ''
  try {
    const [value, latest] = await Promise.all([readMultiPrediction(props.fundCode), readLatestPredictionTask()])
    if (run !== sequence) return
    current.value = value
    if (latest?.items.some(item => item.fundCode === props.fundCode)) {
      task.value = latest
      if (latest.pendingItems && !busy.value) { busy.value=true; void poll(latest.taskId, props.fundCode) }
    }
  }
  catch (e) { if (run === sequence) error.value = e instanceof Error ? e.message : '预测读取失败' }
}
async function poll(id: string, code: string) {
  try {
    const value = await readPredictionTask(id)
    if (code !== props.fundCode) return
    task.value = value
    if (value.pendingItems) timer = globalThis.setTimeout(() => void poll(id, code), 1500)
    else { busy.value = false; await load() }
  } catch (e) { busy.value = false; error.value = e instanceof Error ? e.message : '任务状态读取失败，可刷新恢复' }
}
async function generate(retry = false, all = false) {
  busy.value = true; error.value = ''
  const code = props.fundCode
  try {
    const value = retry && task.value ? await retryPredictionTask(task.value.taskId) : await generateMultiPrediction(all ? undefined : code)
    if (code !== props.fundCode) return
    task.value = value; void poll(value.taskId, code)
  } catch (e) { busy.value = false; error.value = e instanceof Error ? e.message : '生成失败' }
}
watch(() => props.fundCode, () => { globalThis.clearTimeout(timer); current.value = null; task.value = null; busy.value = false; void load() }, { immediate: true })
onBeforeUnmount(() => { ++sequence; globalThis.clearTimeout(timer) })
</script>

<template>
  <section
    class="analysis-section multi-prediction"
    aria-label="多周期模型分析"
    :aria-busy="busy"
  >
    <div class="section-heading">
      <div>
        <p class="eyebrow">
          模型分析 · 实验中
        </p><h2>未来不同周期，预计如何表现</h2>
      </div>
      <button
        v-if="auth.hasPermission('WATCHLIST_SELF_WRITE')"
        class="primary-button"
        :disabled="busy"
        @click="generate()"
      >
        {{ busy ? '正在生成…' : '生成本基金各周期预测' }}
      </button>
    </div>
    <button
      v-if="auth.hasPermission('WATCHLIST_SELF_WRITE')"
      class="secondary-button"
      :disabled="busy"
      @click="generate(false, true)"
    >
      生成我的全部关注
    </button>
    <p
      v-if="error"
      class="error-message"
      role="alert"
    >
      {{ error }} <button
        class="secondary-button"
        @click="load"
      >
        重试读取
      </button>
    </p>
    <p
      v-if="!current && !error"
      role="status"
    >
      正在读取多周期预测…
    </p>
    <p
      v-if="task"
      role="status"
    >
      本批 {{ task.fundCount }} 只基金、{{ task.plannedItems }} 个周期任务：新生成 {{ task.createdItems }}，已有 {{ task.reusedItems }}，失败 {{ task.failedItems }}，待处理 {{ task.pendingItems }}。
    </p>
    <button
      v-if="task?.failedItems && !busy"
      class="secondary-button"
      @click="generate(true)"
    >
      仅重试失败周期
    </button>
    <details
      v-if="task"
      class="task-details"
    >
      <summary>任务逐项结果与失败筛选</summary>
      <div class="task-filters">
        <label>基金代码<input
          v-model="filterFund"
          inputmode="numeric"
        ></label><label>预测周期<select v-model="filterHorizon"><option value="">全部</option><option value="T5_V1">五日</option><option value="T20_V1">二十日</option><option value="M6_V1">半年</option></select></label><label>失败原因编码<input
          v-model="filterError"
          placeholder="例如 CALENDAR"
        ></label>
      </div>
      <p
        v-for="item in filteredItems"
        :key="item.fundCode+item.horizonId"
      >
        {{ item.fundCode }} · {{ item.horizonId }} · {{ ({CREATED:'新生成',REUSED:'复用原文',FAILED:'生成失败',PENDING:'待处理',RUNNING:'处理中',CANCELLED:'已取消'} as Record<string,string>)[item.status] }}<span v-if="item.result?.error">：{{ item.result.error.summary }}（{{ item.result.error.code }}）</span>
      </p>
    </details>
    <div class="multi-grid">
      <article
        v-for="card in cards"
        :key="card.horizon_id"
        class="multi-card"
      >
        <h3>{{ card.label }}</h3>
        <div
          v-if="card.attempt?.payload.generationStatus === 'FAILED'"
          class="error-message"
          role="alert"
        >
          <strong>{{ card.attempt.payload.error?.code?.startsWith('NAV_') ? '等待净值补齐' : '本次预测未生成' }}</strong><p>{{ card.attempt.payload.error?.summary }}</p>
          <p>{{ card.attempt.payload.error?.nextAction }}</p><small>{{ time(card.attempt.created_at) }}</small>
          <details><summary>查看失败详情</summary><pre>{{ card.attempt.payload.error?.details }}</pre><p>请求号：{{ card.attempt.payload.error?.traceId }}</p></details>
        </div>
        <template v-if="card.prediction">
          <p
            v-if="card.attempt?.payload.generationStatus === 'FAILED'"
            class="notice-banner"
          >
            以下为上次成功结果，生成于 {{ time(card.prediction.generatedAt) }}
          </p>
          <p>净值依据截至 {{ card.prediction.baseNavDate ?? card.prediction.dataAsOf }}</p>
          <p class="period">
            {{ card.prediction.startDate }} → {{ current?.targetResolutions?.[card.prediction.predictionId]?.endDate ?? card.prediction.endDate ?? `${card.prediction.nominalEndDate}（名义日期）` }}
          </p>
          <p
            v-if="card.prediction.endDateStatus !== 'RESOLVED' && !current?.targetResolutions?.[card.prediction.predictionId]"
            class="notice-banner"
          >
            到期日期待官方估值日历公布后顺延确定
          </p>
          <strong class="direction">预计{{ directionLabel(card.prediction.direction) }}</strong>
          <p>{{ card.prediction.reason }}</p>
          <p>{{ flatRange(card.prediction.flatThreshold) }}</p>
          <details>
            <summary>数据、模型与实验边界</summary>
            <p>生成于 {{ time(card.prediction.generatedAt) }}；净值截至 {{ card.prediction.dataAsOf }}</p>
            <template v-if="auth.hasPermission('RESEARCH_RUN_ADMIN')">
              <p>实际模型：{{ card.prediction.modelId }}；采用版本 {{ card.prediction.activationRevision }}</p>
              <p>训练标签截止：{{ card.prediction.modelManifest.labelEndMax ?? '基础方法无训练；旧模型未提供则保持未知' }}</p>
              <p>模型指纹：{{ card.prediction.modelHash }}</p>
            </template>
            <p v-if="card.prediction.fallbackReason">
              本次发生回退：{{ card.prediction.fallbackReason.map(e => e.summary).join('；') }}
            </p>
            <ul>
              <li
                v-for="text in card.prediction.limitations"
                :key="text"
              >
                {{ text }}
              </li>
            </ul>
          </details>
        </template>
        <p v-else-if="card.attempt?.payload.generationStatus !== 'FAILED'">
          尚无本周期记录，可生成当前有效期次。
        </p>
      </article>
    </div>
  </section>
</template>
<style scoped>
.multi-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr)); gap:16px; }
.multi-card { padding:20px; border:1px solid #dce5df; border-radius:12px; background:#fff; min-width:0; }
.multi-card h3 { margin-top:0; }.direction { font-size:22px; color:#245e4e; }.period { color:#566960; font-size:14px; }
.multi-card p,.multi-card li { line-height:1.7; }.multi-card details { margin-top:16px; font-size:13px; overflow-wrap:anywhere; }
.multi-card summary { cursor:pointer; min-height:36px; }.multi-card pre { white-space:pre-wrap; overflow-wrap:anywhere; }
.task-details { margin:16px 0; overflow-wrap:anywhere }.task-filters { display:flex; flex-wrap:wrap; gap:12px }.task-filters label { display:grid; gap:6px }.task-filters input,.task-filters select { min-height:40px; max-width:100%; width:180px }
@media(max-width:600px) { .multi-card { padding:16px; }.multi-prediction button { min-height:44px; } }
</style>
