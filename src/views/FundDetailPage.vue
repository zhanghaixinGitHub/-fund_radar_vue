<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { getAlertRules, upsertAlertRule } from '@/api/alerts'
import { ApiRequestError } from '@/api/http'
import FundNavHistoryChart from '@/components/FundNavHistoryChart.vue'
import FundSameTypeComparison from '@/components/FundSameTypeComparison.vue'
import {
  getFundDetail,
  getFundAnalysisSummary,
  getFundEvents,
  getFundFeatureStatus,
  getFundNavHistory,
  getFundSameTypeComparison,
  getFundSignals,
} from '@/api/funds'
import { addWatchlistItem, removeWatchlistItem } from '@/api/watchlist'
import type { AlertRule, UpsertAlertRuleRequest } from '@/types/alert'
import type { FundAnalysisSummary } from '@/types/analysis'
import type {
  FundDetail,
  FundEventPage,
  FundFeatureStatus,
  FundNavHistory,
  FundSameTypeComparison as FundSameTypeComparisonModel,
  FundSignal,
  FundSignalPage,
} from '@/types/fund'
import {
  changeRateTone,
  dataSourceLabel,
  formatChangeRate,
  fundStatusLabel,
  fundTypeLabel,
  netValueStatusLabel,
  riskLevelLabel,
  signalDirectionLabel,
} from '@/utils/fundPresentation'

/**
 * 基金详情页面的状态与交互逻辑。
 *
 * 展示基金基本信息、关联事件和评分结果，并提供关注与资讯型提醒规则维护；所有数据均通过 Java 对外接口读取或写入。
 */
const route = useRoute()
const fund = ref<FundDetail | null>(null)
const loading = ref(false)
const changingWatchlist = ref(false)
const errorMessage = ref('')
const actionMessage = ref('')
const analysisMessage = ref('')
const alertMessage = ref('')
const events = ref<FundEventPage | null>(null)
const featureStatus = ref<FundFeatureStatus | null>(null)
const signals = ref<FundSignalPage | null>(null)
const analysisSummary = ref<FundAnalysisSummary | null>(null)
const analysisSummaryError = ref('')
const navHistory = ref<FundNavHistory | null>(null)
const navHistoryLoading = ref(false)
const navHistoryError = ref('')
const sameTypeComparison = ref<FundSameTypeComparisonModel | null>(null)
const sameTypeComparisonLoading = ref(false)
const sameTypeComparisonError = ref('')
const selectedNavRange = ref<'THREE_MONTHS' | 'ONE_YEAR' | 'THREE_YEARS' | 'ALL'>('ONE_YEAR')
const alertRules = ref<AlertRule[]>([])
const selectedAlertType = ref<AlertRule['ruleType']>('RISK_LEVEL')
const riskThreshold = ref(0.5)
const alertEnabled = ref(true)
const savingAlert = ref(false)
const fundCode = computed(() => String(route.params.fundCode ?? ''))
const isMock = computed(() => fund.value?.dataSource === 'M0_MOCK')
const isStale = computed(() => fund.value?.stale === true)
const isWatched = computed(() => fund.value?.isWatched === true)
const dataStatusLabel = computed(() => {
  if (isMock.value) {
    return '演示数据'
  }
  if (isStale.value) {
    return '缓存资料'
  }
  return netValueStatusLabel(fund.value?.navStatus ?? 'UNAVAILABLE')
})
const navHistorySummary = computed(() => {
  const items = navHistory.value?.items ?? []
  if (items.length === 0) {
    return null
  }
  const earliest = items.at(0)?.navDate
  const latest = items.at(-1)?.navDate
  return {
    count: items.length,
    range: earliest && latest ? `${earliest} 至 ${latest}` : null,
    stale: navHistory.value?.stale === true,
  }
})
const navHistoryInsight = computed(() => {
  const points = (navHistory.value?.items ?? []).filter((point) => Number.isFinite(Number(point.unitNav)))
  if (points.length < 2) {
    return null
  }
  const first = points[0]
  const latest = points.at(-1)
  if (!first || !latest) {
    return null
  }
  const accumulatedAvailable = Number.isFinite(Number(first.accumulatedNav))
    && Number.isFinite(Number(latest.accumulatedNav))
  const startValue = accumulatedAvailable ? Number(first.accumulatedNav) : Number(first.unitNav)
  const latestValue = accumulatedAvailable ? Number(latest.accumulatedNav) : Number(latest.unitNav)
  if (startValue <= 0 || !Number.isFinite(latestValue)) {
    return null
  }
  const highest = points.reduce((current, point) => Number(point.unitNav) > Number(current.unitNav) ? point : current)
  const lowest = points.reduce((current, point) => Number(point.unitNav) < Number(current.unitNav) ? point : current)
  return {
    startDate: first.navDate,
    latestDate: latest.navDate,
    changeRate: latestValue / startValue - 1,
    changeBasis: accumulatedAvailable ? '累计净值' : '单位净值',
    highest,
    lowest,
  }
})
const navRangeOptions = [
  { value: 'THREE_MONTHS', label: '近三月' },
  { value: 'ONE_YEAR', label: '近一年' },
  { value: 'THREE_YEARS', label: '近三年' },
  { value: 'ALL', label: '成立以来' },
] as const

