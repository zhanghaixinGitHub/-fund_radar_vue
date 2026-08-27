<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import {
  getLatestFocusedNavIncrementalSync,
  getSyncJob,
  startFocusedNavIncrementalSync,
} from '@/api/syncJobs'
import type { SyncJobStatus } from '@/types/syncJob'

/** 数据同步中心：集中展示可运行的同步任务及其服务端进度。 */
const job = ref<SyncJobStatus | null>(null)
const loading = ref(true)
const starting = ref(false)
const errorMessage = ref('')
const actionMessage = ref('')
let pollingTimer: ReturnType<typeof globalThis.setTimeout> | undefined

const isActive = computed(() => job.value?.status === 'QUEUED' || job.value?.status === 'RUNNING')
const isSucceeded = computed(() => job.value?.status === 'SUCCEEDED')
const progressPercent = computed(() => {
  if (!job.value || job.value.progressTotal <= 0) {
    return 0
  }
  if (job.value.status === 'SUCCEEDED') {
    return 100
  }
  return Math.min(100, Math.round((job.value.progressCurrent / job.value.progressTotal) * 100))
})

/** 将服务端任务状态映射为清晰的中文业务含义。 */
function statusLabel(status: SyncJobStatus['status'] | undefined): string {
  return {
    QUEUED: '等待执行',
    RUNNING: '正在同步',
    SUCCEEDED: '同步完成',
    FAILED: '同步未完成',
  }[status ?? 'QUEUED']
}

/** 格式化服务端时间；无值时不伪造成已开始或已结束。 */
function formatTime(value: string | null): string {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(date)
}

/** 清除已有轮询计时器，避免重复轮询或页面离开后继续请求。 */
function stopPolling(): void {
  if (pollingTimer !== undefined) {
    globalThis.clearTimeout(pollingTimer)
    pollingTimer = undefined
  }
}

/** 在任务仍运行时按固定间隔读取服务端进度。 */
function schedulePolling(): void {
  stopPolling()
  if (!isActive.value || !job.value) {
    return
  }
  pollingTimer = globalThis.setTimeout(async () => {
    try {
      job.value = await getSyncJob(job.value!.jobId)
      errorMessage.value = ''
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '同步进度暂时不可用。'
      job.value = null
    } finally {
      schedulePolling()
    }
  }, 1_500)
}

/** 页面首次进入时读取最近任务，使刷新浏览器后仍可继续观察进行中的同步。 */
async function loadLatestJob(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  try {
    job.value = await getLatestFocusedNavIncrementalSync()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '同步中心暂时不可用。'
  } finally {
    loading.value = false
    schedulePolling()
  }
}

/** 创建重点基金净值同步任务；按钮只负责提交一次，实际进度由轮询结果展示。 */
async function startSync(): Promise<void> {
  starting.value = true
  errorMessage.value = ''
  actionMessage.value = ''
  try {
    job.value = await startFocusedNavIncrementalSync()
    actionMessage.value = '同步任务已创建，正在读取服务端进度。'
    schedulePolling()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '同步任务未创建，请稍后重试。'
  } finally {
    starting.value = false
  }
}

onMounted(() => {
  void loadLatestJob()
})

onBeforeUnmount(() => {
  stopPolling()
})
</script>

<template>
  <section
    class="market-page sync-center-page"
    aria-labelledby="sync-center-title"
  >
    <p class="eyebrow">
      数据运维
    </p>
    <h1 id="sync-center-title">
      数据同步中心
    </h1>
    <p class="lead">
      集中发起和跟踪本机数据同步任务；同步只补齐已披露的基金净值，不涉及买卖或交易。
    </p>

    <p
      v-if="loading"
      class="state-message"
    >
      正在读取最近同步任务…
    </p>
    <p
      v-else-if="errorMessage"
      class="state-message error-message"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <section
      class="sync-task-card"
      aria-labelledby="focused-nav-sync-title"
    >
      <div class="sync-task-heading">
        <div>
          <p class="eyebrow">
            可用任务
          </p>
          <h2 id="focused-nav-sync-title">
            重点基金净值增量同步
          </h2>
          <p>
            补齐六只已配置重点基金截至今日的缺失净值；已是最新或非交易日时会安全地以零变更结束。
          </p>
        </div>
        <span
          class="sync-status"
          :class="job ? `is-${job.status.toLowerCase()}` : 'is-idle'"
        >
          {{ job ? statusLabel(job.status) : '尚未运行' }}
        </span>
      </div>

      <div
        v-if="job"
        class="sync-progress-section"
      >
        <div class="sync-progress-meta">
          <strong>{{ job.progressMessage }}</strong>
          <span>{{ job.progressCurrent }} / {{ job.progressTotal }} 步</span>
        </div>
        <div
          class="sync-progress-track"
          role="progressbar"
          aria-label="重点基金净值同步进度"
          :aria-valuemax="job.progressTotal"
          :aria-valuemin="0"
          :aria-valuenow="job.progressCurrent"
          :aria-valuetext="`${progressPercent}%：${job.progressMessage}`"
        >
          <span :style="{ width: `${progressPercent}%` }" />
        </div>
        <p class="sync-progress-note">
          当前基金：{{ job.currentFundCode || '正在准备或写入数据' }} · 目标日期：{{ job.requestedNavDate }}
        </p>
      </div>

      <dl
        v-if="job"
        class="sync-summary-grid"
      >
        <div><dt>开始时间</dt><dd>{{ formatTime(job.startedAt) }}</dd></div>
        <div><dt>结束时间</dt><dd>{{ formatTime(job.finishedAt) }}</dd></div>
        <div><dt>读取条数</dt><dd>{{ job.fetchedCount }}</dd></div>
        <div><dt>新增 / 更新 / 跳过</dt><dd>{{ job.createdCount }} / {{ job.updatedCount }} / {{ job.skippedCount }}</dd></div>
      </dl>

      <p
        v-if="job?.status === 'FAILED'"
        class="state-message error-message sync-job-message"
        role="alert"
      >
        {{ job.errorMessage || '同步未完成，请稍后重试。' }}
      </p>
      <p
        v-else-if="isSucceeded"
        class="state-message sync-job-message"
        aria-live="polite"
      >
        同步完成：读取 {{ job.fetchedCount }} 条，新增 {{ job.createdCount }} 条，更新 {{ job.updatedCount }} 条，跳过 {{ job.skippedCount }} 条。
      </p>
      <p
        v-else-if="actionMessage"
        class="state-message sync-job-message"
        aria-live="polite"
      >
        {{ actionMessage }}
      </p>

      <div class="sync-task-actions">
        <button
          class="secondary-button"
          :aria-busy="starting || isActive"
          :disabled="starting || isActive"
          type="button"
          @click="startSync"
        >
          {{ starting ? '正在创建任务…' : isActive ? '同步任务进行中…' : '开始同步' }}
        </button>
        <RouterLink
          class="inline-link"
          to="/funds"
        >
          查看重点基金
        </RouterLink>
      </div>
    </section>

    <section
      class="sync-center-notes"
      aria-labelledby="sync-center-notes-title"
    >
      <h2 id="sync-center-notes-title">
        运行说明
      </h2>
      <ul>
        <li>每天工作日 20:00 的定时增量同步仍然保留；这里用于本机未运行时的手动补齐。</li>
        <li>同一时间只允许一个重点基金净值同步任务，避免重复访问数据源和重复写入。</li>
        <li>任务进度保存在当前 Python 服务进程；若服务重启，重新进入本页后可重新发起同步。</li>
      </ul>
    </section>
  </section>
</template>
