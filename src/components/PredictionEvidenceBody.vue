<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { post } from '@/api/http'
import { readNarrative, safeEvidence } from '@/utils/predictionNarrative'
import { explanationPercent, predictionExplanationView } from '@/utils/predictionExplanation'
import type { PredictionEvidence, PredictionNarrative, PredictionNarrativeResponse } from '@/types/predictionEvidence'

const props = defineProps<{
  fundCode: string
  kind: 'daily' | 'multi'
  recordId?: string
  evidence: PredictionEvidence
}>()
const narrative = ref<PredictionNarrative | null>(null)
const busy = ref(false)
const unavailable = ref(false)
const fallback = computed(() => safeEvidence(props.evidence))
const detailed = computed(() => narrative.value?.styleVersion === 'PREDICTION_INFORMATION_ZH_V4')
// 完整依据统一组织为原因、相反因素和资料限制；不在各条原因中重复塞入原文、日期或声明。
const presentation = computed(() => narrative.value ? predictionExplanationView(narrative.value, props.fundCode) : null)
let sequence = 0
let timer: ReturnType<typeof globalThis.setTimeout> | undefined

/** 只整理所选原记录的文案；服务端缓存成功结果，最多有限等待，不生成新预测。 */
async function load(run: number, attempts = 0) {
  const { fundCode, kind, recordId } = props
  if (!recordId) return
  busy.value = true
  try {
    const path = kind === 'daily'
      ? `/api/v1/watchlist/${encodeURIComponent(fundCode)}/prediction-1d/evidence/${encodeURIComponent(recordId)}/narrative`
      : `/api/v1/watchlist/${encodeURIComponent(fundCode)}/predictions/${encodeURIComponent(recordId)}/narrative`
    const response = await post<PredictionNarrativeResponse>(path)
    if (run !== sequence) return
    narrative.value = readNarrative(response, fundCode, kind, recordId)
    if (response.state === 'PENDING' && attempts < 12) {
      timer = globalThis.setTimeout(() => void load(run, attempts + 1), 2500)
      return
    }
    busy.value = false
    unavailable.value = !narrative.value
  } catch {
    if (run !== sequence) return
    busy.value = false
    unavailable.value = true
  }
}
watch(() => [props.fundCode, props.kind, props.recordId], () => {
  const run = ++sequence
  globalThis.clearTimeout(timer)
  narrative.value = null
  busy.value = false
  unavailable.value = false
  if (props.recordId) void load(run)
}, { immediate: true })
onBeforeUnmount(() => { ++sequence; globalThis.clearTimeout(timer) })
</script>

<template>
  <div
    class="prediction-explanation"
    aria-live="polite"
    :aria-busy="busy"
  >
    <template v-if="presentation">
      <p class="explanation-summary">
        {{ presentation.summary || '本次预测的说明暂不完整。' }}
      </p>
      <p
        v-if="detailed && !presentation.summary.includes('把握较低')"
        class="explanation-notice"
      >
        本次判断把握较低。
      </p>
      <section
        v-for="group in presentation.groups"
        :key="group.title"
        class="reason-group"
      >
        <h3>{{ group.title }}</h3>
        <article
          v-for="(reason, index) in group.drivers"
          :key="index"
          class="explanation-reason"
        >
          <header class="reason-heading">
            <h4>{{ reason.title }}</h4><span>{{ reason.assessment }}</span>
          </header>
          <ul
            v-if="reason.points.length"
            class="reason-points"
          >
            <li
              v-for="point in reason.points"
              :key="point"
            >
              {{ point }}
            </li>
          </ul>
          <div
            v-if="reason.holdings.length"
            class="holdings-facts"
          >
            <table>
              <caption>
                行情：{{ reason.quoteDate ?? '日期见各行' }} · 持仓：{{ reason.reportDate ?? '日期见各行' }}（部分披露）
              </caption>
              <thead>
                <tr>
                  <th scope="col">
                    股票
                  </th><th scope="col">
                    当日涨跌
                  </th><th scope="col">
                    披露占比
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(holding, holdingIndex) in reason.holdings"
                  :key="holdingIndex"
                >
                  <th scope="row">
                    {{ holding.name }}
                  </th>
                  <td>{{ explanationPercent(holding.change) }}<small v-if="!reason.quoteDate">{{ holding.date ?? '日期暂缺' }}</small></td>
                  <td>{{ holding.weight === null ? '暂缺' : holding.weight.toFixed(2) + '%' }}<small v-if="!reason.reportDate">{{ holding.reportDate ?? '日期暂缺' }}</small></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p
            v-if="reason.relationship"
            class="relationship"
          >
            {{ reason.relationship }}
          </p>
          <ul
            v-if="reason.observations.length"
            class="observation-points"
          >
            <li
              v-for="fact in reason.observations"
              :key="fact"
            >
              {{ fact }}
            </li>
          </ul>
          <p
            v-for="market in reason.markets"
            :key="market"
            class="market-fact"
          >
            市场参考：{{ market }}
          </p>
        </article>
      </section>
      <section
        v-if="presentation.context.length"
        class="reason-group"
      >
        <h3>综合考虑</h3><ul class="reason-points">
          <li
            v-for="point in presentation.context"
            :key="point"
          >
            {{ point }}
          </li>
        </ul>
      </section>
      <section
        v-if="presentation.conditions.length"
        class="reason-group"
      >
        <h3>什么时候需要重新判断</h3><ul class="reason-points">
          <li
            v-for="condition in presentation.conditions"
            :key="condition"
          >
            {{ condition }}
          </li>
        </ul>
      </section>
      <section
        v-if="presentation.notes.length"
        class="explanation-limits"
      >
        <h3>阅读时需要留意</h3><ul>
          <li
            v-for="note in presentation.notes"
            :key="note"
          >
            {{ note }}
          </li>
        </ul>
      </section>
      <footer
        v-if="presentation.documents.length"
        class="report-sources"
      >
        <h3>参考报告</h3>
        <ul>
          <li
            v-for="source in presentation.documents"
            :key="source.url"
          >
            <a
              :href="source.url"
              target="_blank"
              rel="noopener noreferrer"
            >{{ source.title }}</a><span>披露于 {{ source.publishedDate }}</span>
          </li>
        </ul>
      </footer>
    </template>
    <template v-else>
      <p
        v-if="busy"
        class="explanation-notice"
      >
        说明整理中，先查看已核实的数据。
      </p>
      <p
        v-else-if="unavailable"
        class="explanation-notice"
      >
        完整说明暂不可用。
      </p>
      <p class="explanation-summary">
        {{ fallback.summary }}
      </p>
      <dl
        v-if="fallback.facts.length"
        class="explanation-facts"
      >
        <div
          v-for="fact in fallback.facts"
          :key="fact.label"
        >
          <dt>{{ fact.label }}</dt><dd>{{ fact.value }}</dd>
        </div>
      </dl>
      <section class="explanation-limits">
        <h3>阅读时需要留意</h3><ul>
          <li
            v-for="item in fallback.limitations"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<style scoped>
