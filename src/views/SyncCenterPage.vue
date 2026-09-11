<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { usePageNavigation } from '@/composables/usePageNavigation'
import { useAuthStore } from '@/stores/auth'

import {
  getLastSuccessfulSyncTimes,
  getLatestAllSync,
  getLatestMarketDetailSync,
  getLatestMarketFreeDataCompletionSync,
  getLatestMarketNavIncrementalSync,
  getLatestStockFeatureSnapshotSync,
  startAllSync,
  startMarketDetailSync,
  startMarketFreeDataCompletionSync,
  startMarketNavIncrementalSync,
  startStockFeatureSnapshotSync,
} from '@/api/syncJobs'
import type { SyncJobStatus } from '@/types/syncJob'

type SyncTaskKey = 'marketNav' | 'marketDetail' | 'freeDataCompletion' | 'featureSnapshot'
const { section, sectionLabel, sectionTarget } = usePageNavigation()
const auth = useAuthStore()

interface SyncTaskDefinition {
  key: SyncTaskKey
  jobType: 'MARKET_NAV_INCREMENTAL' | 'MARKET_DETAIL' | 'MARKET_FREE_DATA_COMPLETION' | 'STOCK_FEATURE_SNAPSHOT'
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
    key: 'freeDataCompletion',
    jobType: 'MARKET_FREE_DATA_COMPLETION',
    title: '当前 2000 积分免费数据补齐',
    description: '补齐当前已验权的基金基础资料、扩展净值、经理、规模、分红、场内基金日线与市场参考指数数据；不读取基金持仓、新闻或公告。',
    scheduleNote: '按需手动执行；不会因打开详情页或预测页面自动拉取，指数仅同步已登记的 DRAFT/ACTIVE 参考序列。',
    actionLabel: '开始补齐',
    start: startMarketFreeDataCompletionSync,
    loadLatest: getLatestMarketFreeDataCompletionSync,
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
  freeDataCompletion: null,
  featureSnapshot: null,
})
const starting = ref<Record<SyncTaskKey, boolean>>({
  marketNav: false,
  marketDetail: false,
  freeDataCompletion: false,
  featureSnapshot: false,
})
const lastSuccessfulAt = ref<Record<string, string | null>>({
  MARKET_NAV_INCREMENTAL: null,
  MARKET_DETAIL: null,
  MARKET_FREE_DATA_COMPLETION: null,
  STOCK_FEATURE_SNAPSHOT: null,
})
const loading = ref(true)
const stateReady = ref(false)
const allJob = ref<SyncJobStatus | null>(null)
const startingAll = ref(false)
const allActive = computed(() => allJob.value?.status === 'QUEUED' || allJob.value?.status === 'RUNNING')
const anyStarting = computed(() => startingAll.value || Object.values(starting.value).some(Boolean))
const canStart = computed(() => auth.hasPermission('SYNC_JOB_START') && stateReady.value
  && !loading.value && !anyStarting.value && !hasActiveJob.value)
