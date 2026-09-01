<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import {
  getLastSuccessfulSyncTimes,
  getLatestMarketDetailSync,
  getLatestMarketNavIncrementalSync,
  getLatestStockFeatureSnapshotSync,
  getSyncJob,
  startMarketDetailSync,
  startMarketNavIncrementalSync,
  startStockFeatureSnapshotSync,
} from '@/api/syncJobs'
import type { SyncJobStatus } from '@/types/syncJob'

type SyncTaskKey = 'marketNav' | 'marketDetail' | 'featureSnapshot'

interface SyncTaskDefinition {
  key: SyncTaskKey
  jobType: 'MARKET_NAV_INCREMENTAL' | 'MARKET_DETAIL' | 'STOCK_FEATURE_SNAPSHOT'
  title: string
  description: string
  scheduleNote: string
  actionLabel: string
  start: () => Promise<SyncJobStatus>
  loadLatest: () => Promise<SyncJobStatus | null>
}

/** 同步中心任务注册表；每项计划任务都在这里声明可手动触发的入口。 */
const tasks: readonly SyncTaskDefinition[] = [
  {
    key: 'marketNav',
    jobType: 'MARKET_NAV_INCREMENTAL',
    title: '基金市场净值增量同步',
    description: '补齐基金市场中所有启用基金截至今日的缺失净值；已是最新或非交易日时会安全地以零变更结束。',
    scheduleNote: '定时：工作日 20:00；也可在这里手动补齐。',
    actionLabel: '开始同步',
    start: startMarketNavIncrementalSync,
    loadLatest: getLatestMarketNavIncrementalSync,
  },
  {
    key: 'marketDetail',
    jobType: 'MARKET_DETAIL',
    title: '基金市场完整资料同步',
    description: '同步基础资料、扩展净值、基金经理、规模和分红记录；仅查询已登记的基金市场，不读取个人关注关系。',
    scheduleNote: '按需手动执行；完整资料会调用多个 Tushare 接口，因此暂不自动定时运行。',
    actionLabel: '开始同步',
    start: startMarketDetailSync,
    loadLatest: getLatestMarketDetailSync,
  },
  {
    key: 'featureSnapshot',
    jobType: 'STOCK_FEATURE_SNAPSHOT',
    title: '股票型基金特征快照同步',
    description: '从已落库且已授权的股票型基金净值生成可重现的历史统计特征；不拉取外部数据，不生成预测、回测或提醒。',
    scheduleNote: '市场净值增量同步成功后自动执行；若特征阶段未完成，可在此手动重试。',
    actionLabel: '同步特征快照',
    start: startStockFeatureSnapshotSync,
    loadLatest: getLatestStockFeatureSnapshotSync,
  },
]

const jobs = ref<Record<SyncTaskKey, SyncJobStatus | null>>({
  marketNav: null,
  marketDetail: null,
  featureSnapshot: null,
})
const starting = ref<Record<SyncTaskKey, boolean>>({
  marketNav: false,
  marketDetail: false,
  featureSnapshot: false,
})
const lastSuccessfulAt = ref<Record<string, string | null>>({
  MARKET_NAV_INCREMENTAL: null,
  MARKET_DETAIL: null,
  STOCK_FEATURE_SNAPSHOT: null,
})
const loading = ref(true)
const errorMessage = ref('')
const actionMessage = ref('')
let pollingTimer: ReturnType<typeof globalThis.setTimeout> | undefined

/** 每项任务独立计算是否运行中，按钮与进度条不会互相串台。 */
function isActive(task: SyncTaskDefinition): boolean {
  const status = jobs.value[task.key]?.status
  return status === 'QUEUED' || status === 'RUNNING'
}

function isSucceeded(task: SyncTaskDefinition): boolean {
  return jobs.value[task.key]?.status === 'SUCCEEDED'
}

/** 进度只能使用服务端实际完成数；未知总数时保持 0，避免伪造百分比。 */
function progressPercent(job: SyncJobStatus | null): number {
  if (!job || job.progressTotal <= 0) {
    return 0
  }
  if (job.status === 'SUCCEEDED' || job.status === 'PARTIAL_SUCCESS') {
    return 100
  }
  return Math.min(100, Math.round((job.progressCurrent / job.progressTotal) * 100))
}