/* 依据面板与所在内容区等宽；内边距和边框计入宽度，宽屏不留空白，窄屏不溢出。 */
.prediction-explanation { box-sizing: border-box; width: 100%; min-width: 0; max-width: none; padding: 20px 24px; border: 1px solid #dfe8e3; border-radius: 6px; background: #fff; color: #203a34; font-size: 14px; line-height: 1.65; overflow-wrap: break-word; }
.prediction-explanation .explanation-summary { margin: 0 0 18px; color: #17332e; font-size: 16px; font-weight: 600; }
.prediction-explanation h3 { margin: 0 0 10px; font-size: 15px; font-weight: 600; }
.prediction-explanation h4 { margin: 0; font-size: 14px; font-weight: 600; }
.prediction-explanation p { margin: 6px 0; max-width: 100%; }
.prediction-explanation ul { margin: 6px 0 0; padding-left: 19px; }
.prediction-explanation li { margin: 4px 0; }
.reason-group + .reason-group { margin-top: 22px; }
.explanation-reason { margin-top: 12px; }
.explanation-reason + .explanation-reason { border-top: 1px solid #e6eeea; padding-top: 14px; }
.reason-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 6px; }
.reason-heading span { flex-shrink: 0; font-size: 12px; color: #536c63; }
.reason-points, .observation-points { max-width: 100%; }
.holdings-facts { margin: 12px 0 8px; overflow-x: auto; }
.holdings-facts table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
.holdings-facts caption { padding-bottom: 7px; color: #536c63; text-align: left; font-size: 12px; }
.holdings-facts th, .holdings-facts td { padding: 8px 12px; border-bottom: 1px solid #e6eeea; vertical-align: top; }
.holdings-facts thead { background: #f2f7f4; color: #536c63; }
.holdings-facts th { font-weight: 500; }
.holdings-facts td { font-variant-numeric: tabular-nums; }
.holdings-facts small { display: block; color: #536c63; font-size: 12px; }
.prediction-explanation .relationship, .prediction-explanation .market-fact { font-size: 13px; color: #536c63; }
.prediction-explanation .market-fact { margin: 3px 0; }
.explanation-limits, .report-sources { margin-top: 20px; padding-top: 14px; border-top: 1px solid #dfe8e3; color: #536c63; font-size: 13px; }
.explanation-limits h3, .report-sources h3 { font-size: 14px; }
.prediction-explanation .explanation-notice { color: #64776e; font-size: 13px; }
.report-sources ul { padding: 0; list-style: none; }
.report-sources li { display: flex; align-items: baseline; flex-wrap: wrap; gap: 2px 12px; }
.report-sources a { color: #14776e; text-underline-offset: 3px; }
.report-sources span { font-size: 12px; }
.report-sources a:focus-visible { outline: 2px solid #14776e; outline-offset: 3px; }
.explanation-facts { display: grid; gap: 10px 24px; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
.explanation-facts dt { color: #536c63; font-size: 13px; }
.explanation-facts dd { margin: 2px 0 0; font-variant-numeric: tabular-nums; }
@media (max-width: 600px) {
  .prediction-explanation { padding: 16px; }
  .holdings-facts th, .holdings-facts td { padding: 7px 6px; }
  .reason-heading { flex-wrap: wrap; gap: 4px 10px; }
}
</style>
