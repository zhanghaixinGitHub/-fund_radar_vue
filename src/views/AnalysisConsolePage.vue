<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import {
  activateAnalysisBenchmark,
  getAnalysisBenchmarks,
  getAnalysisRun,
  importAnalysisBenchmarkPoints,
  registerAnalysisBenchmark,
  startFundExplanation,
  startRollingBacktest,
  suspendAnalysisBenchmark,
} from '@/api/analysis'
import { ApiRequestError } from '@/api/http'
import type { AnalysisRunStatus, BenchmarkNavPointInput, BenchmarkSeriesStatus } from '@/types/analysis'

const feeRate = ref(0.0015)
const run = ref<AnalysisRunStatus | null>(null)
const submitting = ref(false)
const explanationSubmitting = ref(false)
const explanationFundCode = ref('')
const explanationFundCodeError = ref('')
const refreshing = ref(false)
const message = ref('')
const pollAttempts = ref(0)
const benchmarks = ref<BenchmarkSeriesStatus[]>([])
const benchmarksLoading = ref(true)
const benchmarkMessage = ref('')
const registeringBenchmark = ref(false)
const importingPoints = ref(false)
const changingBenchmarkCode = ref<string | null>(null)
const selectedBenchmarkCode = ref('')
const selectedImportBenchmarkCode = ref('')
const newBenchmarkCode = ref('')
const newBenchmarkName = ref('')
const newBenchmarkSourceCode = ref('MANUAL_PUBLISHER_VERIFIED_SAMPLE')
const newBenchmarkLicenseReference = ref('')
const benchmarkPointsText = ref('')
let pollTimer: number | null = null

const canPoll = computed(() => run.value?.status === 'QUEUED' || run.value?.status === 'RUNNING')
const activeBenchmarks = computed(() => benchmarks.value.filter((item) => item.status === 'ACTIVE' && item.sourceEnabled))
const selectedBenchmark = computed(() => benchmarks.value.find((item) => item.benchmarkCode === selectedBenchmarkCode.value) ?? null)

function runStatusLabel(status: AnalysisRunStatus['status']): string {
  const labels: Record<AnalysisRunStatus['status'], string> = {
    QUEUED: '已排队', RUNNING: '运行中', COMPLETED: '已完成', FAILED: '运行失败',
  }
  return labels[status]
}

function runTypeLabel(runType: AnalysisRunStatus['runType']): string {
  return runType === 'FUND_EXPLANATION' ? 'DeepSeek 解释快照' : '滚动回测'
}

function benchmarkStatusLabel(status: BenchmarkSeriesStatus['status']): string {
  const labels: Record<BenchmarkSeriesStatus['status'], string> = {
    DRAFT: '待启用', ACTIVE: '已启用', SUSPENDED: '已暂停',
  }
  return labels[status]
}

function formatDateTime(value: string | null): string {
  if (!value) return '尚未发生'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString('zh-CN', { hour12: false })
}

/** 将服务端状态转换为可操作提示，不泄露 Python 内部异常。 */
function displayRequestError(error: unknown, fallback: string, conflictMessage: string): string {
  if (error instanceof ApiRequestError && error.status === 409) return conflictMessage
  if (error instanceof ApiRequestError && error.status === 403) return '当前账户不是系统管理员，不能管理基准或创建分析运行。'
  if (error instanceof ApiRequestError && error.status === 503) return '分析服务暂时不可用；本页不会自动重试，请稍后手动刷新。'
  return error instanceof Error ? error.message : fallback
}

/** 合并服务端返回的单条状态，避免刷新整页时丢失其他表单输入。 */
function replaceBenchmark(updated: BenchmarkSeriesStatus): void {
  const index = benchmarks.value.findIndex((item) => item.benchmarkCode === updated.benchmarkCode)
  if (index >= 0) benchmarks.value.splice(index, 1, updated)
  else benchmarks.value = [...benchmarks.value, updated].sort((left, right) => left.benchmarkCode.localeCompare(right.benchmarkCode))
}

