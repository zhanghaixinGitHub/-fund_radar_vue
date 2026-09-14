<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { generateDirection1d, getDirection1dCurrent } from '@/api/direction1d'
import type { Direction1dCurrent } from '@/types/direction1d'
import { assertDirection1dFundHistory, direction1dReason, direction1dSummary } from '@/utils/direction1d'

const props = defineProps<{ fundCode: string }>()
const value = ref<Direction1dCurrent | null>(null)
const busy = ref(false)
const error = ref('')
const notice = ref('')
let sequence = 0

// 当前接口返回本基金最近一条记录。日期和依据都取自该记录，不能把旧结论套到本期日期。
const latest = computed(() => value.value?.history.items[0])
const forecast = computed(() => latest.value && !latest.value.status ? latest.value.forecast : null)
const summary = computed(() => forecast.value ? direction1dSummary(forecast.value) : null)
const isPrevious = computed(() => forecast.value && forecast.value.targetNavDate !== value.value?.window.targetNavDate)
const canGenerate = computed(() => value.value?.enabled && value.value.window.status === 'OPEN'
  && (!forecast.value || isPrevious.value))

/** 没有预测时只说明阻止当前判断的原因，不向用户罗列内部检查状态。 */
const emptyReason = computed(() => {
  if (latest.value?.status) return '这次预测记录暂不可用，请稍后重试。'
  const current = value.value
  if (!current) return ''
  if (current.coverage.status !== 'READY_EXPERIMENTAL') return direction1dReason(current.coverage.status)
  if (!current.enabled) return '尚未开启预测。'
  return current.window.status === 'OPEN' ? '本期预测尚未生成。' : '本期暂无预测，等待下一期更新。'
})

/** 切换基金时清空旧内容，并只接纳当前基金最后一次读取的结果。 */
async function load() {
  const current = ++sequence
  const fundCode = props.fundCode
  busy.value = true
  error.value = ''
  value.value = null
  try {
    const result = await getDirection1dCurrent(fundCode)
    assertDirection1dFundHistory(fundCode, result.history.items)
    if (current === sequence) value.value = result
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
onBeforeUnmount(() => { sequence++ })
</script>

<template>
  <section
    class="direction-1d-panel"
    :aria-busy="busy"
    aria-label="下一交易日涨跌预测"
  >
    <header class="prediction-heading">
      <h2>下一交易日涨跌预测</h2>
      <span class="experiment-badge">实验 · 未正式发布</span>
    </header>
    <p
      v-if="error"
      class="prediction-error"
      role="alert"
    >
      {{ error }}
      <button
        type="button"
        :disabled="busy"
        @click="load"
      >
        重新加载
      </button>
    </p>
    <p
      v-if="notice"
      class="prediction-notice"
      role="status"
    >
      {{ notice }}
    </p>
    <p
      v-if="busy && !value"
      class="prediction-notice"
      role="status"
    >
      正在读取预测…
    </p>
    <template v-if="value">
      <!-- 只呈现日期、方向和依据；历史核对结果由左侧“预测历史”入口承接。 -->
      <dl class="prediction-summary">
        <div class="prediction-date">
          <dt>预测日期</dt>
          <dd>
            {{ forecast?.targetNavDate ?? value.window.targetNavDate }}
            <span
              v-if="isPrevious"
              class="previous-label"
            >最近一次预测</span>
          </dd>
        </div>
        <div class="prediction-direction">
          <dt>预计走势</dt>
          <dd :class="`direction-${summary?.tone ?? 'neutral'}`">
            {{ summary?.direction ?? '暂无预测' }}
          </dd>
        </div>
        <div class="prediction-evidence">
          <dt>判断依据</dt>
          <dd>
            <p>{{ summary?.evidence ?? emptyReason }}</p>
            <p
              v-if="summary?.history"
              class="evidence-data"
            >
              {{ summary.history }}
            </p>
          </dd>
        </div>
      </dl>
      <button
        v-if="canGenerate"
        class="generate-button"
        type="button"
        :disabled="busy"
        @click="generate"
      >
        {{ busy ? '正在生成…' : '生成本期预测' }}
      </button>
    </template>
  </section>
</template>

<style scoped>
.direction-1d-panel {
  margin: 20px 0 0;
  padding: 24px;
  color: #203a34;
  background: var(--workspace-surface, #fff);
  border: 1px solid var(--workspace-border, #dfe8e3);
  border-radius: 10px;
}
.prediction-heading { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; justify-content: space-between; }
.prediction-heading h2 { margin: 0; font-size: 18px; line-height: 1.5; }
.experiment-badge { padding: 3px 8px; color: #805a19; background: #fff5df; border-radius: 5px; font-size: 12px; }
.prediction-summary { display: grid; grid-template-columns: minmax(0, 240px) minmax(0, 1fr); gap: 24px 40px; margin: 24px 0 0; }
.prediction-summary dt { margin-bottom: 7px; color: #536c63; font-size: 13px; }
.prediction-summary dd { margin: 0; }
.prediction-date dd, .prediction-direction dd { font-size: 24px; font-weight: 700; line-height: 1.4; }
.prediction-date dd { font-variant-numeric: tabular-nums; }
.previous-label { display: block; margin-top: 6px; color: #647b72; font-size: 12px; font-weight: 400; }
.direction-up { color: #b43d3d; }
.direction-non-up { color: #0f766e; }
.direction-neutral { color: #647b72; }
.prediction-evidence { grid-column: 1 / -1; }
.prediction-evidence p { margin: 0; font-size: 14px; line-height: 1.8; overflow-wrap: anywhere; }
.prediction-evidence .evidence-data { margin-top: 5px; color: #536c63; font-size: 13px; }
.prediction-notice { margin: 18px 0 0; color: #536c63; }
.prediction-error { margin: 18px 0 0; color: #a23c3c; overflow-wrap: anywhere; }
button { min-height: 40px; padding: 8px 14px; color: #0f766e; background: #fff; border: 1px solid #c9d8d0; border-radius: 6px; font: inherit; cursor: pointer; }
button:hover:not(:disabled) { background: #eef7f3; }
button:focus-visible { outline: 2px solid #0f766e; outline-offset: 3px; }
button:disabled { opacity: .6; cursor: wait; }
.prediction-error button { margin-left: 12px; }
.generate-button { margin-top: 20px; }
@media (max-width: 600px) {
  .direction-1d-panel { padding: 18px; }
  .prediction-summary { grid-template-columns: minmax(0, 1fr); gap: 20px; margin-top: 20px; }
  .prediction-date dd, .prediction-direction dd { font-size: 22px; }
}
</style>
