<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { usePageNavigation } from '@/composables/usePageNavigation'
import { useAuthStore } from '@/stores/auth'
import SpxManualSyncPanel from '@/components/SpxManualSyncPanel.vue'
import SimRecurringRunPanel from '@/components/SimRecurringRunPanel.vue'
import ModelRoutesPanel from '@/components/ModelRoutesPanel.vue'
import PredictionResearchPanel from '@/components/PredictionResearchPanel.vue'
import { getSpxManualStatus } from '@/api/spxManual'
import type { SpxManualStatus } from '@/types/spxManual'

import {
  getLastSuccessfulSyncTimes,
  getLatestMultiPredictionSync,
  startMultiPredictionSync,
  getLatestAllSync,
  getLatestMarketFreeDataCompletionSync,
  getLatestMarketNavIncrementalSync,
  getLatestStockFeatureSnapshotSync,
  getLatestSimulationFeeSync,
  startAllSync,
  startMarketFreeDataCompletionSync,
  startMarketNavIncrementalSync,
  startStockFeatureSnapshotSync,
  startSimulationFeeSync,
} from '@/api/syncJobs'
import type { SyncJobStatus } from '@/types/syncJob'

type SyncTaskKey = 'marketNav' | 'freeDataCompletion' | 'featureSnapshot' | 'direction1dPrediction' | 'simulationFees'
const { section, sectionLabel, sectionTarget } = usePageNavigation()
const auth = useAuthStore()

interface SyncTaskDefinition {
  key: SyncTaskKey
  jobType: 'MARKET_NAV_INCREMENTAL' | 'MARKET_FREE_DATA_COMPLETION' | 'STOCK_FEATURE_SNAPSHOT' | 'MULTI_PREDICTIONS' | 'SIMULATION_FEES'
  title: string
  description: string
  scheduleNote: string
  actionLabel: string
  start: (fundCode?: string) => Promise<SyncJobStatus>
  loadLatest: () => Promise<SyncJobStatus | null>
}

/** 同步中心任务注册表；完整资料由资料更新统一覆盖，不再重复提供入口。 */
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
    key: 'freeDataCompletion',
    jobType: 'MARKET_FREE_DATA_COMPLETION',
    title: '基金资料与市场数据更新',
    description: '更新基金基础资料、历史净值、基金经理、份额规模、分红、场内基金行情和市场参考指数，已包含原完整资料同步。使用当前 2000 积分已验权的免费数据，不读取基金持仓、新闻或公告。',
    scheduleNote: '按需手动执行；不会因打开详情页或预测页面自动拉取，指数仅同步已登记的 DRAFT/ACTIVE 参考序列。',
    actionLabel: '开始更新',
    start: startMarketFreeDataCompletionSync,
    loadLatest: getLatestMarketFreeDataCompletionSync,
  },
  {
    key: 'featureSnapshot',
    jobType: 'STOCK_FEATURE_SNAPSHOT',
    title: '历史指标计算',
    description: '根据已保存的基金净值，计算近期涨跌幅、波动程度和最大回撤（从高点到后续低点最多跌了多少）。目前支持股票型基金，不拉取外部数据，也不生成预测。',
    scheduleNote: '净值增量同步成功后自动计算，无需重复点击；计算未完成时，可在此手动重试。',
    actionLabel: '计算历史指标',
    start: startStockFeatureSnapshotSync,
    loadLatest: getLatestStockFeatureSnapshotSync,
  },
  {
    key: 'direction1dPrediction',
    jobType: 'MULTI_PREDICTIONS',
    title: '全部关注基金预测生成',
    description: '检查全部有效账号关注的基金，按基金去重生成五日、二十日和半年实验预测，并保存到各自的预测历史。范围是关注列表；必要数据缺失的基金逐周期列出具体原因。',
    scheduleNote: '后台每轮结束30分钟后自动检查；手动生成不受旧一日实验窗口限制。一键同步在净值、指标和费率更新后执行；预测起点按生成时刻、估值日历及15:00截止规则确定。此处显示本次服务启动后的手动同步任务，公共预测原文永久留档。',
    actionLabel: '生成全部关注基金预测',
    start: startMultiPredictionSync,
    loadLatest: getLatestMultiPredictionSync,
  },
  {
    key: 'simulationFees',
    jobType: 'SIMULATION_FEES',
    title: '模拟组合申赎费率同步',
    description: '从天天基金抓取申购费率与赎回分档；可刷新单只基金，全量初始化覆盖模拟持仓和定投计划涉及的基金。',
    scheduleNote: '按需手动执行，也作为一键同步的第五项，在多周期预测前更新；单只失败会保留原因，其余基金继续。',
    actionLabel: '全量初始化',
    start: startSimulationFeeSync,
    loadLatest: getLatestSimulationFeeSync,
  },
]

