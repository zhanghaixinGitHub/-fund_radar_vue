<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { post } from '@/api/http'
import { readNarrative, safeEvidence } from '@/utils/predictionNarrative'
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
        v-for="(paragraph, index) in narrative.context.split('\n')"
        :key="index"
      >
        {{ paragraph }}
      </p>
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
</style>
