<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { generateMultiPrediction, readMultiPrediction, readPredictionTask, readLatestPredictionTask } from '@/api/multiPrediction'
import Direction1dPanel from '@/components/Direction1dPanel.vue'
import type { MultiCurrent, MultiPrediction, PredictionError, PredictionTask } from '@/types/multiPrediction'
import { useAuthStore } from '@/stores/auth'
import { sortPredictionHorizons } from '@/utils/predictionHorizon'
import { multiPredictionEvidence } from '@/utils/predictionEvidence'
import '@/styles/prediction.css'

const props = defineProps<{ fundCode: string }>()
const auth = useAuthStore()
const dailyPanel = ref<InstanceType<typeof Direction1dPanel> | null>(null)
const current = ref<MultiCurrent | null>(null)
const task = ref<PredictionTask | null>(null)
const busy = ref(false)
const loading = ref(false)
const error = ref('')
const selectedPeriod = ref('DAY')
const updating = computed(() => busy.value || loading.value || dailyPanel.value?.busy)
let sequence = 0
let timer: ReturnType<typeof globalThis.setTimeout> | undefined

/** 中文近似时长只帮助理解，起止日期仍完全使用服务端返回的交易日和到期日。 */
const periods: Record<string, { title: string; duration: string }> = {
  T5_V1: { title: '未来 5 个交易日', duration: '约一周' },
  T20_V1: { title: '未来 20 个交易日', duration: '约一个月' },
  M6_V1: { title: '未来 6 个月', duration: '半年' },
}
const cards = computed(() => sortPredictionHorizons(current.value?.horizons, h => h.horizon_id).map(h => ({
  ...h,
  title: periods[h.horizon_id]?.title ?? h.label,
  duration: periods[h.horizon_id]?.duration ?? '以实际预测日期为准',
  prediction: current.value?.predictions.find(p => p.horizonId === h.horizon_id),
  attempt: current.value?.latestAttempts.find(a => a.horizon_id === h.horizon_id),
})))

/** 老记录的“非上涨”仍包含持平；未知方向不被兜底显示成下跌。 */
function direction(value: string): string {
  return ({ UP: '预计上涨', FLAT: '预计基本持平', DOWN: '预计下跌', NON_UP: '预计下跌或持平' } as Record<string, string>)[value] ?? '暂无法判断'
}
const time = (value: string) => new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
const endDate = (prediction: MultiPrediction) => current.value?.targetResolutions?.[prediction.predictionId]?.endDate ?? prediction.endDate

/** 缺少官方日期时明确写“预计”，绝不把名义到期日伪装为已经确认的日期。 */
function period(prediction: MultiPrediction): string {
  const end = endDate(prediction)
  return `${prediction.startDate} 至 ${end ?? (prediction.nominalEndDate ? `预计 ${prediction.nominalEndDate}` : '结束日期待确认')}`
}
function flatExplanation(threshold?: string): string {
  const value = Number(threshold)
  return Number.isFinite(value) && value > 0
    ? `这段时间的整体回报在 -${Number((value * 100).toFixed(4))}% 到 +${Number((value * 100).toFixed(4))}% 之间，都算基本持平。`
    : ''
}
/** 只转换失败的展示用语；失败不会被掩盖，也不会被当作“看跌”结果。 */
function failureMessage(failure?: PredictionError): string {
  const code = failure?.code ?? ''
  if (/NAV|DATA|HISTORY/.test(code)) return '净值等数据还未准备好，暂时无法更新这个时间段的预测。'
  if (/CALENDAR/.test(code)) return '预测日期还未确认，暂时无法生成结果。'
  if (/MODEL|ARTIFACT/.test(code)) return '这个时间段的预测暂时不可用，请稍后重试。'
  return '这次未能生成预测，请稍后点击“更新预测”重试。'
}

/** 所有周期共用下方依据区域；点击只切换已读取的记录，不触发新预测。 */
const selectedCard = computed(() => cards.value.find(card => card.horizon_id === selectedPeriod.value))
const selectedTitle = computed(() => selectedPeriod.value === 'DAY' ? '下一交易日' : selectedCard.value?.title ?? '所选周期')
const evidence = computed(() => selectedPeriod.value === 'DAY'
  ? dailyPanel.value?.evidence ?? null : multiPredictionEvidence(selectedCard.value?.prediction))
