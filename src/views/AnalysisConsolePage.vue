<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

import { getAnalysisRun, startRollingBacktest } from '@/api/analysis'
import { ApiRequestError } from '@/api/http'
import type { AnalysisRunStatus } from '@/types/analysis'

const feeRate = ref(0.0015)
const run = ref<AnalysisRunStatus | null>(null)
const submitting = ref(false)
const refreshing = ref(false)
const message = ref('')
const pollAttempts = ref(0)
let pollTimer: number | null = null
const canPoll = computed(() => run.value?.status === 'QUEUED' || run.value?.status === 'RUNNING')

/** 将持久运行状态映射为后台可读文案，不把状态猜测为回测结论。 */
function runStatusLabel(status: AnalysisRunStatus['status']): string {
  const labels: Record<AnalysisRunStatus['status'], string> = {
    QUEUED: '已排队',
    RUNNING: '运行中',
    COMPLETED: '已完成',
    FAILED: '运行失败',
  }
  return labels[status]
}

/** 格式化服务端时间；缺失时间表示该阶段尚未发生。 */
function formatDateTime(value: string | null): string {
  if (!value) {
    return '尚未发生'
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString('zh-CN', { hour12: false })
}

/** 将 409、403、503 等服务端状态转换为管理员可执行的提示，不泄露下游细节。 */
function displayRequestError(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError && error.status === 409) {
    return '已有回测正在排队或运行，请等待其结束后再创建新的运行。'
  }
  if (error instanceof ApiRequestError && error.status === 403) {
    return '当前账户不是系统管理员，不能创建或查询分析运行。'
  }
  if (error instanceof ApiRequestError && error.status === 503) {
    return '分析服务暂时不可用；本页没有自动重试，请稍后手动刷新。'
  }
  return error instanceof Error ? error.message : fallback
}

/** 清理单个轮询定时器，避免离开页面后继续请求后台运行状态。 */
function clearPolling(): void {
  if (pollTimer !== null) {
    globalThis.clearTimeout(pollTimer)
    pollTimer = null
  }
}

/** 在有限次数内轮询已创建运行；轮询只读取持久状态，绝不重复创建任务。 */
function schedulePolling(): void {
  clearPolling()
  if (!canPoll.value || pollAttempts.value >= 40) {
    if (pollAttempts.value >= 40 && canPoll.value) {
      message.value = '运行仍在进行中，已停止自动刷新；请稍后使用“刷新状态”查看。'
    }
    return
  }
  pollTimer = globalThis.setTimeout(() => {
    void refreshRun(true)
  }, 3_000)
}

/** 读取当前运行的服务端持久状态；失败不会改变已有运行记录的展示。 */
async function refreshRun(isPolling = false): Promise<void> {
  if (!run.value || refreshing.value) {
    return
  }
  refreshing.value = true
  if (!isPolling) {
    message.value = ''
  }
  try {
    run.value = await getAnalysisRun(run.value.analysisRunId)
    if (isPolling) {
      pollAttempts.value += 1
    }
    schedulePolling()
  } catch (error) {
    message.value = displayRequestError(error, '运行状态暂时无法读取。')
  } finally {
    refreshing.value = false
  }
}

/** 仅排队一条固定股票基线滚动回测；不会同步数据、评分或自动激活模型。 */
async function startRun(): Promise<void> {
  if (!Number.isFinite(feeRate.value) || feeRate.value < 0 || feeRate.value >= 1) {
    message.value = '回测摩擦成本必须在 0（含）到 1（不含）之间。'
    return
  }
  submitting.value = true
  message.value = ''
  clearPolling()
  try {
    run.value = await startRollingBacktest(feeRate.value)
    pollAttempts.value = 0
    message.value = '回测任务已排队。页面只显示真实持久状态，不会自动发布模型。'
    schedulePolling()
  } catch (error) {
    message.value = displayRequestError(error, '回测任务未创建。')
  } finally {
    submitting.value = false
  }
}

onBeforeUnmount(() => {
  clearPolling()
})
</script>

<template>
  <section
    class="admin-page analysis-console-page"
    aria-labelledby="analysis-console-title"
  >
    <p class="eyebrow">
      ANALYSIS GOVERNANCE
    </p>
    <h1 id="analysis-console-title">
      分析运行
    </h1>
    <p class="lead">
      仅系统管理员可创建固定股票基线的滚动回测。该操作只排队后台任务，不发起来源同步、不自动评分、不激活模型，也不发送提醒。
    </p>

    <section class="admin-operation-card">
      <div>
        <h2>创建受控回测</h2>
        <p>默认摩擦成本为 0.15%。缺少已授权业绩比较基准时，运行会保留不可发布结论，不能绕过发布闸门。</p>
      </div>
      <form
        class="admin-inline-form"
        @submit.prevent="startRun"
      >
        <label>
          回测摩擦成本（0–1）
          <input
            v-model.number="feeRate"
            max="0.999999"
            min="0"
            step="0.0001"
            type="number"
          >
        </label>
        <button
          class="primary-button"
          :disabled="submitting || canPoll"
          type="submit"
        >
          {{ submitting ? '正在排队…' : canPoll ? '已有运行进行中' : '创建滚动回测' }}
        </button>
      </form>
    </section>

    <p
      v-if="message"
      class="state-message"
      aria-live="polite"
    >
      {{ message }}
    </p>

    <section
      v-if="run"
      class="admin-table-card analysis-run-card"
      aria-labelledby="analysis-run-title"
    >
      <header class="admin-table-header">
        <div>
          <p class="eyebrow">
            PERSISTED RUN
          </p>
          <h2 id="analysis-run-title">
            当前运行状态
          </h2>
        </div>
        <button
          class="secondary-button"
          :disabled="refreshing"
          type="button"
          @click="refreshRun()"
        >
          {{ refreshing ? '刷新中…' : '刷新状态' }}
        </button>
      </header>
      <dl class="analysis-run-grid">
        <div><dt>状态</dt><dd>{{ runStatusLabel(run.status) }}</dd></div>
        <div><dt>基金类型</dt><dd>{{ run.fundType }}</dd></div>
        <div><dt>创建时间</dt><dd>{{ formatDateTime(run.requestedAt) }}</dd></div>
        <div><dt>开始时间</dt><dd>{{ formatDateTime(run.startedAt) }}</dd></div>
        <div><dt>结束时间</dt><dd>{{ formatDateTime(run.finishedAt) }}</dd></div>
        <div><dt>回测准入</dt><dd>{{ run.modelReleaseStatus || '等待运行结论' }}</dd></div>
      </dl>
      <p
        v-if="run.failureReason"
        class="notice-banner"
      >
        运行摘要：{{ run.failureReason }}
      </p>
      <p class="risk-disclaimer">
        回测是模型发布闸门，不是模拟下单或个人收益账本。即使运行完成，也必须经过合格判定与人工审核后才可能进入发布状态。
      </p>
    </section>
  </section>
</template>