const jobs = ref<Record<SyncTaskKey, SyncJobStatus | null>>({
  marketNav: null,
  freeDataCompletion: null,
  featureSnapshot: null,
  direction1dPrediction: null,
  simulationFees: null,
})
const starting = ref<Record<SyncTaskKey, boolean>>({
  marketNav: false,
  freeDataCompletion: false,
  featureSnapshot: false,
  direction1dPrediction: false,
  simulationFees: false,
})
const lastSuccessfulAt = ref<Record<string, string | null>>({
  MARKET_NAV_INCREMENTAL: null,
  MARKET_FREE_DATA_COMPLETION: null,
  STOCK_FEATURE_SNAPSHOT: null,
  MULTI_PREDICTIONS: null,
  SIMULATION_FEES: null,
})
const loading = ref(true)
const stateReady = ref(false)
const allJob = ref<SyncJobStatus | null>(null)
const spxStatus = ref<SpxManualStatus | null>(null)
const spxActive = computed(() => spxStatus.value?.lastAttempt?.state === 'RUNNING')
/** 独立面板页（SPX、定投手动执行）不依赖批量任务状态，也不参与同步任务轮询。 */
const ownPanel = computed(() => section.value === 'spxManual' || section.value === 'simRecurring')
const startingAll = ref(false)
const feeFundCode = ref('')
const canMaintainFees = computed(() => auth.hasPermission('SIM_FEE_RULE_ADMIN'))
const canStartAll = computed(() => canStart.value && canMaintainFees.value)
const allActive = computed(() => allJob.value?.status === 'QUEUED' || allJob.value?.status === 'RUNNING')
const anyStarting = computed(() => startingAll.value || Object.values(starting.value).some(Boolean))
const canStart = computed(() => auth.hasPermission('SYNC_JOB_START') && stateReady.value
  && !loading.value && !anyStarting.value && !hasActiveJob.value)
const visibleTasks = computed(() => tasks.filter((task) => task.key === section.value))
const runningCount = computed(() => Object.values(jobs.value).filter((job) => job?.status === 'RUNNING' || job?.status === 'QUEUED').length + Number(spxActive.value))
const attentionCount = computed(() => Object.values(jobs.value).filter((job) => job?.status === 'FAILED' || job?.status === 'PARTIAL_SUCCESS').length
  + Number(['FAILED', 'INCOMPLETE', 'INTERRUPTED', 'EXPIRED'].includes(spxStatus.value?.lastAttempt?.state ?? '')))
const spxStateLabel = computed(() => ({ ON_TIME: '8点前已保存', LATE: '已同步·晚到', REFERENCE_ONLY: '已同步·资料参考',
  INCOMPLETE: '数据未齐', RUNNING: '正在同步', INTERRUPTED: '同步中断', FAILED: '同步失败', EXPIRED: '资料过期' })[spxStatus.value?.lastAttempt?.state ?? ''] ?? '尚未运行')
const spxSuccessAt = computed(() => ['ON_TIME', 'LATE', 'REFERENCE_ONLY'].includes(spxStatus.value?.lastAttempt?.state ?? '')
  ? spxStatus.value?.lastAttempt?.persistedAt ?? null : null)
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
function statusLabel(status: SyncJobStatus['status'] | undefined, isBatch = false, isFee = false, isCalculation = false, isPrediction = false): string {
  if (isPrediction) return {
    QUEUED: '等待生成', RUNNING: '正在生成预测', SUCCEEDED: '预测已齐备',
    PARTIAL_SUCCESS: '部分基金未生成', FAILED: '预测未生成',
  }[status ?? 'QUEUED']
  return {
    QUEUED: '等待执行',
    RUNNING: isCalculation ? '正在计算' : '正在同步',
    SUCCEEDED: isCalculation ? '计算完成' : '同步完成',
    PARTIAL_SUCCESS: isBatch ? '部分任务未完成' : isFee ? '部分基金同步失败' : '净值已同步，历史指标待重试',
    FAILED: isCalculation ? '计算未完成' : '同步未完成',
  }[status ?? 'QUEUED']
}

