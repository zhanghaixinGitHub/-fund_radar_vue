<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { readPredictionReview, requestPredictionReview } from '@/api/predictionReview'
import type { PredictionReview, PredictionReviewRequest, ReviewHorizon } from '@/types/predictionReview'
import { createReviewRequestGuard, isSupplementaryReview, reviewDateRange, reviewDirection, reviewHorizons, reviewTitle } from '@/utils/predictionReview'
import { useAuthStore } from '@/stores/auth'
import '@/styles/prediction.css'

const props = defineProps<{ fundCode: string }>()
const auth = useAuthStore()
const current = ref<PredictionReview | null>(null)
const request = ref<PredictionReviewRequest | null>(null)
const busy = ref(false)
const loading = ref(false)
const error = ref('')
const selectedPeriod = ref<ReviewHorizon>('T1')
const guard = createReviewRequestGuard()
const updating = computed(() => busy.value || loading.value)
const canWrite = computed(() => auth.hasPermission('WATCHLIST_SELF_WRITE'))
const cards = computed(() => reviewHorizons.map(horizon => {
  const period = current.value?.periods.find(p => p.horizonId === horizon.id)
  return { ...horizon, title: reviewTitle(horizon.id, period), period }
}))
const selectedCard = computed(() => cards.value.find(card => card.id === selectedPeriod.value)!)
const selected = computed(() => selectedCard.value.period)
const awaitingUpdate = computed(() => request.value && request.value.status !== 'AVAILABLE')
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
    const value = await readPredictionReview(code)
    if (guard.current(token, props.fundCode)) current.value = value
  } catch {
    if (guard.current(token, props.fundCode)) error.value = '分析暂时无法读取，请稍后点击更新重试。'
  } finally {
    if (guard.current(token, props.fundCode)) loading.value = false
  }
}

/** 等待新净值或新分析时，原记录仍明确保留自己的旧日期。 */
async function generate() {
  if (updating.value) return
  if (!canWrite.value) { await load(); return }
  const code = props.fundCode
  const token = guard.begin(code)
  busy.value = true
  error.value = ''
  request.value = null
  let requested = false
  try {
    const result = await requestPredictionReview(code)
    if (!guard.current(token, props.fundCode)) return
    request.value = result
    requested = true
    const value = await readPredictionReview(code)
    if (guard.current(token, props.fundCode)) current.value = value
  } catch {
    if (guard.current(token, props.fundCode)) {
      error.value = requested
        ? '已提出更新，但结果暂时无法读取，请稍后重试。'
        : '这次未能提出更新，请稍后重试。'
    }
  } finally {
    if (guard.current(token, props.fundCode)) busy.value = false
  }
}

watch(() => props.fundCode, () => {
  current.value = null
  request.value = null
  busy.value = false
  selectedPeriod.value = 'T1'
  void load()
}, { immediate: true })
onBeforeUnmount(() => guard.invalidate())
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
          <p>点击一个时间段，在下方查看判断依据。复盘只说明当时的判断。</p>
        </div>
        <button
          class="secondary-button"
          :disabled="updating"
          @click="generate"
        >
          {{ updating ? '正在更新…' : canWrite ? '更新预测' : '刷新结果' }}
        </button>
      </header>
      <p class="forecast-caution">
        这些判断把握较低，准确程度还在验证；方向不代表能赚多少钱。
      </p>
      <p
        v-if="error"
        class="forecast-error"
        role="alert"
      >
        {{ error }}{{ current ? '下方保留上次读取的结果，请留意原日期。' : '' }}
      </p>
      <p
        v-if="request"
        class="forecast-warning"
        role="status"
      >
        {{ request.summary }}
        <span v-if="awaitingUpdate && current">下方保留此前结果；当前新分析尚未完成，请留意各周期的原日期。</span>
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
          :class="{ 'is-selected': selectedPeriod === card.id }"
          :aria-pressed="selectedPeriod === card.id"
          :aria-label="`查看${card.title}的依据`"
          aria-controls="prediction-evidence"
          @click="selectedPeriod = card.id"
        >
          <span class="forecast-card-title">{{ card.title }}</span>
          <span class="forecast-duration">{{ card.duration }}</span>
          <strong
            class="forecast-direction"
            :class="`tone-${card.period?.decision.toLowerCase() ?? 'neutral'}`"
          >
            {{ card.period ? reviewDirection(card.period) : loading ? '正在读取…' : error ? '暂时无法读取' : '分析待更新' }}
          </strong>
          <span class="forecast-period">{{ reviewDateRange(card.period) }}</span>
          <span
            v-if="card.period?.kind === 'RETROSPECTIVE'"
            class="forecast-card-status"
          >区间已结束 · 仅供复盘</span>
          <span
            v-else-if="card.period?.kind === 'CONDITIONAL_OUTLOOK'"
            class="forecast-card-status"
          >条件展望{{ card.period.endDate ? '' : ' · 终点待核' }}</span>
          <span
            v-else-if="isSupplementaryReview(card.period)"
            class="forecast-card-status"
          >区间内补充判断 · 非事前预测</span>
          <span
            v-if="card.period?.decision === 'ABSTAIN'"
            class="forecast-data-date"
          >
            {{ card.period.awaitingReason || card.period.summary || '现有依据还不足以作出方向判断。' }}
          </span>
          <span
            v-if="card.period && current?.marketAsOf"
            class="forecast-data-date"
          >行情截至 {{ current.marketAsOf }}</span>
          <span class="forecast-card-action">{{ selectedPeriod === card.id ? '正在查看依据' : '点击查看依据' }}</span>
        </button>
      </div>
      <p
        v-if="!current && !loading && !error"
        class="forecast-footnote"
        role="status"
      >
        本基金的分析待更新，可点击更新检查当前资料。
      </p>
      <footer class="forecast-footnote">
        日期按基金实际估值安排确认；终点未核实的半年只作条件展望。已结束区间不代表接下来一天的走势。
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
          {{ selectedCard.title }} · 判断依据
        </h2>
        <p>对应上方选中的结果</p>
      </header>
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
          以下方向需要所列条件成立；{{ selected.endDate ? '请结合实际区间查看。' : '结束估值日仍待核实，名义到期日不代表已确认终点。' }}
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
          <h3>什么情况下需要改变判断</h3>
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
          判断区间：{{ reviewDateRange(selected) }}
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
        {{ loading ? '正在读取所选周期的依据…' : error ? '依据暂时无法读取，请稍后重试。' : '这个周期的分析待更新，尚无可展示的判断依据。' }}
      </p>
    </section>
  </div>
</template>
