<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { generateDirection1d, getDirection1dCurrent } from '@/api/direction1d'
import type { Direction1dCurrent } from '@/types/direction1d'
import { assertDirection1dForecast, direction1dDirection, direction1dReason, direction1dTime } from '@/utils/direction1d'

const props = defineProps<{ fundCode: string }>()
const value = ref<Direction1dCurrent | null>(null)
const busy = ref(false)
const error = ref('')
const notice = ref('')
let sequence = 0
async function load() {
  const current = ++sequence
  busy.value = true
  error.value = ''
  value.value = null
  try {
    const result = await getDirection1dCurrent(props.fundCode)
    result.history.items.forEach(r => { if (!r.status) assertDirection1dForecast(r.forecast) })
    if (current === sequence) value.value = result
  } catch (e) { if (current === sequence) error.value = e instanceof Error ? e.message : '读取失败。' }
  finally { if (current === sequence) busy.value = false }
}
async function generate() {
  busy.value = true
  try {
    const result = await generateDirection1d(props.fundCode)
    notice.value = direction1dReason(result.reason ?? result.status)
    await load()
  } catch (e) { error.value = e instanceof Error ? e.message : '请求失败。' }
  finally { busy.value = false }
}
watch(() => props.fundCode, () => { notice.value = ''; void load() }, { immediate: true })
onBeforeUnmount(() => { sequence++ })
</script>

<template>
  <section
    class="direction-1d-panel"
    :aria-busy="busy"
    aria-label="下一交易日预测实验"
  >
    <span class="badge">实验 · 未正式发布</span>
    <h2>下一交易日涨跌预测</h2>
    <p>按官方单位净值核对上涨或非上涨；模型分数尚未校准，不代表收益。</p>
    <p
      v-if="error"
      role="alert"
    >
      {{ error }}
    </p>
    <p
      v-if="notice"
      role="status"
    >
      {{ notice }}
    </p>
    <template v-if="value">
      <p>本期目标 <strong>{{ value.window.targetNavDate }}</strong> · 基准净值 {{ value.window.baseNavDate }}</p>
      <p>
        {{ direction1dReason(value.coverage.status) }}<span
          v-for="reason in value.coverage.reasonCodes.filter(r => r !== value.coverage.status)"
          :key="reason"
        > · {{ direction1dReason(reason) }}</span>
      </p>
      <p>真实留档截止：{{ direction1dTime(value.window.deadlineAt) }}</p>
      <p v-if="!value.history.items.length">
        本人尚无有效留档。{{ value.window.status === 'OPEN' ? '本期可尝试生成，需输入和模型合格。' : `下一期开始：${direction1dTime(value.window.nextWindowOpenAt)}。` }}
      </p>
      <article
        v-for="record in value.history.items"
        :key="record.forecastId"
      >
        <p
          v-if="record.status"
          role="alert"
        >
          {{ direction1dReason(record.status) }}，已停止展示该记录。
        </p>
        <template v-else>
          <h3>最近留档 · 目标 {{ record.forecast.targetNavDate }}</h3>
          <p>提交后确认：{{ direction1dTime(record.receiptVerifiedAt) }}</p>
          <p
            v-for="branch in record.forecast.branches"
            :key="branch.branchId"
          >
            {{ branch.branchId }}：{{ direction1dDirection(branch.predictedDirection) }}
          </p>
          <p>{{ record.outcomes.length ? `真实结果：${direction1dDirection(record.outcomes[0]?.actualDirection)}` : '待到期或等待官方净值；尚未计对错。' }}</p>
          <details><summary>原始模型依据</summary><pre>{{ record.forecast.branches }}</pre></details>
        </template>
      </article>
      <button
        type="button"
        :disabled="busy || !value.enabled || value.window.status !== 'OPEN'"
        @click="generate"
      >
        请求本期预测 / 重试
      </button>
    </template>
    <RouterLink :to="{ name: 'direction-1d' }">
      全部关注覆盖、启停与真实历史 →
    </RouterLink>
  </section>
</template>

<style scoped>
.direction-1d-panel { padding: 24px; margin: 24px 0; background: #f5f8fc; border: 1px solid #d8e2ef; border-radius: 16px; }
.badge { color: #805a19; font-size: 12px; background: #fff0c9; border-radius: 5px; padding: 4px 8px; }
h2 { margin: 14px 0; } p { color: #46576c; line-height: 1.7; } a { display: inline-block; margin: 12px; }
button { padding: 10px 14px; border: 1px solid #b5c5d8; border-radius: 8px; background: white; cursor: pointer; }
button:disabled { opacity: .5; cursor: default; } pre { white-space: pre-wrap; overflow-wrap: anywhere; }
</style>