/** 将 0 到 1 范围的数值格式化为界面展示的百分比；缺失或非法值显示占位符。 */
function formatPercent(value: number | string | null): string {
  if (value === null) {
    return '—'
  }
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? `${(numericValue * 100).toFixed(1)}%` : '—'
}

/** 将已落库日净值格式化为四位小数；缺失和异常值不得伪造为零。 */
function formatNetValue(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '暂缺'
  }
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return '暂缺'
  }
  return numericValue.toLocaleString('zh-CN', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  })
}

/** 来源数值仅作格式化展示，不擅自推断费率单位或收益含义。 */
function formatSourceNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '暂缺'
  }
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return '暂缺'
  }
  return numericValue.toLocaleString('zh-CN', {
    maximumFractionDigits: 6,
  })
}

/** 统一展示资料同步状态，避免未同步时被误解为字段值为零。 */
function detailSyncStatusLabel(status: string | null | undefined): string {
  return status === 'SYNCED' ? '已同步' : '尚未同步'
}

/** 以基金最新已同步日期为锚点计算查询窗口，避免浏览器时钟把未来日期带入接口。 */
function navHistoryStartDate(endDate: string): string {
  if (selectedNavRange.value === 'ALL') {
    return '2015-01-01'
  }
  const [year, month, day] = endDate.split('-').map(Number)
  const anchor = new Date(Date.UTC(year, month - 1, day))
  anchor.setUTCDate(anchor.getUTCDate() - {
    THREE_MONTHS: 92,
    ONE_YEAR: 366,
    THREE_YEARS: 1_096,
  }[selectedNavRange.value])
  return anchor.toISOString().slice(0, 10)
}

/** 独立加载历史净值；失败不影响目录、关注或提醒规则的展示。 */
async function loadNavHistory(): Promise<void> {
  navHistory.value = null
  navHistoryError.value = ''
  if (!fund.value?.asOfDate) {
    return
  }
  navHistoryLoading.value = true
  try {
    navHistory.value = await getFundNavHistory(
      fundCode.value,
      navHistoryStartDate(fund.value.asOfDate),
      fund.value.asOfDate,
    )
  } catch (error) {
    navHistoryError.value = error instanceof Error ? error.message : '历史净值暂时不可用。'
  } finally {
    navHistoryLoading.value = false
  }
}

/** 独立加载受控市场范围内的同类型比较；失败不影响详情和历史净值展示。 */
async function loadSameTypeComparison(): Promise<void> {
  sameTypeComparison.value = null
  sameTypeComparisonError.value = ''
  sameTypeComparisonLoading.value = true
  try {
    sameTypeComparison.value = await getFundSameTypeComparison(fundCode.value)
  } catch (error) {
    sameTypeComparisonError.value = error instanceof Error ? error.message : '同类型比较暂时不可用。'
  } finally {
    sameTypeComparisonLoading.value = false
  }
}

/** 将后端评分状态转换为用户可理解的中文说明，不推断任何缺失的方向结论。 */
function signalStatusLabel(signal: FundSignal): string {
  if (signal.scoreStatus === 'DATA_INSUFFICIENT') {
    return '数据不足，暂不评分'
  }
  if (signal.scoreStatus === 'NOT_APPLICABLE') {
    return '该基金类型不适用方向评分'
  }
  if (signal.scoreStatus === 'MODEL_REJECTED') {
    return '模型未通过准入，暂不发布'
  }
  return '已完成评分'
}

/** 将特征状态转为用户文案，强调它是模型输入统计而不是预测输出。 */
function featureStatusLabel(status: FundFeatureStatus): string {
  if (status.status === 'NOT_AVAILABLE') {
    return '暂无特征快照'
  }
  if (status.eligibilityStatus === 'DATA_INSUFFICIENT') {
    return '数据不足，暂不评分'
  }
  if (status.eligibilityStatus === 'NOT_APPLICABLE') {
    return '该基金类型暂不适用特征口径'
  }
  return '历史统计输入已就绪'
}