/** 读取基准概要；原始日序列始终不下发给浏览器。 */
async function loadBenchmarks(): Promise<void> {
  benchmarksLoading.value = true
  benchmarkMessage.value = ''
  try {
    benchmarks.value = await getAnalysisBenchmarks()
    if (!selectedBenchmarkCode.value && activeBenchmarks.value[0]) selectedBenchmarkCode.value = activeBenchmarks.value[0].benchmarkCode
  } catch (error) {
    benchmarkMessage.value = displayRequestError(error, '基准状态暂时无法读取。', '基准状态读取被当前服务状态拒绝。')
  } finally {
    benchmarksLoading.value = false
  }
}

/** 登记基准元数据；来源是否被授权、启用仍由服务端数据治理决定。 */
async function registerBenchmark(): Promise<void> {
  const benchmarkCode = newBenchmarkCode.value.trim().toUpperCase()
  if (!/^[A-Z0-9][A-Z0-9._-]{1,63}$/.test(benchmarkCode)) {
    benchmarkMessage.value = '基准代码需为 2–64 位英文、数字、点、下划线或连字符。'
    return
  }
  if (!newBenchmarkName.value.trim() || !newBenchmarkSourceCode.value.trim() || !newBenchmarkLicenseReference.value.trim()) {
    benchmarkMessage.value = '请填写基准名称、来源编码和授权依据后再登记。'
    return
  }
  registeringBenchmark.value = true
  benchmarkMessage.value = ''
  try {
    const updated = await registerAnalysisBenchmark(benchmarkCode, {
      displayName: newBenchmarkName.value.trim(),
      sourceCode: newBenchmarkSourceCode.value.trim(),
      licenseReference: newBenchmarkLicenseReference.value.trim(),
    })
    replaceBenchmark(updated)
    selectedImportBenchmarkCode.value = updated.benchmarkCode
    benchmarkMessage.value = `已登记 ${updated.benchmarkCode}，下一步请在来源获准启用后导入经核验的日序列。`
  } catch (error) {
    benchmarkMessage.value = displayRequestError(error, '基准未登记。', '来源未登记、已启用基准仍在使用，或元数据不符合治理规则。')
  } finally {
    registeringBenchmark.value = false
  }
}

/** 解析“日期,收盘值”多行文本；服务端仍会二次校验。 */
function parseBenchmarkPoints(rawValue: string): BenchmarkNavPointInput[] {
  const lines = rawValue.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  if (!lines.length || lines.length > 10_000) throw new Error('请填写 1 至 10000 行“YYYY-MM-DD,收盘值”数据。')
  const seenDates = new Set<string>()
  return lines.map((line, index) => {
    const [navDate = '', rawClosingValue = '', ...rest] = line.split(',').map((cell) => cell.trim())
    const closingValue = Number(rawClosingValue)
    if (rest.length || !/^\d{4}-\d{2}-\d{2}$/.test(navDate) || !Number.isFinite(closingValue) || closingValue <= 0) {
      throw new Error(`第 ${index + 1} 行格式错误，应为“YYYY-MM-DD,收盘值”。`)
    }
    if (seenDates.has(navDate)) throw new Error(`第 ${index + 1} 行日期重复，请先合并同一交易日。`)
    seenDates.add(navDate)
    return { navDate, closingValue }
  })
}

