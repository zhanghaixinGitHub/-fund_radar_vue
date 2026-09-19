<script setup lang="ts">
import { computed, ref } from 'vue'
import { runSimRecurringDue } from '@/api/simulation'
import { useAuthStore } from '@/stores/auth'
import type { SimRecurringRunResult } from '@/types/simulation'

const auth = useAuthStore()
const running = ref(false)
const result = ref<SimRecurringRunResult | null>(null)
const error = ref('')
const canRun = computed(() => auth.hasPermission('SYNC_JOB_START') && !running.value)

const formatTime = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '时间暂不可用'
    : new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'medium' }).format(date)
}

/** 只发起一次手动执行；响应丢失时不自动重发，避免重复生成买单。 */
async function run(): Promise<void> {
  if (!canRun.value) return
  running.value = true
  error.value = ''
  try {
    result.value = await runSimRecurringDue()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '定投手动执行失败，请稍后重试。'
  } finally {
    running.value = false
  }
}
</script>

<template>
  <section
    class="sync-task-card"
    aria-labelledby="sim-recurring-run-title"
    :aria-busy="running"
  >
    <div class="sync-task-heading">
      <div>
        <p class="eyebrow">
          模拟账户 · 定时任务
        </p>
        <h2 id="sim-recurring-run-title">
          定投计划手动执行
        </h2>
        <p>定投默认每个交易日上午 10:00 由后台自动执行；这里可以为所有进行中的定投计划按前一交易日净值立即补入一期，用于补齐比实际缺少的持仓。</p>
      </div>
      <span
        class="sync-status"
        :class="result ? 'is-succeeded' : 'is-idle'"
      >
        {{ running ? '正在执行' : result ? '执行完成' : '尚未手动执行' }}
      </span>
    </div>
    <p class="sync-progress-note">
      每个进行中计划补入一期并立即按前一交易日净值确认，不改变后续自动执行日期；同一天重复点击不会重复补入。与“一键同步全部”互不影响，执行期间请勿重复点击。
    </p>
    <div class="sync-task-actions">
      <button
        v-if="auth.hasPermission('SYNC_JOB_START')"
        class="secondary-button"
        type="button"
        :disabled="!canRun"
        :aria-busy="running"
        @click="run"
      >
        {{ running ? '正在补入定投…' : '立即补入一期定投' }}
      </button>
    </div>
    <p
      v-if="error"
      class="state-message error-message"
      role="alert"
    >
      {{ error }}
    </p>
    <div
      v-if="result && !running"
      class="sim-recurring-result"
      aria-live="polite"
      aria-atomic="true"
    >
      <strong>本次执行完成</strong>
      <p>{{ result.message }}</p>
      <dl class="sync-summary-grid">
        <div><dt>检查计划</dt><dd>{{ result.plansChecked }} 个</dd></div>
        <div><dt>补入买单</dt><dd>{{ result.ordersCreated }} 笔</dd></div>
        <div><dt>跳过计划</dt><dd>{{ result.plansSkipped }} 个</dd></div>
        <div><dt>执行时间</dt><dd>{{ formatTime(result.ranAt) }}</dd></div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.sim-recurring-result { margin-top: 18px; padding: 18px; border: 1px solid #c6d9d5; border-left: 4px solid #087f75; border-radius: 10px; background: #f4f8f7; }
.sim-recurring-result strong { font-size: 17px; }
.sim-recurring-result p { margin: 8px 0 0; }
</style>
