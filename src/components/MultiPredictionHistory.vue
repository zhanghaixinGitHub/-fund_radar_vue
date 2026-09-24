<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { get } from '@/api/http'
import { getDirection1dEvidence, getDirection1dFundHistory } from '@/api/direction1d'
import type { Direction1dEvidence } from '@/types/direction1d'
import { usePredictionHistory } from '@/composables/usePredictionHistory'
import { groupPredictionHistory, historyItemView, historyPeriods } from '@/utils/predictionHistory'
import type { HistoryItem, MultiHistoryRow } from '@/utils/predictionHistory'
import { dailyPredictionEvidence, multiPredictionEvidence } from '@/utils/predictionEvidence'

const props = defineProps<{ fundCode: string }>()
const { multi, daily, busy, errors, more, hasMore, load, dailyDateComplete } = usePredictionHistory(
  () => props.fundCode,
  {
    multi: (code, cursor) => get<{ items: MultiHistoryRow[] }>(`/api/v1/watchlist/${code}/predictions/history${cursor
      ? `?before=${encodeURIComponent(cursor.generatedAt)}&beforeId=${encodeURIComponent(cursor.predictionId)}` : ''}`),
    daily: getDirection1dFundHistory,
  },
)
const expandedId = ref<string | null>(null)
const dailyEvidence = ref<Record<string, Direction1dEvidence>>({})
const evidenceLoadingId = ref<string | null>(null)
const evidenceErrorId = ref<string | null>(null)
let sequence = 0

/** 四个周期保留固定位置；跨页的一日记录读齐前不展示可能已经过时的版本。 */
const days = computed(() => groupPredictionHistory(props.fundCode, multi.value, daily.value).map(day => ({
  date: day.date,
  slots: historyPeriods.map(period => {
    const source = period.id === 'T1_V1' ? 'daily' : 'multi'
    const complete = source === 'multi' || dailyDateComplete(day.date)
    const item = complete ? day.items[period.id] : undefined
    return { ...period, item, view: item ? historyItemView(item) : null,
      empty: errors.value[source] ? '暂时无法读取' : busy.value ? '正在读取…'
        : !complete || more.value[source] ? '还有记录待加载' : '暂无预测',
    }
  }),
})))
const selected = computed(() => days.value.flatMap(day => day.slots).find(slot => slot.item?.id === expandedId.value))
const evidence = computed(() => {
  const item = selected.value?.item
  if (!item) return null
  return item.kind === 'daily' ? dailyPredictionEvidence(item.record.forecast, dailyEvidence.value[item.id])
    : multiPredictionEvidence(item.record.payload)
})
const invalidDaily = computed(() => daily.value.some(record => record.status))