/** 导入已人工核验的基准点；浏览器不会保留或展示完整服务端序列。 */
async function importBenchmarkPoints(): Promise<void> {
  const importTarget = benchmarks.value.find((item) => item.benchmarkCode === selectedImportBenchmarkCode.value)
  if (!importTarget) {
    benchmarkMessage.value = '请先从已登记基准中选择一个目标。'
    return
  }
  let points: BenchmarkNavPointInput[]
  try {
    points = parseBenchmarkPoints(benchmarkPointsText.value)
  } catch (error) {
    benchmarkMessage.value = error instanceof Error ? error.message : '基准数据格式不正确。'
    return
  }
  importingPoints.value = true
  benchmarkMessage.value = ''
  try {
    const updated = await importAnalysisBenchmarkPoints(importTarget.benchmarkCode, points)
    replaceBenchmark(updated)
    benchmarkPointsText.value = ''
    benchmarkMessage.value = `已提交 ${points.length} 条日序列。请确认覆盖范围后再显式启用基准。`
  } catch (error) {
    benchmarkMessage.value = displayRequestError(
      error, '基准日序列未导入。', '基准来源尚未启用、基准正在使用，或导入数据未通过一致性校验。',
    )
  } finally {
    importingPoints.value = false
  }
}

/** 显式改变基准状态；不会连带触发模型发布、评分或提醒。 */
async function changeBenchmarkStatus(benchmark: BenchmarkSeriesStatus, action: 'activate' | 'suspend'): Promise<void> {
  changingBenchmarkCode.value = benchmark.benchmarkCode
  benchmarkMessage.value = ''
  try {
    const updated = action === 'activate'
      ? await activateAnalysisBenchmark(benchmark.benchmarkCode)
      : await suspendAnalysisBenchmark(benchmark.benchmarkCode)
    replaceBenchmark(updated)
    if (updated.status !== 'ACTIVE' && selectedBenchmarkCode.value === updated.benchmarkCode) {
      selectedBenchmarkCode.value = activeBenchmarks.value[0]?.benchmarkCode ?? ''
    }
    benchmarkMessage.value = action === 'activate'
      ? `${updated.benchmarkCode} 已启用，可作为候选模型回测基准。`
      : `${updated.benchmarkCode} 已暂停，不会进入新的回测。`
  } catch (error) {
    benchmarkMessage.value = displayRequestError(
      error,
      '基准状态未改变。',
      action === 'activate'
        ? '来源未启用或历史覆盖少于最小门槛，暂不能启用该基准。'
        : '只有已启用基准可以暂停。',
    )
  } finally {
    changingBenchmarkCode.value = null
  }
}

function clearPolling(): void {
  if (pollTimer !== null) {
    globalThis.clearTimeout(pollTimer)
    pollTimer = null
  }
}

function schedulePolling(): void {
  clearPolling()
  if (!canPoll.value || pollAttempts.value >= 40) {
    if (pollAttempts.value >= 40 && canPoll.value) message.value = '运行仍在进行中，已停止自动刷新；请稍后使用“刷新状态”查看。'
    return
  }
  pollTimer = globalThis.setTimeout(() => { void refreshRun(true) }, 3_000)
}

/** 读取当前运行的服务端持久状态；失败不会改变已有运行记录的展示。 */
async function refreshRun(isPolling = false): Promise<void> {
  if (!run.value || refreshing.value) return
  refreshing.value = true
  if (!isPolling) message.value = ''
  try {
    run.value = await getAnalysisRun(run.value.analysisRunId)
    if (isPolling) pollAttempts.value += 1
    schedulePolling()
  } catch (error) {
    message.value = displayRequestError(error, '运行状态暂时无法读取。', '运行当前状态不允许读取。')
  } finally {
    refreshing.value = false
  }
}