const selectedPrediction = computed(() => selectedCard.value?.prediction)
const selectedStatus = computed(() => {
  if (selectedPeriod.value === 'DAY') return dailyPanel.value?.evidenceStatus ?? ''
  const card = selectedCard.value
  return card?.attempt?.payload.generationStatus === 'FAILED'
    ? failureMessage(card.attempt.payload.error) + (card.prediction ? '以下依据对应上次成功结果。' : '') : ''
})
/** 任务恢复只用于显示更新进度；任务接口失败不应遮住已经成功读取的预测。 */
async function load() {
  const run = ++sequence
  loading.value = true
  error.value = ''
  try {
    const [value, latest] = await Promise.all([
      readMultiPrediction(props.fundCode),
      readLatestPredictionTask().catch(() => null),
    ])
    if (run !== sequence) return
    current.value = value
    task.value = latest?.items.some(item => item.fundCode === props.fundCode) ? latest : null
    // 单基金页面只恢复这只基金的进度，不要求用户理解或处理其他基金的批量任务。
    if (task.value?.pendingItems && !busy.value) {
      busy.value = true
      void poll(task.value.taskId, run)
    }
  } catch {
    if (run === sequence) error.value = '预测暂时无法读取，请稍后重试。'
  } finally {
    if (run === sequence) loading.value = false
  }
}
async function poll(id: string, run: number) {
  try {
    const value = await readPredictionTask(id)
    if (run !== sequence) return
    task.value = value
    if (value.pendingItems) timer = globalThis.setTimeout(() => void poll(id, run), 1500)
    else { busy.value = false; await load() }
  } catch {
    if (run !== sequence) return
    busy.value = false
    error.value = '更新进度暂时无法读取，点击“更新预测”可重新查看。'
  }
}
/** 一个入口更新本基金；一日与较长周期仍分别遵守各自接口、日期和已有记录保护规则。 */
async function generate() {
  if (updating.value) return
  const canWrite = auth.hasPermission('WATCHLIST_SELF_WRITE')
  void dailyPanel.value?.refresh(canWrite)
  if (!canWrite) { await load(); return }
  busy.value = true
  error.value = ''
  const run = sequence
  try {
    const value = await generateMultiPrediction(props.fundCode)
    if (run !== sequence) return
    task.value = value
    void poll(value.taskId, run)
  } catch {
    if (run !== sequence) return
    busy.value = false
    error.value = '这次未能更新较长周期的预测，请稍后重试。'
  }
}
watch(() => props.fundCode, () => {
  globalThis.clearTimeout(timer)
  selectedPeriod.value = 'DAY'
  current.value = null
  task.value = null
  busy.value = false
  void load()
}, { immediate: true })
onBeforeUnmount(() => { ++sequence; globalThis.clearTimeout(timer) })
</script>