/** 显示本次特征计算统一采用的净值口径，不将缺失口径臆测为实时净值。 */
function navValueBasisLabel(value: FundFeatureStatus['navValueBasis']): string {
  if (value === 'ACCUMULATED_NAV') {
    return '累计净值'
  }
  if (value === 'UNIT_NAV') {
    return '单位净值'
  }
  return '暂缺'
}

/** 将已发布模型可用性转换为业务状态，候选模型不在页面显示。 */
function analysisAvailabilityLabel(summary: FundAnalysisSummary): string {
  if (summary.availabilityStatus === 'ACTIVE') {
    return '模型已发布'
  }
  if (summary.availabilityStatus === 'MODEL_PAUSED') {
    return '模型已暂停'
  }
  return '暂无已发布模型'
}

/** 将回测发布闸门状态转换为面向用户的说明，不将合格等同于投资结果。 */
function publicationStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ELIGIBLE: '通过发布闸门',
    INELIGIBLE: '未通过发布闸门',
    NOT_EVALUATED: '尚未完成准入评估',
  }
  return labels[status] ?? '准入状态待确认'
}

/** 将比较基线状态转换为披露文案，明确无授权基准时不能把回测视为发布证据。 */
function benchmarkStatusLabel(status: string | null): string {
  if (status === 'AVAILABLE') {
    return '已配置'
  }
  if (status === 'NOT_CONFIGURED') {
    return '尚未配置'
  }
  return '暂缺'
}

/** 格式化后端时间字段；解析失败时保留原值，绝不替换为当前本地时间。 */
function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '暂缺'
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString('zh-CN', { hour12: false })
}

/** 将摘要接口错误收敛为页面可识别状态，不暴露内部地址、令牌或连接信息。 */
function analysisSummaryErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError && error.status === 503) {
    return '回测摘要服务暂时不可用，请稍后重试；不会因此生成新的评分或提醒。'
  }
  if (error instanceof ApiRequestError && error.status === 403) {
    return '当前账户没有查看分析摘要的权限。'
  }
  return error instanceof Error ? error.message : '回测摘要暂时不可用。'
}

/** 用当前基金和提醒类型已有的规则回填提醒表单；不存在时使用安全默认值。 */
function applyCurrentAlertRule(): void {
  const existingRule = alertRules.value.find(
    (rule) => rule.fundCode === fundCode.value && rule.ruleType === selectedAlertType.value,
  )
  alertEnabled.value = existingRule?.enabled ?? true
  riskThreshold.value = existingRule?.threshold === null || existingRule?.threshold === undefined
    ? 0.5
    : Number(existingRule.threshold)
}

/** 用户切换提醒类型时清空提示，并回填该类型的既有规则。 */
function changeAlertType(): void {
  alertMessage.value = ''
  applyCurrentAlertRule()
}

/**
 * 加载详情页所需数据。
 *
 * 基金详情是页面必要数据；事件、信号和提醒规则采用独立降级，某一项失败不会阻止其余可用信息展示。
 */
async function load(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  actionMessage.value = ''
  analysisMessage.value = ''
  alertMessage.value = ''
  events.value = null
  featureStatus.value = null
  signals.value = null
  analysisSummary.value = null
  analysisSummaryError.value = ''
  navHistory.value = null
  navHistoryError.value = ''
  sameTypeComparison.value = null
  sameTypeComparisonError.value = ''
  try {
    fund.value = await getFundDetail(fundCode.value)
  } catch (error) {
    fund.value = null
    errorMessage.value = error instanceof Error ? error.message : '基金详情暂时不可用。'
    loading.value = false
    return
  }

  const [historyResult, comparisonResult, eventsResult, featureResult, signalsResult, analysisSummaryResult, alertRulesResult] = await Promise.allSettled([
    loadNavHistory(),
    loadSameTypeComparison(),
    getFundEvents(fundCode.value),
    getFundFeatureStatus(fundCode.value),
    getFundSignals(fundCode.value),
    getFundAnalysisSummary(fundCode.value),
    getAlertRules(),
  ])
  if (historyResult.status === 'rejected') {
    navHistoryError.value = '历史净值暂时不可用。'
  }
  if (comparisonResult.status === 'rejected') {
    sameTypeComparisonError.value = '同类型比较暂时不可用。'
  }
  if (eventsResult.status === 'fulfilled') {
    events.value = eventsResult.value
  }
  if (featureResult.status === 'fulfilled') {
    featureStatus.value = featureResult.value
  }
  if (signalsResult.status === 'fulfilled') {
    signals.value = signalsResult.value
  }
  if (analysisSummaryResult.status === 'fulfilled') {
    analysisSummary.value = analysisSummaryResult.value
  } else {
    analysisSummaryError.value = analysisSummaryErrorMessage(analysisSummaryResult.reason)
  }
  if (alertRulesResult.status === 'fulfilled') {
    alertRules.value = alertRulesResult.value
    applyCurrentAlertRule()
  }
  if (eventsResult.status === 'rejected' || featureResult.status === 'rejected' || signalsResult.status === 'rejected') {
    analysisMessage.value = '事件、特征或信号服务暂不可用；请确认 Java 服务已重启至包含 M2/M3 接口的版本。'
  }
  if (alertRulesResult.status === 'rejected') {
    alertMessage.value = '提醒规则服务暂不可用；请确认 Java 服务已重启至包含 M3 接口的版本。'
  }

  loading.value = false
}

