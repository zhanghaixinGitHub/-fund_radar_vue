<script setup lang="ts">
import { ref } from 'vue'
import { readAutoCycles, readAutoCycleDetail, controlAutoCycle } from '@/api/automaticPrediction'
import type { AutoCycle } from '@/api/automaticPrediction'
import ModelRoutesPanel from '@/components/ModelRoutesPanel.vue'
import PredictionResearchPanel from '@/components/PredictionResearchPanel.vue'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore(), opened = ref(false), error = ref(''), busy = ref(false), cycles = ref<AutoCycle[]>([])
const details = ref<Record<string, string>>({})
async function detail(id: string) {
  error.value = ''
  try { details.value[id] = JSON.stringify(await readAutoCycleDetail(id), null, 2) }
  catch (e) { error.value = e instanceof Error ? e.message : '周期证据读取失败' }
}
async function control(id: string, action: 'cancel' | 'resume') {
  busy.value = true; error.value = ''
  try { await controlAutoCycle(id, action); await load() }
  catch (e) { error.value = e instanceof Error ? e.message : '周期操作未完成' }
  finally { busy.value = false }
}
async function load(more = false) {
  busy.value = true; error.value = ''
  try { const value = await readAutoCycles(more ? cycles.value.at(-1)?.createdAt : undefined, more ? cycles.value.at(-1)?.cycleId : undefined); cycles.value = more ? [...cycles.value, ...value.items.filter(row => !cycles.value.some(old => old.cycleId === row.cycleId))] : value.items }
  catch (e) { error.value = e instanceof Error ? e.message : '技术记录读取失败' }
  finally { busy.value = false }
}
function toggle(event: globalThis.Event) { opened.value = (event.target as globalThis.HTMLDetailsElement).open; if (opened.value) void load() }
</script>
<template>
  <details
    v-if="auth.hasPermission('RESEARCH_RUN_ADMIN')"
    class="technical-details"
    @toggle="toggle"
  >
    <summary>自动预测技术排查（管理员）</summary>
    <template v-if="opened">
      <p>查看采用、保持、故障与恢复证据；这些操作不是获取日常预测的前置条件。</p>
      <button
        class="secondary-button"
        :disabled="busy"
        @click="load()"
      >
        刷新技术状态
      </button>
      <p
        v-if="error"
        class="error-message"
        role="alert"
      >
        {{ error }}
      </p>
      <p v-if="!cycles.length && !busy && !error">
        尚无自动周期。
      </p>
      <article
        v-for="cycle in cycles"
        :key="cycle.cycleId"
      >
        <strong>{{ cycle.status }} · {{ cycle.decision ?? '尚未决策' }}</strong>
        <p>周期 {{ cycle.cycleId }}</p>
        <button
          class="secondary-button"
          :disabled="busy"
          @click="detail(cycle.cycleId)"
        >
          读取采用与比较证据
        </button>
        <button
          v-if="['QUEUED', 'TRAINING', 'EVALUATING', 'REPLAYING', 'INTERRUPTED'].includes(cycle.status)"
          class="secondary-button"
          :disabled="busy"
          @click="control(cycle.cycleId, 'cancel')"
        >
          取消本轮
        </button>
        <button
          v-if="['CANCELLED', 'FAILED', 'INTERRUPTED'].includes(cycle.status)"
          class="secondary-button"
          :disabled="busy"
          @click="control(cycle.cycleId, 'resume')"
        >
          沿原检查点恢复
        </button>
        <details v-if="details[cycle.cycleId]">
          <summary>冻结范围、发布身份与决策原文</summary><pre>{{ details[cycle.cycleId] }}</pre>
        </details>
        <p>{{ cycle.fundCount }} 只基金 · {{ cycle.trigger }} · {{ new Date(cycle.updatedAt).toLocaleString('zh-CN') }}</p>
        <p v-if="cycle.error">
          {{ cycle.error.summary }}（{{ cycle.error.code }}）
        </p>
        <small>周期 {{ cycle.cycleId }} · 重试 {{ cycle.retries }} 次</small>
      </article>
      <button
        v-if="cycles.length >= 20"
        class="secondary-button"
        :disabled="busy"
        @click="load(true)"
      >
        读取更早周期
      </button>
      <details><summary>版本与研究证据</summary><ModelRoutesPanel v-if="auth.hasPermission('MODEL_EXPERIMENT_ADMIN')" /><PredictionResearchPanel /></details>
    </template>
  </details>
</template>
<style scoped>
.technical-details { margin-top: 24px; padding: 20px; border: 1px solid #dce5df; border-radius: 12px; overflow-wrap: anywhere; }.technical-details summary { cursor: pointer; min-height: 40px; }.technical-details article { padding: 12px 0; border-bottom: 1px solid #dce5df; }.technical-details button { min-height: 44px; }.technical-details pre { white-space: pre-wrap; overflow-wrap: anywhere; max-height: 480px; overflow: auto; }
</style>
