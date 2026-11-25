<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import PredictionHistoryDrawer from '@/components/PredictionHistoryDrawer.vue'
import { readCurrentForecast } from '@/api/predictionReview'
import type { CurrentForecast, ReviewHorizon } from '@/types/predictionReview'
import { createReviewRequestGuard, forecastDateText, isSupplementaryReview, reviewDateRange, reviewDirection, reviewHorizons, reviewTitle } from '@/utils/predictionReview'
import '@/styles/prediction.css'

const props = defineProps<{ fundCode: string }>()
const forecast = ref<CurrentForecast | null>(null)
const loading = ref(false)
const error = ref('')
const selectedPeriod = ref<ReviewHorizon>('T1')
const evidenceOpen = ref(false)
const guard = createReviewRequestGuard()
const windowExpired = ref(true)
let windowTimer: ReturnType<typeof globalThis.setTimeout> | undefined
const current = computed(() => windowExpired.value ? null : forecast.value)
const targetDate = computed(() => current.value?.window.targetNavDate)
function scheduleWindowRefresh() {
  globalThis.clearTimeout(windowTimer)
  const boundary = Date.parse(forecast.value?.window.nextWindowOpenAt ?? '')
  windowExpired.value = !Number.isFinite(boundary) || boundary <= Date.now()
  if (!windowExpired.value) windowTimer = globalThis.setTimeout(() => {
    windowExpired.value = true
    void load()
  }, Math.min(boundary - Date.now(), 2_147_483_647))
}
const cards = computed(() => reviewHorizons.map(horizon => {
  const period = targetDate.value ? current.value?.review?.periods.find(p => p.horizonId === horizon.id
    && p.startDate === targetDate.value && p.kind !== 'RETROSPECTIVE') : undefined
  const dates = current.value?.window.periods.find(p => p.horizonId === horizon.id)
  return { ...horizon, title: reviewTitle(horizon.id, period), period, dateText: period ? reviewDateRange(period)
    : targetDate.value ? forecastDateText(horizon.id, targetDate.value, dates) : '' }
}))
const selectedCard = computed(() => cards.value.find(card => card.id === selectedPeriod.value)!)
const selected = computed(() => selectedCard.value.period)
const time = (value: string) => {
  const date = new Date(value)
  return Number.isFinite(date.getTime())
    ? date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }) : '时间待核'
}

async function load() {
  const code = props.fundCode
  const token = guard.begin(code)
  loading.value = true
  error.value = ''
  try {
    const value = await readCurrentForecast(code)
    if (guard.current(token, props.fundCode)) {
      forecast.value = value
      scheduleWindowRefresh()
    }
  } catch {
    if (guard.current(token, props.fundCode)) error.value = '分析暂时无法读取，请稍后刷新页面重试。'
  } finally {
    if (guard.current(token, props.fundCode)) loading.value = false
  }
}

watch(() => props.fundCode, () => {
  globalThis.clearTimeout(windowTimer)
  windowExpired.value = true
  forecast.value = null
  selectedPeriod.value = 'T1'
  evidenceOpen.value = false
  void load()
}, { immediate: true })
onBeforeUnmount(() => { guard.invalidate(); globalThis.clearTimeout(windowTimer) })
</script>