/** 格式化服务端时间；无值时不伪造成已开始或已结束。 */
function formatTime(value: string | null): string {
  if (!value) {
    return '尚无成功记录'
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
  const [latestJobs, latestAll, latestSpx] = await Promise.all([
    Promise.all(tasks.map((task) => task.loadLatest())),
    getLatestAllSync(),
    getSpxManualStatus(),
  ])
  if (disposed) return
  allJob.value = latestAll
  spxStatus.value = latestSpx
  tasks.forEach((task, index) => {
    jobs.value[task.key] = latestJobs[index]
    if (latestJobs[index]) updateLastSuccessfulTime(latestJobs[index])
  })
  stateReady.value = true
}

/** 批次由后端推进；页面只读取状态，读失败时保留任务并继续重试。 */
function schedulePolling(): void {
  stopPolling()
  if (disposed || ownPanel.value || (!hasActiveJob.value && stateReady.value)) {
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
async function startSync(task: SyncTaskDefinition, fundCode?: string): Promise<void> {
  if (!canStart.value || (task.key === 'simulationFees' && !canMaintainFees.value)) return
  stopPolling()
  starting.value[task.key] = true
  actionError.value = ''
  actionMessage.value = ''
  try {
    const job = await task.start(fundCode)
    jobs.value[task.key] = job
    actionMessage.value = `${task.title}任务已创建，执行结果见上方任务状态。`
  } catch (error) {
    actionError.value = error instanceof Error ? error.message : '未能确认任务是否创建，请查看最新状态。'
  } finally {
    await loadSyncCenter()
    starting.value[task.key] = false
  }
}

/** 单只与全量费率共用任务入口，校验代码后只提交一次，进度交给后台轮询。 */
function startSingleFeeSync(task: SyncTaskDefinition): void {
  const code = feeFundCode.value.trim()
  if (!/^[0-9]{6}$/.test(code)) {
    actionError.value = '请输入6位基金代码。'
    return
  }
  void startSync(task, code)
}

/** 仅发起一次后台批次；超时也只刷新状态，避免自动重发同步请求。 */
async function startAll(): Promise<void> {
  if (!canStartAll.value) return
  stopPolling()
  startingAll.value = true
  actionError.value = ''
  actionMessage.value = ''
  try {
    allJob.value = await startAllSync()
    actionMessage.value = '一键同步已创建，包含关注基金预测和模拟费率的六项任务将在后台依次执行。关闭或刷新页面不影响执行。'
  } catch (error) {
    actionError.value = error instanceof Error ? error.message : '未能确认批次是否创建，请查看最新状态。'
  } finally {
    await loadSyncCenter()
    startingAll.value = false
  }
}

const hasActiveJob = computed(() => allActive.value || spxActive.value || tasks.some((task) => isActive(task)))

onMounted(() => {
  if (!ownPanel.value) void loadSyncCenter()
})

// 独立手动页面不依赖批量任务的可用性，也不继续它们的页面轮询。
watch(section, (current, previous) => {
  const own = (key: string) => key === 'spxManual' || key === 'simRecurring'
  if (own(current)) stopPolling()
  else if (own(previous)) void loadSyncCenter()
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

    <SpxManualSyncPanel v-if="section === 'spxManual'" />
    <SimRecurringRunPanel v-if="section === 'simRecurring'" />
    <ModelRoutesPanel v-if="section === 'direction1dPrediction' && auth.hasPermission('MODEL_EXPERIMENT_ADMIN')" />
    <PredictionResearchPanel v-if="section === 'direction1dPrediction' && auth.hasPermission('RESEARCH_RUN_ADMIN')" />

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
          <p>依次执行：标普500 → 基金资料与市场数据更新 → 净值增量 → 历史指标计算 → 模拟费率 → 全部关注多周期预测 → 综合建议 → 到期核验。某项失败会记录原因，并继续尝试其余任务。</p>
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
          v-if="auth.hasPermission('SYNC_JOB_START') && canMaintainFees"
          class="primary-button"
          type="button"
          :disabled="!canStartAll"
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
      v-if="loading && !ownPanel"
      class="state-message"
    >
      正在读取同步任务…
    </p>
    <p
      v-else-if="errorMessage && !ownPanel"
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
          </p><strong class="detail-overview-value">{{ tasks.length + 1 }} 类</strong>
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
                  >{{ loading ? '读取中…' : errorMessage ? '状态暂不可用' : jobs[task.key] ? statusLabel(jobs[task.key]!.status, false, task.key === 'simulationFees', task.key === 'featureSnapshot', task.key === 'direction1dPrediction') : '尚未运行' }}</span>
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
              <tr>
                <td><strong>美国标普500手动同步</strong><span>一键同步首先执行，也可单独手动获取；共用每日次数。</span></td>
                <td>{{ loading ? '读取中…' : errorMessage ? '状态暂不可用' : spxStateLabel }}</td>
                <td>{{ loading || errorMessage ? '—' : spxSuccessAt ? formatTime(spxSuccessAt) : '最近一次无成功记录' }}</td>
                <td>
                  <RouterLink
                    class="secondary-link"
                    :to="sectionTarget('spxManual')"
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
          {{ jobs[task.key] ? statusLabel(jobs[task.key]!.status, false, task.key === 'simulationFees', task.key === 'featureSnapshot', task.key === 'direction1dPrediction') : task.key === 'direction1dPrediction' ? '本次服务启动后无手动记录' : '尚未运行' }}
        </span>
      </div>

      <p class="sync-last-success">
        {{ task.scheduleNote }} 上次完成：<strong>{{ formatTime(lastSuccessfulAt[task.jobType]) }}</strong>
      </p>

      <div
        v-if="jobs[task.key]"
        class="sync-progress-section"
      >
        <div class="sync-progress-meta">
          <strong>{{ jobs[task.key]!.progressMessage }}</strong>
          <span>{{ jobs[task.key]!.progressCurrent }} / {{ jobs[task.key]!.progressTotal }} {{ task.key === 'direction1dPrediction' ? '个基金周期项' : '步' }}</span>
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
        <p
          v-if="task.key === 'simulationFees'"
          class="sync-progress-note"
        >
          同步范围：{{ jobs[task.key]!.fundCodes.length ? jobs[task.key]!.fundCodes.join('、') : '模拟持仓与定投涉及的全部基金' }}
        </p>
        <p
          v-else-if="task.key === 'direction1dPrediction'"
          class="sync-progress-note"
        >
          {{ isActive(task) ? '正在按本期目标日检查关注基金，具体进度见上方。' : `本期检查已结束，任务日期：${jobs[task.key]!.requestedNavDate}；预测起止日见对应周期卡` }}
        </p>
        <p
          v-else
          class="sync-progress-note"
        >
          当前基金：{{ jobs[task.key]!.currentFundCode || '正在准备或写入数据' }} · 目标日期：{{ jobs[task.key]!.requestedNavDate }}
        </p>
      </div>

      <dl
        v-if="jobs[task.key]"
        class="sync-summary-grid"
      >
        <div><dt>开始时间</dt><dd>{{ formatTime(jobs[task.key]!.startedAt) }}</dd></div>
        <div><dt>结束时间</dt><dd>{{ formatTime(jobs[task.key]!.finishedAt) }}</dd></div>
        <div><dt>{{ task.key === 'direction1dPrediction' ? '基金周期项数' : task.key === 'simulationFees' ? '检查基金数' : '读取条数' }}</dt><dd>{{ jobs[task.key]!.fetchedCount }}</dd></div>
        <div v-if="task.key === 'simulationFees'">
          <dt>保存成功 / 失败</dt><dd>{{ jobs[task.key]!.updatedCount }} / {{ jobs[task.key]!.fetchedCount - jobs[task.key]!.updatedCount }}</dd>
        </div>
        <div v-else-if="task.key === 'direction1dPrediction'">
          <dt>新生成 / 本期已有 / 未生成</dt><dd>{{ jobs[task.key]!.createdCount }} / {{ jobs[task.key]!.updatedCount }} / {{ jobs[task.key]!.skippedCount }}</dd>
        </div>
        <div v-else>
          <dt>新增 / 更新 / 跳过</dt><dd>{{ jobs[task.key]!.createdCount }} / {{ jobs[task.key]!.updatedCount }} / {{ jobs[task.key]!.skippedCount }}</dd>
        </div>
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
        <template v-if="task.key === 'simulationFees' || task.key === 'featureSnapshot' || task.key === 'direction1dPrediction'">
          {{ jobs[task.key]!.progressMessage }}
        </template>
        <template v-else>
          同步完成：读取 {{ jobs[task.key]!.fetchedCount }} 条，新增 {{ jobs[task.key]!.createdCount }} 条，更新 {{ jobs[task.key]!.updatedCount }} 条，跳过 {{ jobs[task.key]!.skippedCount }} 条。
        </template>
      </p>

      <div class="sync-task-actions">
        <template v-if="task.key === 'simulationFees' && auth.hasPermission('SYNC_JOB_START') && canMaintainFees">
          <div class="fee-code-field admin-inline-form">
            <label for="sync-fee-fund-code">基金代码</label>
            <input
              id="sync-fee-fund-code"
              v-model="feeFundCode"
              inputmode="numeric"
              maxlength="6"
              placeholder="如 001021"
              :disabled="!canStart"
              @keyup.enter="startSingleFeeSync(task)"
            >
          </div>
          <button
            class="primary-button"
            type="button"
            :disabled="!canStart"
            @click="startSingleFeeSync(task)"
          >
            单只刷新
          </button>
        </template>
        <button
          v-if="auth.hasPermission('SYNC_JOB_START') && (task.key !== 'simulationFees' || canMaintainFees)"
          class="secondary-button"
          :aria-busy="starting[task.key] || isActive(task)"
          :disabled="!canStart"
          type="button"
          @click="startSync(task)"
        >
          {{ starting[task.key] ? '正在创建任务…' : isActive(task) ? (task.key === 'direction1dPrediction' ? '正在生成预测…' : task.key === 'featureSnapshot' ? '正在计算…' : '同步任务进行中…') : task.actionLabel }}
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
        <li>一键同步依次执行标普500、基金资料与市场数据更新、净值增量、历史指标计算、模拟费率、多周期预测及综合建议核验，共六类任务；某项失败会单列未完成，其余任务继续。</li>
        <li>预测无需系统或个人实验开关。每只基金每个周期期次复用已有预测；缺数据、日历政策待补或服务失败时列出原因，不能用历史补算冒充提前预测。</li>
        <li>模拟费率支持单只刷新和全量初始化；全量范围为模拟持仓与定投计划涉及的基金。同步成功后可在“费率维护”中查询和编辑规则。</li>
        <li>某项失败仍尝试后续任务；批次部分成功不代表所有数据均已补齐，可查看对应任务并单独重试。</li>
        <li>批次与单项任务共用互斥限制。关闭网页不影响执行；Python 服务重启后不会自动续跑，实时批次状态也会清空。</li>
        <li>净值增量任务保留工作日 20:00 的定时同步；本页按钮用于随时手动补齐。</li>
        <li>净值增量同步成功后，会自动计算股票型基金的历史指标，无需再点计算按钮；若计算失败，可进入“历史指标计算”单独重试。</li>
        <li>基金资料与市场数据更新已包含原完整资料同步，按需手动执行；只使用当前已验权的免费数据，不读取基金持仓、新闻或公告。</li>
        <li>任意时刻只允许一个市场同步任务运行；页面每秒读取一次服务端进度，不会重复触发数据源调用。</li>
        <li>定投计划由后台在每个交易日上午 10:00 自动执行；左侧“定投手动执行”可为每个进行中的计划按前一交易日净值立即补入一期并确认，用于补齐持仓，同一天重复点击不会重复买入，也不属于一键同步全部。</li>
      </ul>
    </section>
  </section>
</template>

<style scoped>
/* 延续用户要求：基金代码标签与输入框同一行，按钮复用同步任务的操作区。 */
.fee-code-field {
  display: flex;
  align-items: center;
  gap: 12px;
}
.fee-code-field label { flex-shrink: 0; }
.fee-code-field input { width: 140px; }
</style>
