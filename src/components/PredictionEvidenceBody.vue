<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { post } from '@/api/http'
import { narrativeGroups, readNarrative, safeEvidence } from '@/utils/predictionNarrative'
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
const groups = computed(() => narrative.value ? narrativeGroups(narrative.value) : [])
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
    <template v-if="narrative">
      <p class="explanation-summary">
        {{ narrative.summary }}
      </p>
      <p
        v-if="detailed"
        class="explanation-notice"
      >
        本次把握较低，判断效果仍需后续实际结果检验。
      </p>
      <template
        v-for="group in groups"
        :key="group.title"
      >
        <h3
          v-if="detailed && group.drivers.length"
          class="reason-group"
        >
          {{ group.title }}
        </h3>
        <section
          v-for="(driver, index) in group.drivers"
          :key="`${driver.category}-${index}`"
          class="explanation-driver"
        >
          <div class="driver-heading">
            <h3>{{ driver.title }}</h3>
            <span>{{ driver.assessment }}</span>
          </div>
          <details
            v-if="detailed && driver.observation.length > 500"
            class="fact-source"
          >
            <summary>用到的具体数据与原文</summary>
            <p class="fact-text">
              {{ driver.observation }}
            </p>
          </details>
          <p
            v-else
            class="fact-text"
          >
            <strong v-if="detailed">用到的数据：</strong>{{ driver.observation }}
          </p>
          <p v-if="driver.meaning">
            <strong>这说明什么：</strong>{{ driver.meaning }}
          </p>
          <p v-if="driver.relation">
            <strong>与本基金的关系：</strong>{{ driver.relation }}
          </p>
          <p><strong>{{ detailed ? '对本次判断的作用：' : '可能影响：' }}</strong>{{ driver.implication }}</p>
          <div
            v-for="source in driver.sources ?? []"
            :key="source.url"
          >
            <a
              :href="source.url"
              target="_blank"
              rel="noopener noreferrer"
            >{{ source.title }} · {{ source.publishedDate }}</a>
          </div>
          <a
            v-if="driver.source"
            :href="driver.source.url"
            :aria-label="`查看原文：${driver.source.title}`"
            target="_blank"
            rel="noopener noreferrer"
          >查看{{ driver.category }}原文 · {{ driver.source.publishedDate }}</a>
        </section>
      </template>
      <h3
        v-if="detailed"
        class="reason-group"
      >
        为什么综合后这样判断
      </h3>
      <p
        v-for="(paragraph, index) in narrative.context.split('\n')"
        :key="index"
      >
        {{ paragraph }}
      </p>
      <section v-if="narrative.conditions?.length">
        <h3>什么情况会改变判断</h3>
        <ul>
          <li
            v-for="condition in narrative.conditions"
            :key="condition"
          >
            {{ condition }}
          </li>
        </ul>
      </section>
      <section class="explanation-limits">
        <h3>需要留意</h3>
        <ul>
          <li
            v-for="item in narrative.limitations"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
      </section>
      <details
        v-if="narrative.inventory"
        class="source-inventory"
      >
        <summary>查看本次资料范围</summary>
        <dl>
          <div
            v-for="row in narrative.inventory"
            :key="row.id"
          >
            <dt>{{ row.name }}</dt><dd>{{ row.detail }}</dd>
          </div>
        </dl>
      </details>
    </template>
    <template v-else>
      <p
        v-if="busy"
        class="explanation-notice"
      >
        说明整理中，先查看原始观察。
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
        <h3>需要留意</h3>
        <ul>
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
.prediction-explanation { color: #203a34; overflow-wrap: anywhere; line-height: 1.85; }
.prediction-explanation p { margin: 10px 0; font-size: 14px; }
.prediction-explanation .explanation-summary { font-size: 16px; font-weight: 600; margin: 16px 0 10px; }
.prediction-explanation section { margin-top: 18px; }
.prediction-explanation h3 { font-size: 14px; margin: 0 0 6px; }
.prediction-explanation ul { padding-left: 20px; margin: 6px 0; }
.prediction-explanation li { font-size: 14px; margin: 4px 0; }
.explanation-limits { color: #536c63; border-top: 1px solid #e2eae6; padding-top: 14px; }
.prediction-explanation .explanation-notice { color: #64776e; font-size: 13px; }
.explanation-facts { display: flex; flex-wrap: wrap; gap: 12px 28px; margin: 16px 0; }
.explanation-facts dt { font-size: 13px; color: #536c63; }
.explanation-facts dd { margin: 3px 0 0; font-variant-numeric: tabular-nums; font-weight: 600; }
.explanation-driver { border-top: 1px solid #e2eae6; padding-top: 14px; }
.driver-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 8px 16px; flex-wrap: wrap; }
.driver-heading span { color: #536c63; font-size: 12px; }
.explanation-driver a { color: #14776e; font-size: 13px; text-underline-offset: 3px; }
.fact-text { white-space: pre-line; }
.fact-source { margin: 10px 0; font-size: 14px; }
.fact-source summary { cursor: pointer; color: #14776e; }
.prediction-explanation .reason-group { margin-top: 24px; font-size: 15px; }
.source-inventory { font-size: 13px; margin-top: 18px; color: #536c63; }
.source-inventory summary { cursor: pointer; }
.source-inventory dl > div { display: flex; gap: 16px; padding: 6px 0; }
.source-inventory dt { min-width: 112px; }
.source-inventory dd { margin: 0; }
</style>