<template>
  <div class="forecast-workspace">
    <section
      class="analysis-section forecast-panel"
      aria-label="基金走势预测"
      :aria-busy="loading"
    >
      <header class="forecast-heading">
        <div>
          <h2>接下来，可能涨还是跌？</h2>
          <p v-if="current?.window.baseNavDate">基准净值日 {{ current.window.baseNavDate }}</p>
        </div>
      </header>
      <p class="forecast-caution">
        这些判断把握较低，准确程度还在验证；方向不代表能赚多少钱。
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
        <button
          v-for="card in cards"
          :key="card.id"
          type="button"
          class="forecast-card"
          :class="{ 'is-selected': evidenceOpen && selectedPeriod === card.id }"
          aria-haspopup="dialog"
          :aria-expanded="evidenceOpen && selectedPeriod === card.id"
          :aria-label="`${card.title}，${card.period ? reviewDirection(card.period) : '查看状态'}${card.dateText ? `，${card.dateText}` : ''}`"
          @click="selectedPeriod = card.id; evidenceOpen = true"
        >
          <span class="forecast-card-title">{{ card.title }}</span>
          <span class="forecast-duration">{{ card.duration }}</span>
          <strong
            class="forecast-direction"
            :class="`tone-${card.period?.decision.toLowerCase() ?? 'neutral'}`"
          >
            {{ card.period ? reviewDirection(card.period) : loading ? '正在读取…' : error ? '暂时无法读取' : targetDate ? '待发布' : '预测日期待确认' }}
          </strong>
          <span v-if="card.dateText" class="forecast-period">{{ card.dateText }}</span>
          <span
            v-if="card.period?.kind === 'RETROSPECTIVE'"
            class="forecast-card-status"
          >区间已结束 · 仅供复盘</span>
          <span
            v-else-if="card.period?.kind === 'CONDITIONAL_OUTLOOK'"
            class="forecast-card-status"
          >{{ card.period.decision === 'ABSTAIN' ? '半年分析' : '条件展望' }}{{ card.period.endDate ? '' : ' · 终点待核' }}</span>
          <span
            v-else-if="isSupplementaryReview(card.period)"
            class="forecast-card-status"
          >区间内补充判断 · 非事前预测</span>
          <span
            v-if="card.period?.decision === 'ABSTAIN'"
            class="forecast-card-status"
          >已审阅 · 暂无方向</span>
          <span
            v-if="card.period?.decision === 'ABSTAIN'"
            class="forecast-data-date"
          >
            {{ card.period.awaitingReason || card.period.summary || '现有依据还不足以作出方向判断。' }}
          </span>
          <span
            v-if="card.period?.decision === 'ABSTAIN'"
            class="forecast-data-date"
          >分析于 {{ time(card.period.analysisAt) }}</span>
          <span
            v-if="card.period?.sourceCutoff"
            class="forecast-data-date"
          >资料截至 {{ time(card.period.sourceCutoff) }}</span>
          <span class="forecast-card-action">{{ card.period ? '查看依据' : '查看状态' }}</span>
        </button>
      </div>
      <footer class="forecast-footnote">
        往期判断及复盘见「预测历史」。
      </footer>
    </section>
    <PredictionHistoryDrawer
      v-if="evidenceOpen"
      :title="`${selectedCard.title} · 判断依据`"
      @close="evidenceOpen = false"
    >
      <section
        id="prediction-evidence"
        class="forecast-basis"
        aria-labelledby="prediction-evidence-title"
        aria-live="polite"
      >
        <p id="prediction-evidence-title">
          {{ selectedCard.title }} · 本期判断依据
        </p>
        <template v-if="selected">
          <p
            v-if="selected.kind === 'RETROSPECTIVE'"
            class="forecast-warning"
          >
            这个区间已经结束。以下是当时的判断复盘，不是下一估值日的新预测。
          </p>
          <p
            v-else-if="selected.kind === 'CONDITIONAL_OUTLOOK'"
            class="forecast-warning"
          >
            {{ selected.decision === 'ABSTAIN' ? '本次尚未给出方向；' : '以下方向需要所列条件成立；' }}{{ selected.endDate ? '请结合实际区间查看。' : '结束估值日仍待核实，名义到期日不代表已确认终点。' }}
          </p>
          <p class="forecast-basis-summary">
            {{ selected.summary || reviewDirection(selected) }}
          </p>
          <p
            v-if="selected.decision === 'ABSTAIN' && selected.awaitingReason"
            class="forecast-warning"
          >
            暂不判断：{{ selected.awaitingReason }}
          </p>
          <p
            v-if="selected.decision === 'ABSTAIN'"
            class="forecast-footnote"
          >
            已完成这次审阅，现有依据仍难分主次。资料或下列条件发生变化后重新评估。
          </p>
          <div class="forecast-reasons">
            <section>
              <h3>主要依据</h3>
              <p>{{ selected.primaryReason || '主要依据尚待补充。' }}</p>
            </section>
            <section>
              <h3>相反因素如何取舍</h3>
              <p>{{ selected.counterReason || '相反因素的说明尚待补充。' }}</p>
            </section>
          </div>
          <section
            v-if="selected.conditions.length"
            class="forecast-limitations"
          >
            <h3>{{ selected.decision === 'ABSTAIN' ? '出现哪些变化后重新判断' : '什么情况下需要改变判断' }}</h3>
            <ul>
              <li
                v-for="condition in selected.conditions"
                :key="condition"
              >
                {{ condition }}
              </li>
            </ul>
          </section>
          <section
            v-if="selected.limitations.length"
            class="forecast-limitations"
          >
            <h3>还要注意</h3>
            <ul>
              <li
                v-for="limitation in selected.limitations"
                :key="limitation"
              >
                {{ limitation }}
              </li>
            </ul>
          </section>
          <p class="forecast-basis-meta">
            {{ reviewDateRange(selected) }}
            <template v-if="selected.baseNavDate">
              · 基准净值日 {{ selected.baseNavDate }}
            </template>
            · 分析于 {{ time(selected.analysisAt) }} · 把握较低
          </p>
        </template>
        <p
          v-else
          role="status"
        >
          {{ loading ? '正在读取所选周期的依据…' : error ? '依据暂时无法读取，请稍后重试。' : targetDate ? `从 ${targetDate} 起算的预测待发布。` : '本期估值日待确认。' }}
        </p>
      </section>
    </PredictionHistoryDrawer>
  </div>
</template>