/** 在“加入关注”和“取消关注”之间切换，并防止同一时刻重复提交。 */
async function toggleWatchlist(): Promise<void> {
  changingWatchlist.value = true
  actionMessage.value = ''
  try {
    if (isWatched.value) {
      await removeWatchlistItem(fundCode.value)
      if (fund.value) {
        fund.value = { ...fund.value, isWatched: false }
      }
      actionMessage.value = '已取消关注。'
    } else {
      await addWatchlistItem(fundCode.value)
      if (fund.value) {
        fund.value = { ...fund.value, isWatched: true }
      }
      actionMessage.value = '已加入关注列表。'
    }
  } catch (error) {
    actionMessage.value = error instanceof Error ? error.message : '关注操作未完成。'
  } finally {
    changingWatchlist.value = false
  }
}

/** 根据当前表单组装合法的提醒规则请求并保存到 Java 核心服务。 */
async function saveAlertRule(): Promise<void> {
  savingAlert.value = true
  alertMessage.value = ''
  const request: UpsertAlertRuleRequest = {
    fundCode: fundCode.value,
    ruleType: selectedAlertType.value,
    threshold: selectedAlertType.value === 'RISK_LEVEL' ? riskThreshold.value : null,
    enabled: alertEnabled.value,
  }
  try {
    const savedRule = await upsertAlertRule(request)
    alertRules.value = [
      ...alertRules.value.filter(
        (rule) => !(rule.fundCode === savedRule.fundCode && rule.ruleType === savedRule.ruleType),
      ),
      savedRule,
    ]
    alertMessage.value = savedRule.enabled ? '提醒规则已保存。' : '提醒规则已停用。'
  } catch (error) {
    alertMessage.value = error instanceof Error ? error.message : '提醒规则未保存。'
  } finally {
    savingAlert.value = false
  }
}

/** 首次进入基金详情时加载数据。 */
onMounted(() => {
  void load()
})

/** 地址栏基金代码变化时重新加载，避免复用上一个基金的状态。 */
watch(fundCode, () => {
  void load()
})

/** 切换时间范围时仅重新加载历史曲线，不重新请求事件、评分或关注数据。 */
watch(selectedNavRange, () => {
  void loadNavHistory()
})
</script>