const visibleTasks = computed(() => tasks.filter((task) => task.key === section.value))
const runningCount = computed(() => Object.values(jobs.value).filter((job) => job?.status === 'RUNNING' || job?.status === 'QUEUED').length)
const attentionCount = computed(() => Object.values(jobs.value).filter((job) => job?.status === 'FAILED' || job?.status === 'PARTIAL_SUCCESS').length)
const errorMessage = ref('')
const actionError = ref('')
const actionMessage = ref('')
let pollingTimer: ReturnType<typeof globalThis.setTimeout> | undefined
let disposed = false

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
function statusLabel(status: SyncJobStatus['status'] | undefined, isBatch = false): string {
  return {
    QUEUED: '等待执行',
    RUNNING: '正在同步',
    SUCCEEDED: '同步完成',
    PARTIAL_SUCCESS: isBatch ? '部分任务未完成' : '来源已同步，特征待重试',
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

/** 读取最近批次与各子任务，可恢复刷新页面后或其他管理员创建的任务。 */
async function refreshJobStates(): Promise<void> {
  const [latestJobs, latestAll] = await Promise.all([
    Promise.all(tasks.map((task) => task.loadLatest())),
    getLatestAllSync(),
  ])
  if (disposed) return
  allJob.value = latestAll
  tasks.forEach((task, index) => {
    jobs.value[task.key] = latestJobs[index]
    if (latestJobs[index]) updateLastSuccessfulTime(latestJobs[index])
  })
  stateReady.value = true
}

/** 批次由后端推进；页面只读取状态，读失败时保留任务并继续重试。 */
function schedulePolling(): void {
  stopPolling()
  if (disposed || (!hasActiveJob.value && stateReady.value)) {
    return
  }
  pollingTimer = globalThis.setTimeout(async () => {
    try {
      await refreshJobStates()
      errorMessage.value = ''
    } catch (error) {
      stateReady.value = false
      errorMessage.value = error instanceof Error ? error.message : '同步进度暂时不可用。'
    } finally {
      schedulePolling()
    }
  }, stateReady.value ? 1_000 : 5_000)
}

/** 页面首次进入时读取最近任务和持久化的上次成功时间。 */
async function loadSyncCenter(): Promise<void> {
  if (disposed) return
  stopPolling()
  loading.value = true
  stateReady.value = false
  errorMessage.value = ''
  try {
    const [, successTimes] = await Promise.all([
      refreshJobStates(),
      getLastSuccessfulSyncTimes(),
    ])
    if (disposed) return
    for (const item of successTimes) {
      const previous = lastSuccessfulAt.value[item.jobType]
      if (item.lastSuccessfulAt && (!previous || new Date(item.lastSuccessfulAt) > new Date(previous))) {
        lastSuccessfulAt.value[item.jobType] = item.lastSuccessfulAt
      }
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
  if (!canStart.value) return
  stopPolling()
  starting.value[task.key] = true
  actionError.value = ''
  actionMessage.value = ''
  try {
    const job = await task.start()
    jobs.value[task.key] = job
    actionMessage.value = `${task.title}任务已创建，正在读取服务端进度。`
  } catch (error) {
    actionError.value = error instanceof Error ? error.message : '未能确认任务是否创建，请查看最新状态。'
  } finally {
    await loadSyncCenter()
    starting.value[task.key] = false
  }
}

/** 仅发起一次后台批次；超时也只刷新状态，避免自动重发同步请求。 */
async function startAll(): Promise<void> {
  if (!canStart.value) return
  stopPolling()
  startingAll.value = true
  actionError.value = ''
  actionMessage.value = ''
  try {
    allJob.value = await startAllSync()
    actionMessage.value = '一键同步已创建，四类任务将在后台依次执行。关闭或刷新页面不影响执行。'
  } catch (error) {
    actionError.value = error instanceof Error ? error.message : '未能确认批次是否创建，请查看最新状态。'
  } finally {
    await loadSyncCenter()
    startingAll.value = false
  }
}

const hasActiveJob = computed(() => allActive.value || tasks.some((task) => isActive(task)))

onMounted(() => {
  void loadSyncCenter()
})

onBeforeUnmount(() => {
  disposed = true
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
      {{ sectionLabel }}
    </h1>
    <p class="lead">
      集中发起和跟踪基金市场同步任务；所有进度均来自服务端实际执行状态，不涉及买卖或交易。
    </p>

    <section
      v-if="section === 'overview'"
      class="sync-task-card"
      aria-labelledby="sync-all-title"
    >
      <div class="sync-task-heading">
        <div>
          <h2 id="sync-all-title">
            一键同步全部
          </h2>
          <p>依次执行：完整资料 → 免费数据补齐 → 净值增量 → 特征快照。某项失败会记录原因，并继续尝试其余任务。</p>
        </div>
        <span
          v-if="allJob"
          class="sync-status"
          :class="`is-${allJob.status.toLowerCase()}`"
        >{{ statusLabel(allJob.status, true) }}</span>
      </div>
      <p class="sync-progress-note">
        任务在后台执行，关闭或刷新页面不影响执行；全部运行可能较久，请勿重复提交。
      </p>
      <div
        v-if="allJob"
        class="sync-progress-section"
        aria-live="polite"
      >
        <div class="sync-progress-meta">
          <strong>{{ allJob.progressMessage }}</strong>
          <span>已结束 {{ allJob.progressCurrent }} / {{ allJob.progressTotal }} 项</span>
        </div>
        <div
          class="sync-progress-track"
          role="progressbar"
          aria-label="全部同步任务进度"
          :aria-valuemax="allJob.progressTotal"
          :aria-valuemin="0"
          :aria-valuenow="allJob.progressCurrent"
          :aria-valuetext="allJob.progressMessage"
        >
          <span :style="{ width: `${progressPercent(allJob)}%` }" />
        </div>
        <p
          v-if="allJob.errorMessage"
          class="state-message warning-message"
          role="alert"
        >
          {{ allJob.errorMessage }}
        </p>
      </div>
      <div class="sync-task-actions">
        <button
          v-if="auth.hasPermission('SYNC_JOB_START')"
          class="primary-button"
          type="button"
          :disabled="!canStart"
          :aria-busy="startingAll || allActive"
          @click="startAll"
        >
          {{ startingAll ? '正在创建批次…' : allActive ? '全部同步进行中…' : '一键同步全部' }}
        </button>
        <button
          class="secondary-button"
          type="button"
          :disabled="loading || anyStarting"
          @click="loadSyncCenter"
        >
          刷新状态
        </button>
      </div>
    </section>

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
    <p
      v-if="actionError"
      class="state-message error-message"
      role="alert"
    >
      {{ actionError }}
    </p>

    <template v-if="section === 'overview'">
      <div class="watchlist-summary-grid workspace-summary-grid">
        <article class="detail-overview-card">
          <p class="detail-overview-label">
            已配置任务
          </p><strong class="detail-overview-value">{{ tasks.length }} 类</strong>
        </article>
        <article class="detail-overview-card">
          <p class="detail-overview-label">
            排队 / 运行中
          </p><strong class="detail-overview-value">{{ loading || errorMessage ? '—' : runningCount }} 项</strong>
        </article>
        <article class="detail-overview-card">
          <p class="detail-overview-label">
            需要处理
          </p><strong class="detail-overview-value">{{ loading || errorMessage ? '—' : attentionCount }} 项</strong>
        </article>
      </div>
      <section
        class="admin-table-card"
        aria-labelledby="sync-overview-title"
      >
        <header class="admin-table-header">
          <h2 id="sync-overview-title">
            各类任务最近状态
          </h2><RouterLink
            class="secondary-link"
            :to="sectionTarget('notes')"
          >
            运行说明
          </RouterLink>
        </header>
        <div class="admin-table-wrap">
          <table>
            <thead><tr><th>任务</th><th>最近状态</th><th>上次成功</th><th>操作</th></tr></thead>
            <tbody>
              <tr
                v-for="task in tasks"
                :key="task.key"
              >
                <td><strong>{{ task.title }}</strong><span>{{ task.scheduleNote }}</span></td>
                <td>
                  <span
                    class="sync-status"
                    :class="jobs[task.key] ? `is-${jobs[task.key]!.status.toLowerCase()}` : 'is-idle'"
                  >{{ loading ? '读取中…' : errorMessage ? '状态暂不可用' : jobs[task.key] ? statusLabel(jobs[task.key]!.status) : '尚未运行' }}</span>
                </td>
                <td>{{ loading || errorMessage ? '—' : formatTime(lastSuccessfulAt[task.jobType]) }}</td>
                <td>
                  <RouterLink
                    class="secondary-link"
                    :to="sectionTarget(task.key)"
                  >
                    查看详情 →
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <section
      v-for="task in visibleTasks"
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
          v-if="auth.hasPermission('SYNC_JOB_START')"
          class="secondary-button"
          :aria-busy="starting[task.key] || isActive(task)"
          :disabled="!canStart"
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
      v-if="section === 'notes'"
      class="sync-center-notes"
      aria-labelledby="sync-center-notes-title"
    >
      <h2 id="sync-center-notes-title">
        运行说明
      </h2>
      <ul>
        <li>一键同步覆盖本页四类任务，串行执行并统一在末尾生成一次特征快照；各项仍保留独立进度和结果。</li>
        <li>某项失败仍尝试后续任务；批次部分成功不代表所有数据均已补齐，可查看对应任务并单独重试。</li>
        <li>批次与单项任务共用互斥限制。关闭网页不影响执行；Python 服务重启后不会自动续跑，实时批次状态也会清空。</li>
        <li>净值增量任务保留工作日 20:00 的定时同步；本页按钮用于随时手动补齐。</li>
        <li>净值增量成功后会在同一后台任务内自动生成股票型基金特征快照；若该阶段失败，会保留来源成功记录并提供独立手动重试。</li>
        <li>完整资料和免费数据补齐任务会调用多类 Tushare 接口，当前仅支持管理员手动发起；不自动读取基金持仓、新闻或公告。</li>
        <li>任意时刻只允许一个市场同步任务运行；页面每秒读取一次服务端进度，不会重复触发数据源调用。</li>
      </ul>
    </section>
  </section>
</template>
