<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { generateDirection1d, getDirection1dCurrent, getDirection1dEvidence } from '@/api/direction1d'
import type { Direction1dCurrent, Direction1dEvidence } from '@/types/direction1d'
import { dailyPredictionEvidence } from '@/utils/predictionEvidence'
import { assertDirection1dFundHistory, direction1dDisplayRecord, direction1dReason, direction1dSummary } from '@/utils/direction1d'
import { createUUID } from '@/utils/uuid'

const props = defineProps<{ fundCode: string; selected: boolean }>()
const emit = defineEmits<{ select: [] }>()
const value = ref<Direction1dCurrent | null>(null)
const restoredEvidence = ref<Direction1dEvidence | null>(null)
const busy = ref(false)
const error = ref('')
const notice = ref('')
let sequence = 0
let pendingRequest: { target: string; id: string } | null = null
let windowTimer: ReturnType<typeof globalThis.setTimeout> | undefined
const windowExpired = ref(false)

// 日期只取预测接口的当前窗口：交易日15点前为当天，15点起为下一交易日。
// 窗口到期而新窗口尚未读回时，先隐藏旧结果，不能把旧方向继续用于新的预测时段。
const targetDate = computed(() => windowExpired.value ? null : value.value?.window.targetNavDate ?? null)
const record = computed(() => windowExpired.value ? null : direction1dDisplayRecord(value.value, props.fundCode))
const forecastId = computed(() => record.value?.forecastId)
const forecast = computed(() => record.value?.forecast ?? null)
const summary = computed(() => forecast.value ? direction1dSummary(forecast.value) : null)
const canGenerate = computed(() => value.value?.window.status === 'OPEN'
  && targetDate.value !== null
  && value.value.coverage.status === 'READY_EXPERIMENTAL')
/** 不能生成时保留真实原因，页面用展开说明承接，不堆叠禁用按钮。 */
const generateHint = computed(() => {
  const current = value.value
  if (!current) return ''
  if (forecast.value) return '截止前可检查新资料；没有变化时保留原判断和时间。'
  if (!targetDate.value) return '预测日期尚未确认，暂时无法生成预测。'
  if (current.coverage.status !== 'READY_EXPERIMENTAL') return direction1dReason(current.coverage.status)
  if (current.window.status !== 'OPEN') return '目标估值日已收盘，等待最新净值后预测下一估值日。'
  return `核对本期综合资料，预测目标为 ${current.window.targetNavDate}。`
})

/** 没有预测时只说明阻止当前判断的原因，不向用户罗列内部检查状态。 */
const emptyReason = computed(() => {
  const current = value.value
  if (!current) return ''
  if (!targetDate.value) return '预测日期更新中，暂无预测。'
  if (current.coverage.status !== 'READY_EXPERIMENTAL') return direction1dReason(current.coverage.status)
  return '本期综合资料分析尚未完成，暂无预测。'
})

/**
 * 根据接口给出的下一次窗口切换时刻执行只读刷新，不另算交易日或生成新预测。
 * 到点先失效旧窗口；极少数迟到的旧窗口响应短暂重读，仍不展示过期结果。
 */
function scheduleWindowRefresh() {
  globalThis.clearTimeout(windowTimer)
  const boundary = Date.parse(value.value?.window.nextWindowOpenAt ?? '')
  windowExpired.value = !Number.isFinite(boundary) || boundary <= Date.now()
  if (!Number.isFinite(boundary)) return
  windowTimer = globalThis.setTimeout(() => {
    windowTimer = undefined
    windowExpired.value = true
    notice.value = ''
    void load()
  }, windowExpired.value ? 5000 : Math.min(boundary - Date.now(), 2_147_483_647))
}