<template>
  <section
    class="market-page"
    aria-labelledby="fund-detail-title"
  >
    <RouterLink
      class="back-link"
      to="/funds"
    >
      ← 返回基金市场
    </RouterLink>
    <p
      v-if="loading"
      class="state-message"
    >
      正在加载基金详情…
    </p>
    <p
      v-else-if="errorMessage"
      class="state-message error-message"
      role="alert"
    >
      {{ errorMessage }}
    </p>
    <template v-else-if="fund">
      <p class="eyebrow">
        基金详情
      </p>
      <h1 id="fund-detail-title">
        {{ fund.fundName }}
      </h1>
      <p class="lead">
        {{ fund.fundCode }} · {{ fundTypeLabel(fund.fundType) }} · {{ fundStatusLabel(fund.status) }}
      </p>
      <p
        v-if="isMock"
        class="notice-banner"
      >
        当前为 M0 Mock 数据，不代表真实净值、收益或投资分析。
      </p>
      <p
        v-if="isStale"
        class="notice-banner"
        role="status"
      >
        分析服务暂不可用，当前展示缓存读模型（缓存时间：{{ fund.cachedAt || '未知' }}）。
      </p>
      <section
        class="detail-overview"
        aria-label="净值与数据状态摘要"
      >
        <article class="detail-overview-card">
          <p class="detail-overview-label">
            最新已落库单位净值
          </p>
          <strong class="detail-overview-value">{{ formatNetValue(fund.unitNav) }}</strong>
          <dl class="detail-overview-facts">
            <div><dt>累计净值</dt><dd>{{ formatNetValue(fund.accumulatedNav) }}</dd></div>
            <div><dt>净值日期</dt><dd>{{ fund.asOfDate || '暂无有效净值' }}</dd></div>
          </dl>
        </article>
        <article class="detail-overview-card">
          <p class="detail-overview-label">
            最近已同步涨跌
          </p>
          <dl class="detail-change-grid">
            <div>
              <dt>日涨跌</dt>
              <dd :class="['change-rate', changeRateTone(fund.dayChangeRate)]">
                {{ formatChangeRate(fund.dayChangeRate) }}
              </dd>
            </div>
            <div>
              <dt>近一周</dt>
              <dd :class="['change-rate', changeRateTone(fund.weekChangeRate)]">
                {{ formatChangeRate(fund.weekChangeRate) }}
              </dd>
            </div>
            <div>
              <dt>近一月</dt>
              <dd :class="['change-rate', changeRateTone(fund.monthChangeRate)]">
                {{ formatChangeRate(fund.monthChangeRate) }}
              </dd>
            </div>
          </dl>
          <p class="detail-overview-meta">
            以上均以最近一次已同步净值为锚点计算。
          </p>
        </article>
        <article class="detail-overview-card">
          <p class="detail-overview-label">
            数据状态
          </p>
          <strong class="detail-overview-value">{{ dataStatusLabel }}</strong>
          <dl class="detail-overview-facts">
            <div><dt>净值状态</dt><dd>{{ netValueStatusLabel(fund.navStatus) }}</dd></div>
            <div><dt>公告日期</dt><dd>{{ fund.navAnnDate || '暂缺' }}</dd></div>
            <div><dt>数据来源</dt><dd>{{ dataSourceLabel(fund.dataSource) }}</dd></div>
          </dl>
          <p
            v-if="navHistoryLoading"
            class="detail-overview-meta"
            role="status"
          >
            正在加载已同步历史净值…
          </p>
          <p
            v-else-if="navHistoryError"
            class="detail-overview-meta"
          >
            历史净值暂时不可用。
          </p>
          <p
            v-else-if="navHistorySummary"
            class="detail-overview-meta"
          >
            {{ navHistorySummary.stale ? '当前展示缓存历史净值' : '已同步' }} {{ navHistorySummary.count }} 条历史净值{{ navHistorySummary.range ? `（${navHistorySummary.range}）` : '' }}。
          </p>
          <p
            v-else
            class="detail-overview-meta"
          >
            当前范围暂无已同步历史净值。
          </p>
        </article>
      </section>
      <section
        class="analysis-section"
        aria-labelledby="fund-profile-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              产品资料
            </p>
            <h2 id="fund-profile-title">
              市场基础资料
            </h2>
          </div>
          <span class="section-note">{{ detailSyncStatusLabel(fund.profileStatus) }}</span>
        </div>
        <p
          v-if="fund.profileStatus !== 'SYNCED'"
          class="empty-analysis"
        >
          基础资料尚未完成同步；基金市场仍可查看已经落库的目录与净值。
        </p>
        <dl
          v-else
          class="detail-grid"
        >
          <div><dt>基金管理人</dt><dd>{{ fund.managementCompanyName || '暂缺' }}</dd></div>
          <div><dt>基金托管人</dt><dd>{{ fund.custodianName || '暂缺' }}</dd></div>
          <div><dt>成立日期</dt><dd>{{ fund.foundDate || '暂缺' }}</dd></div>
          <div><dt>投资类型</dt><dd>{{ fund.investType || fund.sourceFundType || '暂缺' }}</dd></div>
          <div><dt>业绩比较基准</dt><dd>{{ fund.benchmark || '暂缺' }}</dd></div>
          <div><dt>管理费率（来源值）</dt><dd>{{ formatSourceNumber(fund.managementFee) }}</dd></div>
          <div><dt>托管费率（来源值）</dt><dd>{{ formatSourceNumber(fund.custodianFee) }}</dd></div>
          <div><dt>资料来源</dt><dd>{{ fund.profileDataSource ? dataSourceLabel(fund.profileDataSource) : '暂缺' }}</dd></div>
        </dl>
      </section>
      <section
        class="analysis-section"
        aria-labelledby="nav-history-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              净值走势
            </p>
            <h2 id="nav-history-title">
              历史单位净值
            </h2>
          </div>
          <span class="section-note">仅展示已同步历史数据</span>
        </div>
        <div
          class="nav-range-controls"
          aria-label="历史净值时间范围"
        >
          <button
            v-for="option in navRangeOptions"
            :key="option.value"
            :aria-pressed="selectedNavRange === option.value"
            :class="{ 'is-active': selectedNavRange === option.value }"
            type="button"
            @click="selectedNavRange = option.value"
          >
            {{ option.label }}
          </button>
        </div>
        <FundNavHistoryChart
          :cached-at="navHistory?.cachedAt ?? null"
          :error-message="navHistoryError"
          :loading="navHistoryLoading"
          :points="navHistory?.items ?? []"
          :stale="navHistory?.stale ?? false"
        />
        <dl
          v-if="navHistoryInsight"
          class="history-insight-grid"
          aria-label="所选历史净值区间解读"
        >
          <div>
            <dt>所选区间涨跌</dt>
            <dd :class="['change-rate', changeRateTone(navHistoryInsight.changeRate)]">
              {{ formatChangeRate(navHistoryInsight.changeRate) }}
            </dd>
            <span>按{{ navHistoryInsight.changeBasis }}计算</span>
          </div>
          <div>
            <dt>区间最高单位净值</dt>
            <dd>{{ formatNetValue(navHistoryInsight.highest.unitNav) }}</dd>
            <span>{{ navHistoryInsight.highest.navDate }}</span>
          </div>
          <div>
            <dt>区间最低单位净值</dt>
            <dd>{{ formatNetValue(navHistoryInsight.lowest.unitNav) }}</dd>
            <span>{{ navHistoryInsight.lowest.navDate }}</span>
          </div>
          <div>
            <dt>实际数据区间</dt>
            <dd>{{ navHistoryInsight.startDate }} 至 {{ navHistoryInsight.latestDate }}</dd>
            <span>仅含已同步交易日</span>
          </div>
        </dl>
        <p
          v-else-if="!navHistoryLoading && !navHistoryError"
          class="empty-analysis history-insight-empty"
        >
          当前范围内不足两条有效单位净值，暂不计算区间涨跌、最高值或最低值。
        </p>
        <p class="risk-disclaimer">
          净值曲线用于回顾已披露的历史变化，不代表实时估值、未来收益或买卖建议。
        </p>
      </section>
      <section
        class="analysis-section"
        aria-labelledby="same-type-comparison-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              同类型对比
            </p>
            <h2 id="same-type-comparison-title">
              近一月涨跌比较
            </h2>
          </div>
          <span class="section-note">仅当前基金市场样本</span>
        </div>
        <FundSameTypeComparison
          :comparison="sameTypeComparison"
          :current-fund-code="fund.fundCode"
          :error-message="sameTypeComparisonError"
          :loading="sameTypeComparisonLoading"
        />
      </section>
      <button
        class="primary-button"
        :disabled="changingWatchlist"
        type="button"
        @click="toggleWatchlist"
      >
        {{ changingWatchlist ? '处理中…' : isWatched ? '取消关注' : '加入关注' }}
      </button>
      <p
        v-if="actionMessage"
        class="state-message"
        aria-live="polite"
      >
        {{ actionMessage }}
      </p>
      <RouterLink
        v-if="isWatched"
        class="secondary-link"
        :to="`/watchlist/${fund.fundCode}`"
      >
        查看完整关注资料
      </RouterLink>
      <p class="risk-disclaimer">
        本页面仅提供信息与关注管理，不构成投资建议，也不提供交易功能。
      </p>
      <section
        class="analysis-section"
        aria-labelledby="event-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              事件追踪
            </p>
            <h2 id="event-title">
              关联事件
            </h2>
          </div>
          <span class="section-note">关联不代表因果</span>
        </div>
        <p
          v-if="analysisMessage"
          class="state-message"
          role="status"
        >
          {{ analysisMessage }}
        </p>
        <p
          v-else-if="events?.stale"
          class="notice-banner"
          role="status"
        >
          事件服务暂不可用，当前展示缓存内容（缓存时间：{{ events.cachedAt || '未知' }}）。
        </p>
        <ul
          v-if="events && events.items.length > 0"
          class="event-list"
        >
          <li
            v-for="event in events.items"
            :key="event.eventId"
          >
            <a
              :href="event.sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
            >{{ event.summary }}</a>
            <p>{{ event.sourceName }} · {{ event.publishedAt }}</p>
            <p>可信度 {{ formatPercent(event.confidence) }} · 相关性 {{ formatPercent(event.relevanceScore) }}</p>
            <p>关联依据：{{ event.relationReason }}</p>
          </li>
        </ul>
        <p
          v-else-if="!analysisMessage"
          class="empty-analysis"
        >
          暂无已审核且仍在授权保留期内的关联事件。
        </p>
      </section>
      <section
        class="analysis-section"
        aria-labelledby="feature-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              特征数据
            </p>
            <h2 id="feature-title">
              历史统计输入
            </h2>
          </div>
          <span class="section-note">历史统计，不构成预测</span>
        </div>
        <p
          v-if="featureStatus?.stale"
          class="notice-banner"
          role="status"
        >
          特征服务暂不可用，当前展示缓存内容（缓存时间：{{ featureStatus.cachedAt || '未知' }}）。
        </p>
        <template v-if="featureStatus?.status === 'AVAILABLE'">
          <div class="feature-status-card">
            <strong>{{ featureStatusLabel(featureStatus) }}</strong>
            <p>
              数据截至 {{ featureStatus.asOfDate || '未知' }} · 特征 {{ featureStatus.featureVersion || '未知' }} ·
              完整度 {{ formatPercent(featureStatus.completeness) }}
            </p>
            <p>
              来源 {{ dataSourceLabel(featureStatus.sourceCode || '') }} · 净值口径 {{ navValueBasisLabel(featureStatus.navValueBasis) }} ·
              来源同步 {{ featureStatus.sourceSyncFinishedAt || '未知' }}
            </p>
          </div>
          <dl
            v-if="featureStatus.metrics"
            class="feature-metrics"
          >
            <div>
              <dt>近 5 日收益</dt>
              <dd :class="changeRateTone(featureStatus.metrics.return5d)">
                {{ formatChangeRate(featureStatus.metrics.return5d) }}
              </dd>
            </div>
            <div>
              <dt>近 20 日收益</dt>
              <dd :class="changeRateTone(featureStatus.metrics.return20d)">
                {{ formatChangeRate(featureStatus.metrics.return20d) }}
              </dd>
            </div>
            <div>
              <dt>近 60 日收益</dt>
              <dd :class="changeRateTone(featureStatus.metrics.return60d)">
                {{ formatChangeRate(featureStatus.metrics.return60d) }}
              </dd>
            </div>
            <div>
              <dt>20 日波动率</dt>
              <dd>{{ formatPercent(featureStatus.metrics.volatility20d) }}</dd>
            </div>
            <div>
              <dt>60 日最大回撤</dt>
              <dd :class="changeRateTone(featureStatus.metrics.maxDrawdown60d)">
                {{ formatChangeRate(featureStatus.metrics.maxDrawdown60d) }}
              </dd>
            </div>
          </dl>
          <p
            v-else
            class="empty-analysis"
          >
            {{ featureStatus.unavailableReason || '当前特征输入尚不完整，不展示统计指标。' }}
          </p>
        </template>
        <p
          v-else-if="!analysisMessage"
          class="empty-analysis"
        >
          {{ featureStatus ? featureStatusLabel(featureStatus) : '特征状态暂时不可用。' }}
        </p>
      </section>
      <section
        class="analysis-section"
        aria-labelledby="signal-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              评分与分析
            </p>
            <h2 id="signal-title">
              风险与分析状态
            </h2>
          </div>
          <span class="section-note">分析提示，不构成交易指令</span>
        </div>
        <p
          v-if="signals?.stale"
          class="notice-banner"
          role="status"
        >
          信号服务暂不可用，当前展示缓存内容（缓存时间：{{ signals.cachedAt || '未知' }}）。
        </p>
        <ul
          v-if="signals && signals.items.length > 0"
          class="signal-list"
        >
          <li
            v-for="signal in signals.items"
            :key="signal.forecastId"
          >
            <strong>{{ signalStatusLabel(signal) }}</strong>
            <p>数据截至 {{ signal.asOfDate }} · 模型 {{ signal.modelVersion }} · 特征 {{ signal.featureVersion }}</p>
            <p v-if="signal.scoreStatus === 'SCORED'">
              方向 {{ signalDirectionLabel(signal.direction) }} · 概率 {{ formatPercent(signal.directionalProbability) }} · 置信度 {{ formatPercent(signal.confidence) }} · 风险 {{ riskLevelLabel(signal.riskLevel) }}
            </p>
            <p>依据：{{ signal.explanation }}</p>
          </li>
        </ul>
        <p
          v-else-if="!analysisMessage"
          class="empty-analysis"
        >
          暂无可展示的评分结果；在取得足够且合规的数据前不会生成方向性结论。
        </p>
      </section>
      <section
        class="analysis-section"
        aria-labelledby="backtest-summary-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              发布闸门
            </p>
            <h2 id="backtest-summary-title">
              模型与回测摘要
            </h2>
          </div>
          <span class="section-note">回测不是模拟交易账本</span>
        </div>
        <p
          v-if="analysisSummaryError"
          class="state-message error-message"
          role="status"
        >
          {{ analysisSummaryError }}
        </p>
        <template v-else-if="analysisSummary">
          <p
            v-if="analysisSummary.stale"
            class="notice-banner"
            role="status"
          >
            回测摘要服务暂时不可用，当前展示缓存内容（缓存时间：{{ analysisSummary.cachedAt || '未知' }}）。
          </p>
          <div class="feature-status-card">
            <strong>{{ analysisAvailabilityLabel(analysisSummary) }}</strong>
            <p>{{ analysisSummary.message }}</p>
            <p v-if="analysisSummary.model">
              模型 {{ analysisSummary.model.modelVersion }} · 特征 {{ analysisSummary.model.featureVersion }} ·
              状态 {{ analysisSummary.model.releaseStatus === 'ACTIVE' ? '已发布' : '已暂停' }}
            </p>
          </div>
          <dl
            v-if="analysisSummary.backtest"
            class="analysis-backtest-grid"
          >
            <div><dt>发布闸门</dt><dd>{{ publicationStatusLabel(analysisSummary.backtest.publicationStatus) }}</dd></div>
            <div><dt>数据截至日</dt><dd>{{ analysisSummary.backtest.dataCutoff || analysisSummary.backtest.testEnd || '暂缺' }}</dd></div>
            <div>
              <dt>回测窗口</dt>
              <dd>{{ analysisSummary.backtest.windowStart }} 至 {{ analysisSummary.backtest.windowEnd }}</dd>
            </div>
            <div>
              <dt>测试样本</dt>
              <dd>{{ analysisSummary.backtest.sampleCount ?? '暂缺' }} 条 · {{ analysisSummary.backtest.rollingFoldCount ?? '暂缺' }} 折</dd>
            </div>
            <div>
              <dt>年化结果（历史）</dt>
              <dd :class="changeRateTone(analysisSummary.backtest.annualizedReturn)">
                {{ formatChangeRate(analysisSummary.backtest.annualizedReturn) }}
              </dd>
            </div>
            <div>
              <dt>最大回撤（历史）</dt>
              <dd :class="changeRateTone(analysisSummary.backtest.maxDrawdown)">
                {{ formatChangeRate(analysisSummary.backtest.maxDrawdown) }}
              </dd>
            </div>
            <div><dt>波动率（历史）</dt><dd>{{ formatPercent(analysisSummary.backtest.volatility) }}</dd></div>
            <div><dt>命中率（历史）</dt><dd>{{ formatPercent(analysisSummary.backtest.hitRate) }}</dd></div>
            <div><dt>比较基线</dt><dd>{{ benchmarkStatusLabel(analysisSummary.backtest.benchmarkStatus) }}</dd></div>
            <div><dt>完成时间</dt><dd>{{ formatDateTime(analysisSummary.backtest.completedAt) }}</dd></div>
          </dl>
          <p
            v-else
            class="empty-analysis"
          >
            当前没有可披露的已发布模型回测摘要；候选或未准入模型不会在此展示。
          </p>
        </template>
        <p
          v-else
          class="empty-analysis"
        >
          正在读取模型发布与回测状态…
        </p>
        <p class="risk-disclaimer">
          回测只用于检验模型是否具备发布资格。历史指标不能推导个人收益、未来表现或申购、赎回结论。
        </p>
      </section>
      <section
        class="analysis-section"
        aria-labelledby="alert-rule-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              提醒设置
            </p>
            <h2 id="alert-rule-title">
              信息提醒规则
            </h2>
          </div>
          <span class="section-note">仅生成站内信息提醒</span>
        </div>
        <form
          v-if="isWatched"
          class="alert-rule-form"
          @submit.prevent="saveAlertRule"
        >
          <label>
            提醒类型
            <select
              v-model="selectedAlertType"
              @change="changeAlertType"
            >
              <option value="RISK_LEVEL">
                风险等级达到阈值
              </option>
              <option value="SIGNAL_CHANGE">
                信号状态变化
              </option>
              <option value="EVENT">
                重大关联事件
              </option>
            </select>
          </label>
          <label v-if="selectedAlertType === 'RISK_LEVEL'">
            风险阈值（0–1）
            <input
              v-model.number="riskThreshold"
              type="number"
              min="0"
              max="1"
              step="0.01"
              required
            >
          </label>
          <label class="toggle-label">
            <input
              v-model="alertEnabled"
              type="checkbox"
            >
            启用该规则
          </label>
          <button
            class="secondary-button"
            :disabled="savingAlert"
            type="submit"
          >
            {{ savingAlert ? '保存中…' : '保存提醒规则' }}
          </button>
        </form>
        <p
          v-else
          class="empty-analysis"
        >
          请先加入关注列表，再为该基金配置仅站内的信息提醒规则。
        </p>
        <p
          v-if="alertMessage"
          class="state-message"
          aria-live="polite"
        >
          {{ alertMessage }}
        </p>
      </section>
    </template>
  </section>
</template>