/** 仅排队固定股票基线滚动回测；不会同步数据、评分或自动激活模型。 */
async function startRun(): Promise<void> {
  if (!Number.isFinite(feeRate.value) || feeRate.value < 0 || feeRate.value >= 1) {
    message.value = '回测摩擦成本必须在 0（含）到 1（不含）之间。'
    return
  }
  if (!selectedBenchmark.value || selectedBenchmark.value.status !== 'ACTIVE' || !selectedBenchmark.value.sourceEnabled) {
    message.value = '请先选择一个来源已启用、状态为“已启用”的基准，再创建回测。'
    return
  }
  submitting.value = true
  message.value = ''
  clearPolling()
  try {
    run.value = await startRollingBacktest(feeRate.value, selectedBenchmark.value.benchmarkCode)
    pollAttempts.value = 0
    message.value = '回测任务已排队。页面只显示真实持久状态，不会自动发布模型。'
    schedulePolling()
  } catch (error) {
    message.value = displayRequestError(error, '回测任务未创建。', '已有回测正在排队或运行，请等待其结束后再创建新的运行。')
  } finally {
    submitting.value = false
  }
}

function validateExplanationFundCode(): boolean {
  const fundCode = explanationFundCode.value.trim()
  if (!/^\d{6}$/.test(fundCode)) {
    explanationFundCodeError.value = '请输入 6 位基金代码，例如 000001。'
    return false
  }
  explanationFundCode.value = fundCode
  explanationFundCodeError.value = ''
  return true
}

/** 仅为已发布且已有评分的基金手动生成解释，不触发同步、预测、回测或模型发布。 */
async function startExplanation(): Promise<void> {
  if (!validateExplanationFundCode()) return
  explanationSubmitting.value = true
  message.value = ''
  clearPolling()
  try {
    run.value = await startFundExplanation(explanationFundCode.value)
    pollAttempts.value = 0
    message.value = 'DeepSeek V4-Pro 解释任务已排队；它只基于已发布评分生成快照，不会改变模型评分、回测或发布状态。'
    schedulePolling()
  } catch (error) {
    message.value = displayRequestError(
      error,
      '解释任务未创建。',
      '已有分析任务正在排队或运行，请等待其结束后再创建新的解释任务。',
    )
  } finally {
    explanationSubmitting.value = false
  }
}