/** 切换基金时清空旧内容，并只接纳当前基金最后一次读取的结果。 */
async function load() {
  const current = ++sequence
  const fundCode = props.fundCode
  busy.value = true
  error.value = ''
  if (value.value?.coverage.fundCode !== fundCode) {
    value.value = null
    restoredEvidence.value = null
  }
  try {
    const result = await getDirection1dCurrent(fundCode)
    assertDirection1dFundHistory(fundCode, result.history.items)
    if (current === sequence) {
      const previousId = forecastId.value
      value.value = result
      scheduleWindowRefresh()
      const displayed = record.value
      if (displayed?.forecastId !== previousId) restoredEvidence.value = null
      if (displayed) {
        // 只读取当前展示记录的依据；旧档及跨日后迟到的依据都不能进入本期卡片。
        void getDirection1dEvidence(fundCode, displayed.forecastId).then(explanation => {
          if (current === sequence && forecastId.value === displayed.forecastId) restoredEvidence.value = explanation
        }).catch(() => { /* 缺少可核对解释时由依据区域明确展示限制，不虚构指标作用。 */ })
      }
    }
  } catch (e) { if (current === sequence) error.value = e instanceof Error ? e.message : '读取失败。' }
  finally { if (current === sequence) busy.value = false }
}
/** 保留原有手动生成入口；离开或切换基金后，不让旧请求的反馈覆盖新页面。 */
async function generate() {
  if (!canGenerate.value) return
  const current = sequence
  busy.value = true
  error.value = ''
  notice.value = ''
  try {
    const target = value.value?.window.targetNavDate
    if (!target) return
    if (!pendingRequest || pendingRequest.target !== target) pendingRequest = { target, id: createUUID() }
    const fundCode = props.fundCode
    const requestId = pendingRequest.id
    let result = await generateDirection1d(fundCode, target, requestId)
    // 仅延续用户这一次点击，复用同一请求编号；切换基金或离开页面即停止跟进。
    for (let attempts = 0; current === sequence && ['QUEUED', 'RUNNING'].includes(result.status) && attempts < 180; attempts++) {
      notice.value = '正在整理资料并核对判断，请稍候。'
      await new Promise(resolve => globalThis.setTimeout(resolve, 5000))
      if (current !== sequence) return
      result = await generateDirection1d(fundCode, target, requestId)
    }
    if (current !== sequence) return
    notice.value = result.status === 'PREDICTED'
      ? result.reused ? '已检查，暂无新的判断。' : ''
      : ['QUEUED', 'RUNNING'].includes(result.status) ? '分析仍在进行，稍后点击更新查看结果。' : direction1dReason(result.reason ?? result.status)
    if (!['QUEUED', 'RUNNING'].includes(result.status)) pendingRequest = null
    await load()
  } catch (e) { if (current === sequence) error.value = e instanceof Error ? e.message : '请求失败。' }
  finally { if (current === sequence) busy.value = false }
}
watch(() => props.fundCode, () => {
  globalThis.clearTimeout(windowTimer)
  pendingRequest = null; notice.value = ''; void load()
}, { immediate: true })
/** 先只读检查最新窗口；展示与生成共用窗口目标日，失败不回退到其他日期的结果。 */
async function refresh(generateMissing = false) {
  notice.value = ''
  const run = sequence + 1
  await load()
  // 读取失败、切换基金或被新的读取取代时，不用旧窗口继续发送生成请求。
  if (run === sequence && !error.value && generateMissing && canGenerate.value) await generate()
}
// 没有本期结果时同时清空依据与记录编号，防止下方说明继续请求、展示旧预测正文。
const evidence = computed(() => forecast.value ? dailyPredictionEvidence(forecast.value, restoredEvidence.value)
  : { summary: '本期暂无预测，暂时没有对应依据。', facts: [], supporting: [], opposing: [], limitations: [] })
const evidenceStatus = computed(() => error.value ? '一天预测暂时无法读取，请更新后重试。' : notice.value || (!forecast.value ? emptyReason.value : ''))
defineExpose({ refresh, busy, evidence, evidenceStatus, forecast, forecastId, generateHint })
onBeforeUnmount(() => { sequence++; globalThis.clearTimeout(windowTimer) })
</script>

<template>
  <button
    type="button"
    class="forecast-card"
    :class="{ 'is-selected': selected }"
    :aria-pressed="selected"
    :aria-busy="busy"
    aria-controls="prediction-evidence"
    aria-label="查看一天的预测依据"
    @click="emit('select')"
  >
    <span class="forecast-card-title">一天预测</span>
    <span class="forecast-duration">看一天的涨跌</span>
    <strong
      class="forecast-direction"
      :class="`tone-${summary?.tone ?? 'neutral'}`"
    >
      {{ busy && !value ? '正在读取…' : error && !forecast ? '暂不可用' : summary && !['暂无预测', '方向不明确', '暂不判断'].includes(summary.direction)
        ? `预计${summary.direction}` : summary?.direction ?? '暂无预测' }}
    </strong>
    <span class="forecast-period">{{ targetDate ?? '日期待确认' }}</span>
    <span
      v-if="forecast"
      class="forecast-data-date"
    >已取得净值截至 {{ forecast.schemaVersion === 'DIRECTION_1D_ANALYSIS_V1' ? forecast.latestNavDate ?? '暂缺' : forecast.baseNavDate }}</span>
    <span class="forecast-card-action">{{ selected ? '正在查看依据' : '点击查看依据' }}</span>
  </button>
</template>