/** 将服务端任务状态映射为清晰的中文业务含义。 */
function statusLabel(status: SyncJobStatus['status'] | undefined): string {
  return {
    QUEUED: '等待执行',
    RUNNING: '正在同步',
    SUCCEEDED: '同步完成',
    PARTIAL_SUCCESS: '来源已同步，特征待重试',
    FAILED: '同步未完成',
  }[status ?? 'QUEUED']
}

/** 格式化服务端时间；无值时不伪造成已开始或已结束。 */
function formatTime(value: string | null): string {
  if (!value) {
    return '尚未成功同步'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '时间暂不可用'
  }
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(date)
}

function updateLastSuccessfulTime(job: SyncJobStatus): void {
  if (job.status === 'SUCCEEDED' && job.finishedAt) {
    lastSuccessfulAt.value[job.jobType] = job.finishedAt
  }
}

/** 清除已有轮询计时器，避免重复轮询或页面离开后继续请求。 */
function stopPolling(): void {
  if (pollingTimer !== undefined) {
    globalThis.clearTimeout(pollingTimer)
    pollingTimer = undefined
  }
}

/** 每秒轮询所有正在运行的任务，实时更新后端实际进度。 */
function schedulePolling(): void {
  stopPolling()
  const activeTasks = tasks.filter((task) => isActive(task))
  if (!activeTasks.length) {
    return
  }
  pollingTimer = globalThis.setTimeout(async () => {
    try {
      const updates = await Promise.all(
        activeTasks.map(async (task) => ({ task, job: await getSyncJob(jobs.value[task.key]!.jobId) })),
      )
      for (const update of updates) {
        jobs.value[update.task.key] = update.job
        updateLastSuccessfulTime(update.job)
      }
      errorMessage.value = ''
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '同步进度暂时不可用。'
    } finally {
      schedulePolling()
    }
  }, 1_000)
}