onMounted(() => { void loadBenchmarks() })
onBeforeUnmount(() => { clearPolling() })
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
      先登记并启用已授权的业绩比较基准，再创建固定股票基线回测。所有操作保持非交易边界：不发起来源同步、不自动评分、不激活模型，也不发送提醒。
    </p>

    <section
      class="admin-table-card benchmark-governance-card"
      aria-labelledby="benchmark-governance-title"
    >
      <header class="admin-table-header">
        <div>
          <p class="eyebrow">
            BENCHMARK GOVERNANCE
          </p><h2 id="benchmark-governance-title">
            回测基准
          </h2>
        </div>
        <button
          class="secondary-button"
          :disabled="benchmarksLoading"
          type="button"
          @click="loadBenchmarks"
        >
          {{ benchmarksLoading ? '刷新中…' : '刷新基准状态' }}
        </button>
      </header>
      <p class="helper-copy">
        基准序列只接受已登记来源的人工核验数据。来源未启用、覆盖不足或基准暂停时，都不能用于创建可发布回测。
      </p>
      <p
        v-if="benchmarkMessage"
        class="state-message"
        aria-live="polite"
      >
        {{ benchmarkMessage }}
      </p>
      <p
        v-if="benchmarksLoading"
        class="empty-state"
      >
        正在读取基准状态…
      </p>
      <p
        v-else-if="!benchmarks.length"
        class="empty-state"
      >
        尚未登记任何基准。请先登记已获授权的数据来源和基准信息。
      </p>
      <ul
        v-else
        class="benchmark-list"
      >
        <li
          v-for="benchmark in benchmarks"
          :key="benchmark.benchmarkCode"
        >
          <div class="benchmark-overview">
            <div class="notification-title-row">
              <strong>{{ benchmark.displayName }}</strong><span>{{ benchmark.benchmarkCode }}</span>
              <span :class="['benchmark-status', `is-${benchmark.status.toLowerCase()}`]">{{ benchmarkStatusLabel(benchmark.status) }}</span>
            </div>
            <p>来源：{{ benchmark.sourceCode }}（{{ benchmark.sourceEnabled ? '已启用' : '未启用' }}） · 已导入 {{ benchmark.pointCount }} 个点 · 覆盖 {{ benchmark.firstNavDate || '—' }} 至 {{ benchmark.lastNavDate || '—' }}</p>
          </div>
          <div class="benchmark-actions">
            <button
              v-if="benchmark.status !== 'ACTIVE'"
              class="secondary-button"
              :disabled="changingBenchmarkCode === benchmark.benchmarkCode"
              type="button"
              @click="changeBenchmarkStatus(benchmark, 'activate')"
            >
              {{ changingBenchmarkCode === benchmark.benchmarkCode ? '处理中…' : '启用基准' }}
            </button>
            <button
              v-else
              class="secondary-button"
              :disabled="changingBenchmarkCode === benchmark.benchmarkCode"
              type="button"
              @click="changeBenchmarkStatus(benchmark, 'suspend')"
            >
              {{ changingBenchmarkCode === benchmark.benchmarkCode ? '处理中…' : '暂停基准' }}
            </button>
          </div>
        </li>
      </ul>

      <div class="benchmark-form-grid">
        <form
          class="benchmark-form"
          @submit.prevent="registerBenchmark"
        >
          <h3>1. 登记基准</h3>
          <label>基准代码<input
            v-model.trim="newBenchmarkCode"
            autocomplete="off"
            maxlength="64"
            placeholder="例如 CSI300.MANUAL.V1"
            required
          ></label>
          <label>基准名称<input
            v-model.trim="newBenchmarkName"
            maxlength="128"
            placeholder="例如 经授权的沪深 300 全收益序列"
            required
          ></label>
          <label>来源编码<input
            v-model.trim="newBenchmarkSourceCode"
            maxlength="64"
            required
          ></label>
          <label>授权依据<input
            v-model.trim="newBenchmarkLicenseReference"
            maxlength="512"
            placeholder="填写已核验的授权或保留依据"
            required
          ></label>
          <button
            class="secondary-button"
            :disabled="registeringBenchmark"
            type="submit"
          >
            {{ registeringBenchmark ? '登记中…' : '登记为待启用' }}
          </button>
        </form>

        <form
          class="benchmark-form"
          @submit.prevent="importBenchmarkPoints"
        >
          <h3>2. 导入人工核验序列</h3>
          <label>导入目标
            <select v-model="selectedImportBenchmarkCode"><option value="">请选择已登记基准</option><option
              v-for="benchmark in benchmarks.filter((item) => item.status !== 'ACTIVE')"
              :key="benchmark.benchmarkCode"
              :value="benchmark.benchmarkCode"
            >{{ benchmark.displayName }}（{{ benchmark.benchmarkCode }}）</option></select>
          </label>
          <label>日序列（每行：YYYY-MM-DD,收盘值）<textarea
            v-model="benchmarkPointsText"
            rows="6"
            placeholder="2020-01-02,3052.14&#10;2020-01-03,3070.12"
          /></label>
          <p class="helper-copy">
            单次最多 10000 行；已启用的基准必须先暂停后才能更新序列。
          </p>
          <button
            class="secondary-button"
            :disabled="importingPoints"
            type="submit"
          >
            {{ importingPoints ? '导入中…' : '导入并校验' }}
          </button>
        </form>
      </div>
    </section>

    <section class="admin-operation-card">
      <div><h2>3. 创建受控回测</h2><p>候选模型固定为股票动量基线，默认摩擦成本为 0.15%。只有来源已启用且状态为“已启用”的基准才能提交回测。</p></div>
      <form
        class="admin-inline-form"
        @submit.prevent="startRun"
      >
        <label>回测基准<select v-model="selectedBenchmarkCode"><option value="">请选择已启用基准</option><option
          v-for="benchmark in activeBenchmarks"
          :key="benchmark.benchmarkCode"
          :value="benchmark.benchmarkCode"
        >{{ benchmark.displayName }}（{{ benchmark.benchmarkCode }}）</option></select></label>
        <label>回测摩擦成本（0–1）<input
          v-model.number="feeRate"
          max="0.999999"
          min="0"
          step="0.0001"
          type="number"
        ></label>
        <button
          class="primary-button"
          :disabled="submitting || canPoll || !selectedBenchmark || selectedBenchmark.status !== 'ACTIVE' || !selectedBenchmark.sourceEnabled"
          type="submit"
        >
          {{ submitting ? '正在排队…' : canPoll ? '已有运行进行中' : '创建滚动回测' }}
        </button>
      </form>
    </section>

    <section class="admin-operation-card deepseek-explanation-operation">
      <div>
        <h2>4. 生成 DeepSeek V4-Pro 解释</h2>
        <p>仅管理员可手动生成。任务只能读取“已发布模型 + 已评分基金”的受控事实并保存解释快照；不会重新预测、修改回测结论或自动发送提醒。</p>
      </div>
      <form
        class="admin-inline-form"
        @submit.prevent="startExplanation"
      >
        <label for="explanation-fund-code">基金代码<input
          id="explanation-fund-code"
          v-model="explanationFundCode"
          :aria-describedby="explanationFundCodeError ? 'explanation-fund-code-error' : undefined"
          :aria-invalid="Boolean(explanationFundCodeError)"
          autocomplete="off"
          inputmode="numeric"
          maxlength="6"
          placeholder="例如 000001"
          @blur="validateExplanationFundCode"
        ></label>
        <p
          v-if="explanationFundCodeError"
          id="explanation-fund-code-error"
          class="form-error"
          role="alert"
        >
          {{ explanationFundCodeError }}
        </p>
        <button
          class="primary-button"
          :disabled="explanationSubmitting || canPoll"
          type="submit"
        >
          {{ explanationSubmitting ? '正在排队…' : canPoll ? '已有运行进行中' : '生成解释快照' }}
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
          </p><h2 id="analysis-run-title">
            当前运行状态
          </h2>
        </div><button
          class="secondary-button"
          :disabled="refreshing"
          type="button"
          @click="refreshRun()"
        >
          {{ refreshing ? '刷新中…' : '刷新状态' }}
        </button>
      </header>
      <dl class="analysis-run-grid">
        <div><dt>运行类别</dt><dd>{{ runTypeLabel(run.runType) }}</dd></div><div><dt>状态</dt><dd>{{ runStatusLabel(run.status) }}</dd></div><div><dt>基金类型</dt><dd>{{ run.fundType }}</dd></div><div><dt>创建时间</dt><dd>{{ formatDateTime(run.requestedAt) }}</dd></div><div><dt>开始时间</dt><dd>{{ formatDateTime(run.startedAt) }}</dd></div><div><dt>结束时间</dt><dd>{{ formatDateTime(run.finishedAt) }}</dd></div>
        <div v-if="run.runType === 'ROLLING_BACKTEST'">
          <dt>候选发布状态</dt><dd>{{ run.modelReleaseStatus || '等待运行结论' }}</dd>
        </div>
        <div v-else>
          <dt>解释模型</dt><dd>DeepSeek V4-Pro</dd>
        </div>
      </dl>
      <p
        v-if="run.failureReason"
        class="notice-banner"
      >
        运行摘要：{{ run.failureReason }}
      </p>
      <p class="risk-disclaimer">
        {{ run.runType === 'ROLLING_BACKTEST'
          ? '回测是模型发布闸门，不是模拟下单或个人收益账本。即使运行完成，也必须经过合格判定与人工审核后才可能进入发布状态。'
          : '解释快照不是预测模型，也不构成投资建议。它只能说明已发布评分所依赖的有限事实、风险与数据缺口。' }}
      </p>
    </section>
  </section>
</template>
