<script setup lang="ts">
import ListPagination from '@/components/ListPagination.vue'
import HoldingAdviceDetails from '@/components/HoldingAdviceDetails.vue'
import PredictionHistoryDrawer from '@/components/PredictionHistoryDrawer.vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { readDecision, readDecisionHistory, readDecisionOutcomes, generateDecision } from '@/api/multiPrediction'
import type { DecisionOutcome } from '@/api/multiPrediction'
import type { DecisionReport } from '@/types/multiPrediction'
import { sortPredictionEvidence, sortPredictionHorizons } from '@/utils/predictionHorizon'
import { findLastPage, readFixedPage } from '@/utils/pagination'
const props = defineProps<{ fundCode: string; compact?: boolean; historyOnly?: boolean; initialReport?: DecisionReport | null }>()
const route = useRoute()
const auth = useAuthStore()
const generating = ref(false)
const report = ref<DecisionReport | null>(null), history = ref<DecisionReport[]>([])
const selectedHistory = ref<DecisionReport | null>(null)
const error = ref('')
const page = ref(1), outcomes = ref<Record<string, DecisionOutcome>>({}), outcomeError = ref('')
const historyLoading = ref(false)
const reportLoading = ref(false)
const pageSize = ref(10)
const historyTotal = ref<number | undefined>()
const historyHasMore = ref(false)
// 保留摘要原有的每类最多两条依据，合并后统一排序，避免涨跌分类打乱周期顺序。
const summaryEvidence = computed(() => sortPredictionEvidence([
  ...(report.value?.supportingEvidence.slice(0, 2) ?? []),
  ...(report.value?.opposingEvidence.slice(0, 2) ?? []),
]))
let sequence = 0
const labels: Record<string, string> = { BUY: '建议买入', AVOID: '不建议买入', ADD: '建议加仓', HOLD: '继续持有', REDUCE: '建议减仓', SELL: '建议卖出' }
const time = (value: string) => new Date(value).toLocaleString('zh-CN', { hour12: false })
const clockNow = ref(Date.now())
const clockTimer = globalThis.setInterval(() => { clockNow.value = Date.now() }, 30_000)
const needsReview = computed(() => !!report.value && (['LEGACY', 'CHANGED', 'EXPIRED', 'UNVERIFIED'].includes(report.value.applicability ?? '') || Date.parse(report.value.validUntil) <= clockNow.value))
const isNew = computed(() => ['HOLDING_ADVICE_V4_EVIDENCE', 'HOLDING_ADVICE_V5_PERSONAL'].includes(report.value?.strategyVersion ?? ''))
const title = computed(() => reportLoading.value ? '正在读取综合建议…' : error.value && !report.value ? '综合建议暂时无法读取' : needsReview.value ? '已有建议需重新评估' : report.value?.adviceState === 'INSUFFICIENT' ? '暂不形成综合建议' : report.value?.generationStatus === 'FAILED' ? '本次建议生成失败' : labels[report.value?.decision ?? ''] ?? '尚无综合建议')
/** 历史接口按二十条读取，展示窗口和核对结果同步合并，避免切换条数后记录错配。 */
async function load() {
  const run = ++sequence; error.value = ''; outcomeError.value = ''
  historyLoading.value = props.historyOnly === true
  reportLoading.value = !props.historyOnly
  const code = props.fundCode
  const size = pageSize.value
  const checks: Record<string, DecisionOutcome> = {}
  const read = (target: number) => readFixedPage(async serverPage => {
    const [items, outcomes] = await Promise.all([
      readDecisionHistory(code, serverPage),
      readDecisionOutcomes(code, serverPage).catch(() => {
        if (run === sequence) outcomeError.value = '到期核验暂时无法读取，已保存原文仍可查看'
        return {}
      }),
    ])
    Object.assign(checks, outcomes)
    return { items, hasMore: items.length === 20 }
  }, target, size)
  try {
    const [value, initial] = await Promise.all([
      props.historyOnly ? Promise.resolve(null) : readDecision(code),
      props.historyOnly ? read(page.value) : Promise.resolve(null),
    ])
    let records = initial
    if (records && !records.items.length && records.page > 1) {
      records = (await findLastPage(read, row => row.items.length > 0, row => row.hasMore, () => run === sequence))?.value ?? null
    }
    if (run !== sequence) return
    report.value = value
    history.value = records?.items ?? []; outcomes.value = checks
    if (records) {
      page.value = records.page
      if (!records.hasMore) historyTotal.value = (records.page - 1) * size + records.items.length
      historyHasMore.value = historyTotal.value === undefined ? records.hasMore : records.page * size < historyTotal.value
    }
  } catch (e) { if (run === sequence) error.value = e instanceof Error ? e.message : '建议读取失败' }
  finally { if (run === sequence) { historyLoading.value = false; reportLoading.value = false } }
}
async function reassess() {
  if (generating.value || reportLoading.value || !auth.hasPermission('SIM_PORTFOLIO_SELF_WRITE')) return
  const run = ++sequence
  const code = props.fundCode
  generating.value = true; error.value = ''
  try {
    await generateDecision(code)
    if (run === sequence) await load()
  } catch { if (run === sequence) error.value = '本次建议未能确认保存，请重新读取后再试。原建议保留。' }
  finally { generating.value = false }
}
async function historyPage(value: number, size = pageSize.value) {
  if (historyLoading.value || value < 1) return
  selectedHistory.value = null
  page.value = value; pageSize.value = size
  await load()
}
/** 历史接口没有总数，按非空页定位尾页；只读取报告，不触发生成或保存。 */
async function lastHistoryPage() {
  if (historyLoading.value || !historyHasMore.value) return
  const run = ++sequence
  const code = props.fundCode
  const size = pageSize.value
  selectedHistory.value = null
  historyLoading.value = true
  error.value = ''
  try {
    const last = await findLastPage(target => readFixedPage(async serverPage => {
      const items = await readDecisionHistory(code, serverPage)
      return { items, hasMore: items.length === 20 }
    }, target, size), rows => rows.items.length > 0, rows => rows.hasMore, () => run === sequence)
    if (!last || run !== sequence) return
    page.value = last.page
    historyTotal.value = (last.page - 1) * size + last.value.items.length
    await load()
  } catch { if (run === sequence) error.value = '暂时无法跳至尾页，请稍后重试。' }
  finally { if (run === sequence) historyLoading.value = false }
}
watch(() => [props.fundCode, props.initialReport, props.historyOnly] as const, () => { ++sequence; selectedHistory.value = null; page.value=1; historyTotal.value = undefined; historyHasMore.value = false; report.value = props.initialReport ?? null; history.value = []; if (props.fundCode) void load() }, { immediate: true })
onBeforeUnmount(() => { ++sequence; globalThis.clearInterval(clockTimer) })
</script>
<template>
  <section
    class="decision-panel"
    :aria-busy="historyLoading || reportLoading || generating"
    aria-label="持仓综合建议"
  >
    <div
      v-if="!historyOnly"
      class="section-heading"
    >
      <div>
        <h2>{{ title }}</h2>
      </div>
      <button
        v-if="!compact && !historyOnly && auth.hasPermission('SIM_PORTFOLIO_SELF_WRITE')"
        class="secondary-button"
        type="button"
        :disabled="generating || reportLoading"
        @click="reassess"
      >
        {{ generating ? '正在评估…' : report ? '重新评估' : '生成建议' }}
      </button>
    </div>
    <p
      v-if="error"
      class="error-message"
      role="alert"
    >
      {{ error }} <button
        class="secondary-button"
        @click="load"
      >
        重新读取
      </button>
    </p>
    <p
      v-if="reportLoading"
      role="status"
    >
      正在读取已保存的建议与依据，请稍候。
    </p>
    <template v-else-if="report && !historyOnly && isNew">
      <p
        v-if="needsReview"
        role="status"
      >
        {{ report.applicabilityMessage || '这份建议的适用时间已过，请重新评估。' }} 下方保留当时原文。
      </p>
      <HoldingAdviceDetails
        :report="report"
        :compact="compact"
      />
    </template>
    <template v-else-if="report && !historyOnly">
      <p
        v-if="needsReview"
        role="status"
      >
        {{ report.applicabilityMessage || '这份建议的适用时间已过，请重新评估。' }}
      </p>
      <p :class="{ 'error-message': report.generationStatus === 'FAILED' }">
        {{ report.error?.summary ?? report.summary }}
      </p>
      <p v-if="report.error">
        {{ report.error.nextAction }}
      </p>
      <ul v-if="!compact">
        <li
          v-for="reason in summaryEvidence"
          :key="reason"
        >
          {{ reason }}
        </li>
      </ul>
      <p class="decision-time">
        生成于 {{ time(report.generatedAt) }} · {{ report.defaultPreference ? '默认均衡实验策略' : `个人${{ SHORT: '短线', BALANCED: '均衡', LONG: '长线' }[report.preference]}偏好` }}
      </p>
      <details v-if="!compact">
        <summary>支持、中性、反对因素与本次未覆盖信息</summary>
        <h3>中性因素</h3><p v-if="!report.neutralEvidence?.length">
          本次没有单独记录的中性因子
        </p><ul>
          <li
            v-for="item in sortPredictionEvidence(report.neutralEvidence)"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
        <h3>支持因素</h3><p v-if="!report.supportingEvidence.length">
          本次没有正向因子
        </p><ul>
          <li
            v-for="item in sortPredictionEvidence(report.supportingEvidence)"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
        <h3>反对因素</h3><p v-if="!report.opposingEvidence.length">
          本次没有已计算的负向因子，不代表不存在风险
        </p><ul>
          <li
            v-for="item in sortPredictionEvidence(report.opposingEvidence)"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
        <h3>已接入事实</h3><ul>
          <li
            v-for="item in report.facts"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
        <h3>未覆盖信息</h3><ul>
          <li
            v-for="item in report.missingOptionalFactors"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
        <h3>执行条件</h3><ul>
          <li
            v-for="item in report.executionConstraints"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
      </details>
    </template>
    <p v-else-if="!error && !historyOnly">
      生成后保存当时的基金依据、持仓和操作安排。资料不足时会说明原因。
    </p>
    <div v-if="historyOnly">
      <p
        v-if="outcomeError"
        role="alert"
      >
        {{ outcomeError }}
      </p>
      <p v-if="!history.length">
        尚无保存记录
      </p>
      <article
        v-for="item in history"
        :key="item.reportId"
        class="decision-history"
      >
        <div class="decision-history-heading">
          <strong>{{ item.adviceState === 'INSUFFICIENT' ? '暂不形成建议' : labels[item.decision ?? ''] ?? '生成失败' }}</strong>
          <time>{{ time(item.generatedAt) }}</time>
        </div>
        <p>{{ item.summary }}</p>
        <button
          type="button"
          class="history-detail-button"
          aria-haspopup="dialog"
          @click="selectedHistory = item"
        >
          查看当时依据与核对 <span aria-hidden="true">›</span>
        </button>
      </article>
      <ListPagination 
        :page="page"
        :page-size="pageSize"
        :total="historyTotal"
        :loading="historyLoading"
        label="综合建议历史分页"
        :has-next="historyHasMore"
        @change="historyPage"
        @last="lastHistoryPage"
      />
    </div>
    <PredictionHistoryDrawer
      v-if="selectedHistory"
      :title="`${time(selectedHistory.generatedAt)} · 当时依据与核对`"
      @close="selectedHistory = null"
    >
      <HoldingAdviceDetails
        v-if="['HOLDING_ADVICE_V4_EVIDENCE', 'HOLDING_ADVICE_V5_PERSONAL'].includes(selectedHistory.strategyVersion)"
        :report="selectedHistory"
      />
      <template v-else>
        <h3>当时依据</h3>
        <p
          v-for="reason in sortPredictionEvidence([...selectedHistory.supportingEvidence,...(selectedHistory.neutralEvidence ?? []),...selectedHistory.opposingEvidence])"
          :key="reason"
        >
          {{ reason }}
        </p>
        <h3>到期核对</h3>
        <p v-if="!selectedHistory.modelRefs.length">
          本记录没有可核对的预测引用。
        </p>
        <div
          v-for="reference in sortPredictionHorizons(selectedHistory.modelRefs, reference => reference.horizonId)"
          :key="reference.predictionId"
        >
          <p>{{ { T5_V1: '五日', T20_V1: '二十日', M6_V1: '半年' }[reference.horizonId] || '对应周期' }}</p>
          <p v-if="!outcomes[reference.predictionId]?.outcomes?.length">
            {{ outcomes[reference.predictionId]?.check_state?.summary ?? '尚未到期或到期资料待齐，不计为正确或错误' }}
          </p>
          <p
            v-for="check in outcomes[reference.predictionId]?.outcomes"
            :key="check.checkedAt"
          >
            {{ time(check.checkedAt) }}核验：{{ check.correct ? '方向相符' : '方向不符' }}；区间总回报 {{ (Number(check.totalReturn)*100).toFixed(2) }}%
          </p>
        </div>
      </template>
    </PredictionHistoryDrawer>
    <RouterLink
      v-if="compact"
      :to="{ name: 'portfolio-advice', query: { fund: fundCode, from: route.fullPath } }"
    >
      查看完整分析与历史 →
    </RouterLink>
  </section>
</template>
<style scoped>
.decision-panel { padding:20px; margin:16px 0; border:1px solid #d6e4dd; border-radius:12px; background:#f7faf8; min-width:0; }
.decision-panel h2 { font-size:23px; margin:6px 0; }.decision-panel p,.decision-panel li { line-height:1.7; }
.decision-panel details { margin-top:16px; overflow-wrap:anywhere; font-size:14px; }.decision-panel summary { cursor:pointer; min-height:36px; }
.decision-time { color:#66766f; font-size:13px; }
.decision-history { border-top:1px solid #d6e4dd; padding:16px 0; }
.decision-history-heading { display:flex; align-items:baseline; justify-content:space-between; gap:8px 16px; flex-wrap:wrap; }
.decision-history-heading time { color:#66766f; font-size:13px; }
.history-detail-button { display:inline-flex; align-items:center; gap:8px; min-height:36px; padding:8px 0; border:0; background:transparent; color:var(--ui-primary); font:inherit; cursor:pointer; }
.history-detail-button:hover { color:var(--ui-ink); }
@media(max-width:600px) { .decision-panel { padding:16px; }.decision-panel button { min-height:44px; } }
</style>