/** 北京时间展示真实生成时刻，分组本身只使用接口提供的预测日期。 */
function timeText(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '时间暂缺' : date.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

/** 一日具体依据按需读取并按记录缓存；失败只影响解释，不覆盖已保存的预测结论。 */
async function readEvidence(item: HistoryItem) {
  if (item.kind !== 'daily' || dailyEvidence.value[item.id]) return
  const run = sequence
  evidenceLoadingId.value = item.id
  evidenceErrorId.value = null
  try {
    const result = await getDirection1dEvidence(props.fundCode, item.id)
    if (run === sequence) dailyEvidence.value[item.id] = result
  } catch {
    if (run === sequence) evidenceErrorId.value = item.id
  } finally {
    if (run === sequence && evidenceLoadingId.value === item.id) evidenceLoadingId.value = null
  }
}
function toggleEvidence(item: HistoryItem) {
  expandedId.value = expandedId.value === item.id ? null : item.id
  if (expandedId.value) void readEvidence(item)
}
watch(() => props.fundCode, () => {
  sequence++
  expandedId.value = null
  dailyEvidence.value = {}
  evidenceLoadingId.value = null
  evidenceErrorId.value = null
}, { flush: 'sync' })
onBeforeUnmount(() => { sequence++ })
</script>

<template>
  <section
    class="prediction-history"
    aria-labelledby="prediction-history-title"
    :aria-busy="busy"
  >
    <header class="history-heading">
      <div>
        <h2 id="prediction-history-title">
          预测历史
        </h2>
        <p>按预测起始日归组，每个周期只显示最新一条。</p>
      </div>
      <span
        v-if="days.length"
        class="history-count"
      >已展示 {{ days.length }} 个日期</span>
    </header>
    <template
      v-for="source in (['daily', 'multi'] as const)"
      :key="source"
    >
      <p
        v-if="errors[source]"
        class="history-error"
        role="alert"
      >
        {{ errors[source] }}
        <button
          class="history-link"
          :disabled="busy"
          @click="load(source)"
        >
          重试
        </button>
      </p>
    </template>
    <p
      v-if="invalidDaily"
      class="history-notice"
      role="status"
    >
      部分一日预测记录暂不可用，已停止展示这些记录。
    </p>
    <p
      v-if="busy && !days.length"
      class="history-empty"
      role="status"
    >
      正在读取预测记录…
    </p>
    <p
      v-else-if="!days.length && !errors.daily && !errors.multi && !invalidDaily"
      class="history-empty"
    >
      暂无预测记录，生成预测后可在这里回看。
    </p>

    <article
      v-for="day in days"
      :key="day.date"
      class="history-day"
      :aria-labelledby="`history-day-${day.date}`"
    >
      <header class="history-day-heading">
        <h3 :id="`history-day-${day.date}`">
          {{ day.date }}
        </h3>
        <span>预测起始日</span>
      </header>
      <div class="history-periods">
        <section
          v-for="slot in day.slots"
          :key="slot.id"
          class="history-slot"
          :aria-label="`${day.date} ${slot.label}预测`"
        >
          <div class="history-slot-heading">
            <h4>{{ slot.label }}</h4>
            <span>{{ slot.duration }}</span>
          </div>
          <template v-if="slot.item && slot.view">
            <strong
              class="history-direction"
              :class="`tone-${slot.view.tone}`"
            >{{ slot.view.direction }}</strong>
            <p class="history-period">
              <template v-if="slot.item.kind === 'daily'">
                对比 {{ slot.view.dataDate }} 净值
              </template>
              <template v-else-if="slot.view.endDate === '待确认'">
                到期日待确认
              </template>
              <template v-else>
                至 {{ slot.view.endDate }}{{ slot.view.estimated ? '（预计）' : '' }}
              </template>
            </p>
            <dl class="history-results">
              <div>
                <dt>实际涨跌</dt><dd>
                  {{ slot.view.actual }}<span
                    v-if="slot.view.actualDirection"
                    class="history-actual-direction"
                  > · {{ slot.view.actualDirection }}</span>
                </dd>
              </div>
              <div>
                <dt>结果</dt><dd>
                  <span
                    class="history-result"
                    :class="`is-${slot.view.resultTone}`"
                  >{{ slot.view.result }}</span>
                </dd>
              </div>
            </dl>
            <p class="history-generated">
              生成于 {{ timeText(slot.item.generatedAt) }}
            </p>
            <button
              class="history-link history-basis-toggle"
              :aria-expanded="expandedId === slot.item.id"
              :aria-controls="expandedId === slot.item.id ? `history-basis-${day.date}` : undefined"
              :aria-label="`${day.date} ${slot.label}预测依据`"
              @click="toggleEvidence(slot.item)"
            >
              {{ expandedId === slot.item.id ? '收起依据' : '查看依据' }}
              <span aria-hidden="true">{{ expandedId === slot.item.id ? '−' : '+' }}</span>
            </button>
          </template>
          <p
            v-else
            class="history-slot-empty"
          >
            {{ slot.empty }}
          </p>
        </section>
      </div>
      <div
        v-if="selected?.item?.date === day.date && selected.view && evidence"
        :id="`history-basis-${day.date}`"
        class="history-basis"
      >
        <div class="history-basis-heading">
          <h4>{{ selected.label }}预测依据</h4>
          <span>数据截至 {{ selected.view.dataDate || '日期暂缺' }}</span>
        </div>
        <p
          v-if="evidenceLoadingId === selected.item.id"
          role="status"
        >
          正在读取判断依据…
        </p>
        <template v-else>
          <p
            v-if="evidenceErrorId === selected.item.id"
            class="history-notice"
          >
            具体依据暂时无法读取，以下保留当时的数据摘要。
            <button
              class="history-link"
              @click="readEvidence(selected.item)"
            >
              重试
            </button>
          </p>
          <p>{{ evidence.summary }}</p>
          <ul v-if="evidence.supporting.length || evidence.opposing.length">
            <li
              v-for="reason in [...evidence.supporting, ...evidence.opposing]"
              :key="reason"
            >
              {{ reason }}
            </li>
          </ul>
          <ul v-else-if="evidence.facts.length">
            <li
              v-for="fact in evidence.facts"
              :key="fact.label"
            >
              {{ fact.label }}：{{ fact.value }}
            </li>
          </ul>
          <p>{{ selected.view.rule }}</p>
          <p
            v-if="selected.view.caution"
            class="history-notice"
          >
            {{ selected.view.caution }}
          </p>
          <ul class="history-limitations">
            <li
              v-for="limitation in evidence.limitations"
              :key="limitation"
            >
              {{ limitation }}
            </li>
          </ul>
          <p
            v-if="selected.view.updatedAt"
            class="history-meta"
          >
            结果更新于 {{ timeText(selected.view.updatedAt) }}
          </p>
        </template>
      </div>
    </article>
    <footer
      v-if="days.length || hasMore"
      class="history-footer"
    >
      <p v-if="days.length">
        到期且数据齐备后显示结果；预测仅供参考，不代表收益承诺。
      </p>
      <button
        v-if="hasMore"
        class="secondary-button"
        :disabled="busy"
        @click="load()"
      >
        {{ busy ? '正在加载…' : '加载更早记录' }}
      </button>
    </footer>
  </section>
</template>

<style scoped>
.prediction-history { min-width: 0; margin-top: 24px; container: prediction-history / inline-size; }
.history-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 18px; }
.prediction-history .history-heading h2 { margin: 0 0 6px; font-size: 20px; }
.history-heading p { margin: 0; color: #536c63; font-size: 13px; }
.history-count { flex-shrink: 0; padding-top: 5px; color: #536c63; font-size: 12px; }
.history-day { margin-top: 16px; overflow: hidden; border: 1px solid var(--workspace-border, #dfe8e3); border-radius: 10px; background: #fff; }
.history-day-heading { display: flex; align-items: baseline; flex-wrap: wrap; gap: 12px; padding: 14px 20px; background: #f8faf9; border-bottom: 1px solid #e4ebe7; }
.history-day-heading h3 { margin: 0; font-size: 18px; font-variant-numeric: tabular-nums; }
.history-day-heading span { color: #536c63; font-size: 12px; }
.history-periods { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); padding: 18px 0; }
.history-slot { display: flex; flex-direction: column; min-width: 0; padding: 0 20px; border-right: 1px solid #e4ebe7; overflow-wrap: anywhere; }
.history-slot:last-child { border-right: 0; }
.history-slot-heading { display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 12px; }
.history-slot-heading h4 { margin: 0; font-size: 16px; }
.history-slot-heading span { color: #536c63; font-size: 12px; }
.history-direction { display: block; margin-top: 14px; font-size: 23px; line-height: 1.5; font-weight: 600; }
.tone-up { color: #b43d3d; }
.tone-down { color: #0f766e; }
.tone-flat, .tone-neutral, .tone-non_up, .tone-non-up { color: #536c63; }
.history-period { margin: 6px 0 16px; color: #536c63; font-size: 12px; font-variant-numeric: tabular-nums; }
.history-results { margin: 0; font-size: 13px; }
.history-results > div { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 4px 10px; margin-top: 8px; }
.history-results dt { color: #536c63; }
.history-results dd { margin: 0; font-variant-numeric: tabular-nums; }
.history-actual-direction { color: #536c63; font-size: 12px; }
.history-result { display: inline-block; padding: 2px 8px; border-radius: 5px; font-size: 12px; }
.is-pending { background: #f0f3f1; color: #536c63; }
.is-correct { background: #e8f4ee; color: #176348; }
.is-incorrect { background: #fcf1e9; color: #925623; }
.history-generated { margin: 16px 0 0; color: #647b72; font-size: 11px; font-variant-numeric: tabular-nums; }
.history-link { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 8px 0; border: 0; background: transparent; color: #0f766e; font: inherit; font-size: 13px; cursor: pointer; }
.history-basis-toggle { align-self: flex-start; margin-top: auto; }
.history-link:hover { text-decoration: underline; }
.prediction-history button:focus-visible { outline: 2px solid #0f766e; outline-offset: 3px; }
.history-link:disabled { opacity: .55; cursor: wait; }
.history-slot-empty { margin: 26px 0; color: #647b72; font-size: 15px; }
.history-basis { padding: 18px 20px; background: #f6faf8; border-top: 1px solid #dfe8e3; overflow-wrap: anywhere; line-height: 1.8; font-size: 13px; }
.history-basis-heading { display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px 20px; }
.history-basis-heading h4 { margin: 0; font-size: 15px; }
.history-basis-heading span, .history-meta { color: #536c63; font-size: 12px; }
.history-basis p { max-width: 88ch; margin: 10px 0; }
.history-basis ul { max-width: 88ch; padding-left: 20px; margin: 10px 0; }
.history-basis li { margin: 4px 0; }
.history-limitations { color: #536c63; }
.history-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-top: 18px; }
.history-footer p { margin: 0; color: #536c63; font-size: 12px; }
.history-footer button { min-height: 44px; font-size: 13px; }
.history-empty { margin: 0; padding: 40px 16px; text-align: center; color: #536c63; background: #fff; border: 1px solid #dfe8e3; border-radius: 8px; }
.history-error { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin: 12px 0; color: #a23c3c; }
.history-notice { color: #805a19; font-size: 13px; }
/* 卡片按实际内容区宽度变成两列或一列，展开侧栏也不会挤压周期与日期。 */
@container prediction-history (max-width: 900px) {
  .history-periods { grid-template-columns: repeat(2, minmax(0, 1fr)); padding: 0; }
  .history-slot { padding: 18px 20px; }
  .history-slot:nth-child(2n) { border-right: 0; }
  .history-slot:nth-child(n+3) { border-top: 1px solid #e4ebe7; }
}
@container prediction-history (max-width: 460px) {
  .history-heading { flex-wrap: wrap; gap: 8px; }
  .history-periods { grid-template-columns: minmax(0, 1fr); }
  .history-slot { border-right: 0; }
  .history-slot + .history-slot { border-top: 1px solid #e4ebe7; }
}
</style>
