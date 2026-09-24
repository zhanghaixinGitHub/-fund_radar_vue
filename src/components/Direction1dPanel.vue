<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { generateDirection1d, getDirection1dCurrent, getDirection1dEvidence } from '@/api/direction1d'
import type { Direction1dCurrent, Direction1dEvidence } from '@/types/direction1d'
import { dailyPredictionEvidence } from '@/utils/predictionEvidence'
import { assertDirection1dFundHistory, direction1dReason, direction1dSummary } from '@/utils/direction1d'

const props = defineProps<{ fundCode: string; selected: boolean }>()
const emit = defineEmits<{ select: [] }>()
const value = ref<Direction1dCurrent | null>(null)
const restoredEvidence = ref<Direction1dEvidence | null>(null)
const busy = ref(false)
const error = ref('')
const notice = ref('')
let sequence = 0

// 当前接口返回本基金最近一条记录。日期和依据都取自该记录，不能把旧结论套到本期日期。
const latest = computed(() => value.value?.history.items[0])
const forecast = computed(() => latest.value && !latest.value.status ? latest.value.forecast : null)
const summary = computed(() => forecast.value ? direction1dSummary(forecast.value) : null)
const isPrevious = computed(() => forecast.value && (forecast.value.targetNavDate !== value.value?.window.targetNavDate
  || forecast.value.schemaVersion !== 'DIRECTION_1D_EXPERIMENT_V2'))
const canGenerate = computed(() => value.value?.window.status === 'OPEN'
  && value.value.coverage.status === 'READY_EXPERIMENTAL' && (!forecast.value || isPrevious.value))
/** 不能生成时保留真实原因，页面用展开说明承接，不堆叠禁用按钮。 */
const generateHint = computed(() => {
  const current = value.value
  if (!current) return ''
  if (forecast.value && !isPrevious.value) return '本期预测已生成，无需重复执行。'
  if (current.coverage.status !== 'READY_EXPERIMENTAL') return direction1dReason(current.coverage.status)
  if (current.window.status !== 'OPEN') return '目标估值日已收盘，等待最新净值后预测下一估值日。'
  return `所需净值截至 ${current.window.baseNavDate}，本期预测目标为 ${current.window.targetNavDate}。`
})

/** 没有预测时只说明阻止当前判断的原因，不向用户罗列内部检查状态。 */
const emptyReason = computed(() => {
  if (latest.value?.status) return '这次预测记录暂不可用，请稍后重试。'
  const current = value.value
  if (!current) return ''
  if (current.coverage.status !== 'READY_EXPERIMENTAL') return direction1dReason(current.coverage.status)
  return current.window.status === 'OPEN' ? '本期预测尚未生成。' : '本期暂无预测，等待下一期更新。'
})

/** 切换基金时清空旧内容，并只接纳当前基金最后一次读取的结果。 */
async function load() {
  const current = ++sequence
  const fundCode = props.fundCode
  busy.value = true
  error.value = ''
  value.value = null
  restoredEvidence.value = null
  try {
    const result = await getDirection1dCurrent(fundCode)
    assertDirection1dFundHistory(fundCode, result.history.items)
    if (current === sequence) {
      value.value = result
      const record = result.history.items[0]
      if (record && !record.status) {
        // 解释是独立只读请求，失败时仍显示原预测和真实输入，不能让解释服务遮住结论。
        void getDirection1dEvidence(fundCode, record.forecastId).then(explanation => {
          if (current === sequence) restoredEvidence.value = explanation
        }).catch(() => { /* 缺少可核对解释时由依据区域明确展示限制，不虚构指标作用。 */ })
      }
    }
  } catch (e) { if (current === sequence) error.value = e instanceof Error ? e.message : '读取失败。' }
  finally { if (current === sequence) busy.value = false }
}
/** 保留原有手动生成入口；离开或切换基金后，不让旧请求的反馈覆盖新页面。 */
async function generate() {
  const current = sequence
  busy.value = true
  error.value = ''
  notice.value = ''
  try {
    const result = await generateDirection1d(props.fundCode)
    if (current !== sequence) return
    notice.value = result.status === 'PREDICTED' ? '' : direction1dReason(result.reason ?? result.status)
    await load()
  } catch (e) { if (current === sequence) error.value = e instanceof Error ? e.message : '请求失败。' }
  finally { if (current === sequence) busy.value = false }
}
watch(() => props.fundCode, () => { notice.value = ''; void load() }, { immediate: true })
/** 统一更新按钮沿用一日接口和生成窗口，已有本期记录时只读回，不重复生成。 */
async function refresh(generateMissing = false) {
  notice.value = ''
  await load()
  if (generateMissing && canGenerate.value) await generate()
}
const evidence = computed(() => dailyPredictionEvidence(forecast.value, restoredEvidence.value))
const evidenceStatus = computed(() => error.value ? '一天预测暂时无法读取，请更新后重试。' : notice.value || (isPrevious.value ? '本期暂无新结果，以下依据对应上次预测。' : !forecast.value ? emptyReason.value : ''))
defineExpose({ refresh, busy, evidence, evidenceStatus, forecast, generateHint })
onBeforeUnmount(() => { sequence++ })
</script>

<template>
  <button
    type="button"
    class="forecast-card"
    :class="{ 'is-selected': selected }"
    :aria-pressed="selected"
    :aria-busy="busy"
    aria-controls="prediction-evidence"
    aria-label="查看下一交易日的预测依据"
    @click="emit('select')"
  >
    <span class="forecast-card-title">下一交易日</span>
    <span class="forecast-duration">看一天的涨跌</span>
    <strong
      class="forecast-direction"
      :class="`tone-${summary?.tone ?? 'neutral'}`"
    >
      {{ busy && !value ? '正在读取…' : error ? '暂不可用' : summary && !['暂无预测', '方向不明确'].includes(summary.direction)
        ? `预计${summary.direction}` : summary?.direction ?? '暂无预测' }}
    </strong>
    <span class="forecast-period">{{ forecast?.targetNavDate ?? value?.window.targetNavDate ?? '日期待确认' }}</span>
    <span class="forecast-data-date">{{ forecast ? `依据净值截至 ${forecast.baseNavDate}` : '所需数据暂未齐全' }}</span>
    <span
      v-if="isPrevious"
      class="forecast-card-status"
    >上次结果</span>
    <span class="forecast-card-action">{{ selected ? '正在查看依据' : '点击查看依据' }}</span>
  </button>
</template>