<template>
  <div class="forecast-workspace">
    <section
      class="analysis-section forecast-panel"
      aria-label="基金走势预测"
      :aria-busy="updating"
    >
      <header class="forecast-heading">
        <div>
          <h2>接下来，可能涨还是跌？</h2>
          <p>点击一个时间段，在下方查看系统为什么作出这个判断。</p>
        </div>
        <button
          class="secondary-button"
          :disabled="updating"
          @click="generate"
        >
          {{ updating ? '正在更新…' : '更新预测' }}
        </button>
      </header>
      <p class="forecast-caution">
        预测功能仍在试用，准确程度还在验证；这里只显示方向，不代表能赚多少钱。
      </p>
      <p
        v-if="error"
        class="forecast-error"
        role="alert"
      >
        {{ error }}
      </p>
      <div
        class="forecast-grid"
        role="group"
        aria-label="选择要查看依据的预测周期"
      >
        <Direction1dPanel
          :key="fundCode"
          ref="dailyPanel"
          :fund-code="fundCode"
          :selected="selectedPeriod === 'DAY'"
          @select="selectedPeriod = 'DAY'"
        />
        <button
          v-for="card in cards"
          :key="card.horizon_id"
          type="button"
          class="forecast-card"
          :class="{ 'is-selected': selectedPeriod === card.horizon_id }"
          :aria-pressed="selectedPeriod === card.horizon_id"
          :aria-label="`查看${card.title}的预测依据`"
          aria-controls="prediction-evidence"
          @click="selectedPeriod = card.horizon_id"
        >
          <span class="forecast-card-title">{{ card.title }}</span>
          <span class="forecast-duration">{{ card.duration }}</span>
          <strong
            class="forecast-direction"
            :class="`tone-${card.prediction?.direction.toLowerCase() ?? 'neutral'}`"
          >
            {{ card.prediction ? direction(card.prediction.direction) : '暂无预测' }}
          </strong>
          <span class="forecast-period">{{ card.prediction ? period(card.prediction) : '尚未生成' }}</span>
          <span class="forecast-data-date">{{ card.prediction ? `依据净值截至 ${card.prediction.baseNavDate ?? card.prediction.dataAsOf}` : '点击查看当前状态' }}</span>
          <span
            v-if="card.attempt?.payload.generationStatus === 'FAILED'"
            class="forecast-card-status"
          >{{ card.prediction ? '更新未成功 · 保留上次结果' : '本次未生成' }}</span>
          <span class="forecast-card-action">{{ selectedPeriod === card.horizon_id ? '正在查看依据' : '点击查看依据' }}</span>
        </button>
      </div>
      <p
        v-if="loading && !current"
        class="forecast-footnote"
        role="status"
      >
        正在读取其他时间段的预测…
      </p>
      <p
        v-else-if="current && !cards.length"
        class="forecast-footnote"
      >
        其他时间段暂时没有可用结果。
      </p>
      <footer class="forecast-footnote">
        交易日不包含休市日。过去预测得怎样，可在左侧“预测历史”中查看。
      </footer>
    </section>
    <section
      id="prediction-evidence"
      class="analysis-section forecast-basis"
      aria-labelledby="prediction-evidence-title"
      aria-live="polite"
    >
      <header class="forecast-basis-heading">
        <h2 id="prediction-evidence-title">
          {{ selectedTitle }} · 预测依据
        </h2>
        <p>对应上方选中的预测结果</p>
      </header>
      <p
        v-if="selectedStatus"
        class="forecast-warning"
        role="status"
      >
        {{ selectedStatus }}
      </p>
      <template v-if="evidence">
        <p class="forecast-basis-summary">
          {{ evidence.summary }}
        </p>
        <dl
          v-if="evidence.facts.length"
          class="forecast-facts"
        >
          <div
            v-for="fact in evidence.facts"
            :key="fact.label"
          >
            <dt>{{ fact.label }}</dt><dd>{{ fact.value }}</dd>
          </div>
        </dl>
        <div
          v-if="evidence.supporting.length || evidence.opposing.length"
          class="forecast-reasons"
        >
          <div v-if="evidence.supporting.length">
            <h3>系统怎样得出结论</h3>
            <ul>
              <li
                v-for="reason in evidence.supporting"
                :key="reason"
              >
                {{ reason }}
              </li>
            </ul>
          </div>
          <div v-if="evidence.opposing.length">
            <h3>与结论相反的因素</h3>
            <ul>
              <li
                v-for="reason in evidence.opposing"
                :key="reason"
              >
                {{ reason }}
              </li>
            </ul>
          </div>
        </div>
        <div class="forecast-limitations">
          <h3>这份依据的局限</h3>
          <ul>
            <li
              v-for="limitation in evidence.limitations"
              :key="limitation"
            >
              {{ limitation }}
            </li>
          </ul>
        </div>
        <p
          v-if="selectedPeriod === 'DAY' && dailyPanel?.forecast"
          class="forecast-basis-meta"
        >
          预测日期：{{ dailyPanel.forecast.targetNavDate }} · 依据净值截至 {{ dailyPanel.forecast.baseNavDate }}
        </p>
        <template v-else-if="selectedPrediction">
          <p
            v-if="flatExplanation(selectedPrediction.flatThreshold)"
            class="forecast-basis-meta"
          >
            到期后如何区分涨跌与持平：{{ flatExplanation(selectedPrediction.flatThreshold) }}
          </p>
          <p
            v-if="!endDate(selectedPrediction)"
            class="forecast-basis-meta"
          >
            结束日期还需等待基金的交易日安排确认，目前显示的是预计日期。
          </p>
          <p
            class="forecast-basis-meta"
          >
            预测区间：{{ period(selectedPrediction) }} · 生成于 {{ time(selectedPrediction.generatedAt) }}
          </p>
        </template>
      </template>
      <p
        v-else
        role="status"
      >
        正在读取所选周期的依据…
      </p>
    </section>
  </div>
</template>