/** 页面首次进入时读取最近任务和持久化的上次成功时间。 */
async function loadSyncCenter(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  try {
    const [latestJobs, successTimes] = await Promise.all([
      Promise.all(tasks.map((task) => task.loadLatest())),
      getLastSuccessfulSyncTimes(),
    ])
    tasks.forEach((task, index) => {
      jobs.value[task.key] = latestJobs[index]
      if (latestJobs[index]) {
        updateLastSuccessfulTime(latestJobs[index])
      }
    })
    for (const item of successTimes) {
      lastSuccessfulAt.value[item.jobType] = item.lastSuccessfulAt
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '同步中心暂时不可用。'
  } finally {
    loading.value = false
    schedulePolling()
  }
}

/** 创建指定任务；实际进度由下一秒开始的服务端轮询提供。 */
async function startSync(task: SyncTaskDefinition): Promise<void> {
  starting.value[task.key] = true
  errorMessage.value = ''
  actionMessage.value = ''
  try {
    const job = await task.start()
    jobs.value[task.key] = job
    actionMessage.value = `${task.title}任务已创建，正在读取服务端进度。`
    schedulePolling()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '同步任务未创建，请稍后重试。'
  } finally {
    starting.value[task.key] = false
  }
}

const hasActiveJob = computed(() => tasks.some((task) => isActive(task)))

onMounted(() => {
  void loadSyncCenter()
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
      集中发起和跟踪基金市场同步任务；所有进度均来自服务端实际执行状态，不涉及买卖或交易。
    </p>

    <p
      v-if="loading"
      class="state-message"
    >
      正在读取同步任务…
    </p>
    <p
      v-else-if="errorMessage"
      class="state-message error-message"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <section
      v-for="task in tasks"
      :key="task.key"
      class="sync-task-card"
      :aria-labelledby="`${task.key}-sync-title`"
    >
      <div class="sync-task-heading">
        <div>
          <p class="eyebrow">
            可用任务
          </p>
          <h2 :id="`${task.key}-sync-title`">
            {{ task.title }}
          </h2>
          <p>{{ task.description }}</p>
        </div>
        <span
          class="sync-status"
          :class="jobs[task.key] ? `is-${jobs[task.key]!.status.toLowerCase()}` : 'is-idle'"
        >
          {{ jobs[task.key] ? statusLabel(jobs[task.key]!.status) : '尚未运行' }}
        </span>
      </div>

      <p class="sync-last-success">
        {{ task.scheduleNote }} 上次成功同步：<strong>{{ formatTime(lastSuccessfulAt[task.jobType]) }}</strong>
      </p>

      <div
        v-if="jobs[task.key]"
        class="sync-progress-section"
      >
        <div class="sync-progress-meta">
          <strong>{{ jobs[task.key]!.progressMessage }}</strong>
          <span>{{ jobs[task.key]!.progressCurrent }} / {{ jobs[task.key]!.progressTotal }} 步</span>
        </div>
        <div
          class="sync-progress-track"
          role="progressbar"
          :aria-label="`${task.title}进度`"
          :aria-valuemax="jobs[task.key]!.progressTotal"
          :aria-valuemin="0"
          :aria-valuenow="jobs[task.key]!.progressCurrent"
          :aria-valuetext="`${progressPercent(jobs[task.key])}%：${jobs[task.key]!.progressMessage}`"
        >
          <span :style="{ width: `${progressPercent(jobs[task.key])}%` }" />
        </div>
        <p class="sync-progress-note">
          当前基金：{{ jobs[task.key]!.currentFundCode || '正在准备或写入数据' }} · 目标日期：{{ jobs[task.key]!.requestedNavDate }}
        </p>
      </div>

      <dl
        v-if="jobs[task.key]"
        class="sync-summary-grid"
      >
        <div><dt>开始时间</dt><dd>{{ formatTime(jobs[task.key]!.startedAt) }}</dd></div>
        <div><dt>结束时间</dt><dd>{{ formatTime(jobs[task.key]!.finishedAt) }}</dd></div>
        <div><dt>读取条数</dt><dd>{{ jobs[task.key]!.fetchedCount }}</dd></div>
        <div><dt>新增 / 更新 / 跳过</dt><dd>{{ jobs[task.key]!.createdCount }} / {{ jobs[task.key]!.updatedCount }} / {{ jobs[task.key]!.skippedCount }}</dd></div>
      </dl>

      <p
        v-if="jobs[task.key]?.status === 'FAILED' || jobs[task.key]?.status === 'PARTIAL_SUCCESS'"
        class="state-message sync-job-message"
        :class="jobs[task.key]?.status === 'FAILED' ? 'error-message' : 'warning-message'"
        role="alert"
      >
        {{ jobs[task.key]?.errorMessage || '同步未完成，请稍后重试。' }}
      </p>
      <p
        v-else-if="isSucceeded(task)"
        class="state-message sync-job-message"
        aria-live="polite"
      >
        同步完成：读取 {{ jobs[task.key]!.fetchedCount }} 条，新增 {{ jobs[task.key]!.createdCount }} 条，更新 {{ jobs[task.key]!.updatedCount }} 条，跳过 {{ jobs[task.key]!.skippedCount }} 条。
      </p>

      <div class="sync-task-actions">
        <button
          class="secondary-button"
          :aria-busy="starting[task.key] || isActive(task)"
          :disabled="starting[task.key] || isActive(task) || hasActiveJob"
          type="button"
          @click="startSync(task)"
        >
          {{ starting[task.key] ? '正在创建任务…' : isActive(task) ? '同步任务进行中…' : task.actionLabel }}
        </button>
      </div>
    </section>

    <p
      v-if="actionMessage"
      class="state-message sync-job-message"
      aria-live="polite"
    >
      {{ actionMessage }}
    </p>

    <section
      class="sync-center-notes"
      aria-labelledby="sync-center-notes-title"
    >
      <h2 id="sync-center-notes-title">
        运行说明
      </h2>
      <ul>
        <li>净值增量任务保留工作日 20:00 的定时同步；本页按钮用于随时手动补齐。</li>
        <li>净值增量成功后会在同一后台任务内自动生成股票型基金特征快照；若该阶段失败，会保留来源成功记录并提供独立手动重试。</li>
        <li>完整资料任务会调用多类 Tushare 接口，当前仅支持管理员手动发起，完成真实验权后再单独确定自动刷新频率。</li>
        <li>任意时刻只允许一个市场同步任务运行；页面每秒读取一次服务端进度，不会重复触发数据源调用。</li>
      </ul>
    </section>
  </section>
</template>
