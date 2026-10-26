<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FundMaterialsPanel from '@/components/FundMaterialsPanel.vue'
import FundRiskSummary from '@/components/FundRiskSummary.vue'
import FundRatingSection from '@/components/FundRatingSection.vue'
import FundNewsFacts from '@/components/FundNewsFacts.vue'
import FundAlertRules from '@/components/FundAlertRules.vue'
import FundComparisonSection from '@/components/FundComparisonSection.vue'
import { getCompleteFundDetail, getPublicFundShareHistory } from '@/api/fundMaterials'
import SimulationFundActions from '@/components/SimulationFundActions.vue'

import FieldHelpTooltip from '@/components/FieldHelpTooltip.vue'
import FundNavHistoryChart from '@/components/FundNavHistoryChart.vue'
import FundShareHistoryChart from '@/components/FundShareHistoryChart.vue'
import FundShareClassLinks from '@/components/FundShareClassLinks.vue'
import FundManagerCard from '@/components/FundManagerCard.vue'
import { getManagerLinks } from '@/api/fundManagers'
import MultiPredictionPanel from '@/components/MultiPredictionPanel.vue'
import MultiPredictionHistory from '@/components/MultiPredictionHistory.vue'
import { usePageNavigation } from '@/composables/usePageNavigation'
import { getFundNavHistory } from '@/api/funds'
import { addWatchlistItem, removeWatchlistItem, getWatchlistFundDetail, getWatchlistFundShareHistory } from '@/api/watchlist'
import type { FundNavHistory, FundShareHistory, FundShareSnapshot, WatchlistFundDetail } from '@/types/fund'
import { buildFundShareHistoryRows } from '@/utils/fundShareHistory'
import { fundStatusLabel, fundTypeLabel, netValueStatusLabel, formatChangeRate, changeRateTone } from '@/utils/fundPresentation'
import { buildFundManagerProfiles, buildFundManagerTimeline, formatManagerTenureReturn, matchManagerPeriodReturn } from '@/utils/fundManagerTimeline'

/** 市场与关注共用公共资料；关注入口仍通过原接口验证本人关注关系。 */
const route = useRoute()
const router = useRouter()
const watchContext = computed(() => route.name === 'watchlist-fund-detail')
const moduleTitle = computed(() => watchContext.value ? '我的关注' : '基金市场')
const changingWatchlist = ref(false)
const actionMessage = ref('')
let loadSequence = 0
let navSequence = 0
let shareSequence = 0
let shareNavSequence = 0
const { section, sectionLabel, returnTarget } = usePageNavigation()
const detail = ref<WatchlistFundDetail | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const navHistory = ref<FundNavHistory | null>(null)
const navHistoryLoading = ref(false)
const navHistoryError = ref('')
const shareHistory = ref<FundShareHistory | null>(null)
const shareHistoryLoading = ref(false)
const shareHistoryError = ref('')
/** 份额表的同日净值独立加载，不受净值走势页所选时间范围影响。 */
const shareNavHistory = ref<FundNavHistory | null>(null)
const shareNavLoading = ref(false)
const shareNavUnavailable = ref(false)
const selectedNavRange = ref<'THREE_MONTHS' | 'ONE_YEAR' | 'THREE_YEARS' | 'ALL'>('ONE_YEAR')
const fundCode = computed(() => String(route.params.fundCode ?? ''))
const basic = computed(() => detail.value?.basic ?? null)
/** 市场与关注入口共用团队分期，经理加入或离任时才切换到下一时期。 */
const managerTimeline = computed(() => {
  const managers = detail.value?.managers ?? []
  const timeline = buildFundManagerTimeline(managers)
  const profiles = buildFundManagerProfiles(managers)
  return {
    ...timeline,
    periods: timeline.periods.map(period => ({
      ...period,
      performance: matchManagerPeriodReturn(period, detail.value?.managerPeriods),
      // 两个整理方法使用同一份姓名和任职记录，分期中出现的人必有对应资料卡。
      managers: period.managerNames.map(name => profiles.get(name)!),
    })),
  }
})
// 新目录查询失败只影响详情入口，不影响既有基金任期与回报展示。
const managerLinks = ref<Record<string, string>>({})
watch([fundCode, section], async ([code, selectedSection]) => {
  if (selectedSection !== 'manager') return
  managerLinks.value = {}
  try {
    const links = await getManagerLinks(code)
    if (fundCode.value === code) managerLinks.value = links
  } catch { /* 仍可通过顶部经理菜单查阅，原基金资料继续保留。 */ }
}, { immediate: true })
const navRangeOptions = [
  { value: 'THREE_MONTHS', label: '近三月' },
  { value: 'ONE_YEAR', label: '近一年' },
  { value: 'THREE_YEARS', label: '近三年' },
  { value: 'ALL', label: '全部已同步' },
] as const

/** 不猜测来源单位，仅格式化数值，缺失数据保持为“暂缺”。 */
function formatSourceNumber(value: number | string | null | undefined, maximumFractionDigits = 6): string {
  if (value === null || value === undefined || value === '') {
    return '暂缺'
  }
  const numericValue = Number(value)
  return Number.isFinite(numericValue)
    ? numericValue.toLocaleString('zh-CN', { maximumFractionDigits })
    : '暂缺'
}

/** 分红来源金额为每份现金金额；缺失或无效值只显示“暂缺”，不附加单位。 */
function formatCashDividend(value: number | string | null | undefined): string {
  const amount = formatSourceNumber(value, 6)
  return amount === '暂缺' ? amount : `${amount}/份`
}

/** 净值字段统一展示四位小数，避免将缺失值误显示为 0。 */
function formatNetValue(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '暂缺'
  }
  const numericValue = Number(value)
  return Number.isFinite(numericValue)
    ? numericValue.toLocaleString('zh-CN', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
    : '暂缺'
}

/** 所有详情区块使用相同的同步状态文案，空列表不等于同步失败。 */
function syncStatusLabel(status: string | null | undefined): string {
  return status === 'SYNCED' ? '已同步' : '尚未同步'
}

/** 将份额规模查询起点限制在服务端允许窗口内，锚定最新已同步日期而非浏览器当前时间。 */
function shareHistoryStartDate(endDate: string): string {
  const [year, month, day] = endDate.split('-').map(Number)
  const anchor = new Date(Date.UTC(year, month - 1, day))
  anchor.setUTCDate(anchor.getUTCDate() - 4_999)
  return anchor.toISOString().slice(0, 10)
}

/** 以已同步净值业务日期为锚点计算查询窗口，避免浏览器时钟导致未来日期查询。 */
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

/** 复用市场详情的历史净值读取接口；只查询 Java 已落库数据，不触发同步。 */
async function loadNavHistory(endDate: string | null): Promise<void> {
  const ticket = ++navSequence
  navHistory.value = null
  navHistoryError.value = ''
  if (!endDate) {
    return
  }
  navHistoryLoading.value = true
  try {
    const result = await getFundNavHistory(
      fundCode.value,
      navHistoryStartDate(endDate),
      endDate,
    )
    if (ticket === navSequence) navHistory.value = result
  } catch (error) {
    if (ticket === navSequence) navHistoryError.value = error instanceof Error ? error.message : '历史净值暂时不可用。'
  } finally {
    if (ticket === navSequence) navHistoryLoading.value = false
  }
}

/**
 * 只读取最近 12 条份额记录覆盖的净值窗口，并始终使用当前基金代码。
 * 切换基金或重复查询后丢弃旧响应；净值失败仅影响这一列，不阻断份额表。
 */
async function loadShareNavHistory(points: FundShareSnapshot[]): Promise<void> {
  const ticket = ++shareNavSequence
  const code = fundCode.value
  shareNavHistory.value = null
  shareNavUnavailable.value = false
  shareNavLoading.value = false
  const recent = buildFundShareHistoryRows(points, []).slice(-12)
  const first = recent.at(0)
  const last = recent.at(-1)
  if (!first || !last) return
  shareNavLoading.value = true
  try {
    const result = await getFundNavHistory(code, first.tradeDate, last.tradeDate)
    if (ticket === shareNavSequence) shareNavHistory.value = result
  } catch {
    if (ticket === shareNavSequence) shareNavUnavailable.value = true
  } finally {
    if (ticket === shareNavSequence) shareNavLoading.value = false
  }
}

/** 独立读取份额规模历史；两个入口各自沿用服务端现有授权。 */
async function loadShareHistory(endDate: string | null): Promise<void> {
  const ticket = ++shareSequence
  shareHistory.value = null
  shareHistoryError.value = ''
  if (!detail.value || detail.value.latestShareStatus !== 'SYNCED' || !endDate) {
    return
  }
  shareHistoryLoading.value = true
  try {
    const result = await (watchContext.value ? getWatchlistFundShareHistory : getPublicFundShareHistory)(
      fundCode.value,
      shareHistoryStartDate(endDate),
      endDate,
    )
    if (ticket === shareSequence) {
      shareHistory.value = result
      if (section.value === 'share') void loadShareNavHistory(result.items)
    }
  } catch (error) {
    if (ticket === shareSequence) shareHistoryError.value = error instanceof Error ? error.message : '基金份额规模历史暂时不可用。'
  } finally {
    if (ticket === shareSequence) shareHistoryLoading.value = false
  }
}

/** 加载服务端已按当前会话授权的完整资料；403 由统一请求层转换为可展示提示。 */
async function load(): Promise<void> {
  const ticket = ++loadSequence
  ++navSequence; ++shareSequence; ++shareNavSequence
  navHistoryLoading.value = false; shareHistoryLoading.value = false
  loading.value = true
  errorMessage.value = ''
  detail.value = null
  navHistory.value = null
  navHistoryError.value = ''
  shareHistory.value = null
  shareHistoryError.value = ''
  shareNavHistory.value = null
  shareNavLoading.value = false
  shareNavUnavailable.value = false
  try {
    const result = await (watchContext.value ? getWatchlistFundDetail : getCompleteFundDetail)(fundCode.value)
    if (ticket !== loadSequence) return
    detail.value = result
    void loadNavHistory(detail.value.basic.asOfDate)
    void loadShareHistory(detail.value.latestShare?.tradeDate ?? detail.value.basic.asOfDate)
  } catch (error) {
    if (ticket === loadSequence) errorMessage.value = error instanceof Error ? error.message : '基金资料暂时不可用。'
  } finally {
    if (ticket === loadSequence) loading.value = false
  }
}

/** 关注只改变本人清单；退出关注详情后回到清单，不继续展示已失去关系授权的页面。 */
async function toggleWatchlist() {
  if (!detail.value) return
  changingWatchlist.value = true
  actionMessage.value = ''
  try {
    const followed = detail.value.basic.isWatched
    if (followed) await removeWatchlistItem(fundCode.value)
    else await addWatchlistItem(fundCode.value)
    detail.value = { ...detail.value, basic: { ...detail.value.basic, isWatched: !followed } }
    if (followed && watchContext.value) await router.push(returnTarget.value ?? '/watchlist')
  } catch {
    actionMessage.value = '关注操作未完成，请稍后重试。'
  } finally { changingWatchlist.value = false }
}

onMounted(() => {
  void load()
})

watch([fundCode, watchContext], () => {
  void load()
})

watch(selectedNavRange, () => {
  void loadNavHistory(basic.value?.asOfDate ?? null)
})

/** 进入份额页时再取同日净值，其他基金详情子页不增加这次读取。 */
watch(section, (selectedSection) => {
  if (selectedSection === 'share' && shareHistory.value) {
    void loadShareNavHistory(shareHistory.value.items)
  }
})
</script>

<template>
  <section
    class="market-page watchlist-detail-page"
    :aria-label="`${basic?.fundName || fundCode} · ${sectionLabel}`"
  >
    <RouterLink
      class="back-link"
      :to="returnTarget ?? (watchContext ? '/watchlist' : '/funds')"
    >
      ← 返回{{ moduleTitle }}
    </RouterLink>
    <p
      v-if="loading"
      class="state-message"
      role="status"
    >
      正在加载基金资料…
    </p>
    <p
      v-else-if="errorMessage"
      class="state-message error-message"
      role="alert"
    >
      {{ errorMessage }}
    </p>
    <template v-else-if="basic && detail">
      <!-- 基金概览只在基础资料页展示，其他子页直接呈现对应内容。 -->
      <template v-if="section === 'basic'">
        <p class="eyebrow">
          {{ moduleTitle }} · {{ sectionLabel }}
        </p>
        <h1 id="watchlist-fund-detail-title">
          {{ basic.fundName }}
        </h1>
        <p class="lead">
          {{ basic.fundCode }} · {{ fundTypeLabel(basic.fundType) }} · {{ fundStatusLabel(basic.status) }}
        </p>
        <div class="fund-detail-topline">
          <div><span>单位净值</span><strong>{{ formatNetValue(basic.unitNav) }}</strong><small>截至 {{ basic.asOfDate || '日期暂缺' }}</small></div>
          <div><span>单位净值变化</span><strong :class="changeRateTone(basic.dayChangeRate)">{{ formatChangeRate(basic.dayChangeRate) }}</strong><small>较上一条净值，不含分红和买卖费用</small></div>
          <button
            type="button"
            class="secondary-button"
            :disabled="changingWatchlist"
            @click="toggleWatchlist"
          >
            {{ changingWatchlist ? '处理中…' : basic.isWatched ? '取消关注' : '加入关注' }}
          </button>
        </div>
        <p
          v-if="actionMessage"
          role="status"
        >
          {{ actionMessage }}
        </p>
        <SimulationFundActions :fund-code="basic.fundCode" />
      </template>
      <p
        v-if="detail.stale"
        class="notice-banner"
        role="status"
      >
        分析服务暂不可用，当前展示缓存资料（缓存时间：{{ detail.cachedAt || '未知' }}）。
      </p>
      <!-- 公告页只展示提取后的要点，避免与原始资料目录上下重复。 -->
      <FundNewsFacts
        v-if="section === 'documents'"
        :fund-code="fundCode"
      />
      <FundMaterialsPanel
        v-if="['holdings', 'company'].includes(section)"
        :fund-code="fundCode"
        :view="section"
      />
      <FundRiskSummary
        v-if="section === 'holdings'"
        :fund-code="fundCode"
      />
      <FundRatingSection
        v-if="section === 'rating'"
        :fund-code="fundCode"
        :rating-ref="typeof route.query.ratingRef === 'string' && /^[a-f0-9]{64}$/.test(route.query.ratingRef) ? route.query.ratingRef : undefined"
      />
      <FundComparisonSection
        v-if="section === 'comparison'"
        :fund-code="fundCode"
      />
      <FundAlertRules
        v-if="section === 'rules'"
        :fund-code="fundCode"
        :followed="basic.isWatched"
      />
      <!-- 预测与历史仅在关注详情展示；市场详情即使已关注也不挂载预测组件。 -->
      <p
        v-if="watchContext && ['research', 'prediction-history'].includes(section) && !basic.isWatched"
        class="empty-analysis"
      >
        关注后可持续查看这只基金的预测及历史记录。
      </p>
      <MultiPredictionPanel
        v-if="watchContext && section === 'research' && basic.fundCode === fundCode && basic.isWatched"
        :key="`multi-${basic.fundCode}`"
        :fund-code="basic.fundCode"
      />
      <MultiPredictionHistory
        v-if="watchContext && section === 'prediction-history' && basic.fundCode === fundCode && basic.isWatched"
        :fund-code="basic.fundCode"
      />

      <section
        v-if="section === 'basic'"
        class="analysis-section"
        aria-labelledby="watchlist-profile-title"
      >
        <div class="section-heading">
          <div>
            <h2 id="watchlist-profile-title">
              完整基础资料
            </h2>
          </div>
          <span class="section-note">{{ syncStatusLabel(basic.profileStatus) }}</span>
        </div>
        <p
          v-if="basic.profileStatus !== 'SYNCED'"
          class="empty-analysis"
        >
          基础资料尚未完成同步，后续同步完成后会显示；不会用估算值补齐。
        </p>
        <dl
          v-else
          class="detail-grid full-detail-grid"
        >
          <div>
            <dt>基金管理人</dt><dd>{{ basic.managementCompanyName || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="基金管理人"
              description="负责基金投资运作和日常管理的机构。可用于识别管理主体；不能单独判断基金业绩或风险。"
            />
          </div>
          <div>
            <dt>基金托管人</dt><dd>{{ basic.custodianName || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="基金托管人"
              description="负责保管基金资产并履行监督职责的机构。可用于了解资产保管安排；不代表投资收益保障。"
            />
          </div>
          <div>
            <dt>成立日期</dt><dd>{{ basic.foundDate || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="成立日期"
              description="基金合同生效、产品正式成立的日期。可用于了解基金存续时间；不等同于上市或当前可申购日期。"
            />
          </div>
          <div>
            <dt>上市日期</dt><dd>{{ basic.listDate || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="上市日期"
              description="基金在交易所上市交易的日期。部分场外或未上市基金可能暂缺；它不等同于成立日期。"
            />
          </div>
          <div>
            <dt>发行日期</dt><dd>{{ basic.issueDate || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="发行日期"
              description="基金首次向投资者发行的日期。可用于了解产品发行时点；不表示当前仍可认购。"
            />
          </div>
          <div>
            <dt>到期日期</dt><dd>{{ basic.dueDate || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="到期日期"
              description="合同约定的产品到期日期。开放式基金通常可能没有固定到期日，暂缺不代表数据异常。"
            />
          </div>
          <div>
            <dt>投资类型</dt><dd>{{ basic.investType || basic.sourceFundType || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="投资类型"
              description="基金披露的投资策略或产品分类。可帮助理解产品定位；不能替代风险评级或投资建议。"
            />
          </div>
          <div>
            <dt>业绩比较基准</dt><dd>{{ basic.benchmark || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="业绩比较基准"
              description="用于评估基金相对表现的参考组合或指数。可用于回顾比较；不构成收益目标或收益承诺。"
            />
          </div>
          <div>
            <dt>受托人</dt><dd>{{ basic.trusteeName || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="受托人"
              description="基金披露的受托相关机构信息。可用于核对产品资料；具体职责以基金合同为准。"
            />
          </div>
          <div>
            <dt>管理费率（原始值）</dt><dd>{{ formatSourceNumber(basic.managementFee) }}</dd>
            <FieldHelpTooltip
              field-name="管理费率"
              description="已披露的管理费率原始数值。可用于了解持续费用项目；未换算单位或计算总成本，应以基金合同为准。"
            />
          </div>
          <div>
            <dt>托管费率（原始值）</dt><dd>{{ formatSourceNumber(basic.custodianFee) }}</dd>
            <FieldHelpTooltip
              field-name="托管费率"
              description="已披露的托管费率原始数值。可用于了解持续费用项目；未换算单位或计算总成本，应以基金合同为准。"
            />
          </div>
          <div>
            <dt>最低认购额（原始值）</dt><dd>{{ formatSourceNumber(basic.minPurchaseAmount) }}</dd>
            <FieldHelpTooltip
              field-name="最低认购额"
              description="已披露的首次认购最低金额。可用于了解发行期门槛；实际规则可能调整，应以当前销售公告为准。"
            />
          </div>
          <div>
            <dt>发行份额（原始值）</dt><dd>{{ formatSourceNumber(basic.issueAmount) }}</dd>
            <FieldHelpTooltip
              field-name="发行份额"
              description="已披露的发行期份额数。可用于了解发行规模；不等同于当前基金份额或当前资产规模。"
            />
          </div>
          <div>
            <dt>面值（原始值）</dt><dd>{{ formatSourceNumber(basic.parValue) }}</dd>
            <FieldHelpTooltip
              field-name="面值"
              description="已披露的每份面值。可用于区分合同面值和净值；不能将它当作当前单位净值。"
            />
          </div>
          <div>
            <dt>存续年限（原始值）</dt><dd>{{ formatSourceNumber(basic.durationYear) }}</dd>
            <FieldHelpTooltip
              field-name="存续年限"
              description="基金合同约定的存续期限。可用于了解产品期限安排；开放式基金可能没有固定年限。"
            />
          </div>
          <div>
            <dt>认购起始日</dt><dd>{{ basic.purchaseStartDate || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="认购起始日"
              description="已披露的认购开始日期。可用于回顾发行安排；不表示当前一定处于可认购状态。"
            />
          </div>
          <div>
            <dt>赎回起始日</dt><dd>{{ basic.redemptionStartDate || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="赎回起始日"
              description="已披露的赎回开始日期。可用于了解合同安排；实际赎回状态仍应以当前公告为准。"
            />
          </div>
          <FundShareClassLinks :fund-code="basic.fundCode" />
        </dl>
      </section>

      <section
        v-if="section === 'nav'"
        class="analysis-section"
        aria-labelledby="watchlist-nav-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              净值快照
            </p>
            <h2 id="watchlist-nav-title">
              最新净值
            </h2>
          </div>
          <span class="section-note">{{ netValueStatusLabel(basic.navStatus) }}</span>
        </div>
        <dl class="detail-grid full-detail-grid">
          <div>
            <dt>单位净值</dt><dd>{{ formatNetValue(basic.unitNav) }}</dd>
            <FieldHelpTooltip
              field-name="单位净值"
              description="基金在该净值日期每一份的净资产价值。可用于查看当日估值水平；单日数值不能单独代表长期表现。"
            />
          </div>
          <div>
            <dt>累计净值</dt><dd>{{ formatNetValue(basic.accumulatedNav) }}</dd>
            <FieldHelpTooltip
              field-name="累计净值"
              description="已披露的累计净值指标。可用于回顾历史表现；不等同于个人持有收益。"
            />
          </div>
          <div>
            <dt>复权单位净值</dt><dd>{{ formatNetValue(basic.adjustedNav) }}</dd>
            <FieldHelpTooltip
              field-name="复权单位净值"
              description="按复权口径处理分红等因素后的单位净值。可用于同一基金的历史走势比较；不等同于实际交易成交价。"
            />
          </div>
          <div>
            <dt>净值日期</dt><dd>{{ basic.asOfDate || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="净值日期"
              description="这组净值对应的业务日期。可用于判断数据时点；不是页面访问时间，也不代表实时行情。"
            />
          </div>
          <div>
            <dt>公告日期</dt><dd>{{ basic.navAnnDate || '暂缺' }}</dd>
            <FieldHelpTooltip
              field-name="公告日期"
              description="该净值信息的披露或公告日期。可用于识别披露滞后；可能晚于净值日期。"
            />
          </div>
          <div>
            <dt>累计分红</dt><dd>{{ formatNetValue(basic.accumulatedDividend) }}</dd>
            <FieldHelpTooltip
              field-name="累计分红"
              description="已披露的每份累计现金分红相关数值。可用于回顾历史分配情况；不代表未来会继续分红。"
            />
          </div>
          <div>
            <dt>净资产（原始值）</dt><dd>{{ formatSourceNumber(basic.netAsset, 4) }}</dd>
            <FieldHelpTooltip
              field-name="净资产"
              description="已披露的净资产原始数值。可辅助了解资产规模；未换算单位，不作为基金排名依据。"
            />
          </div>
          <div>
            <dt>合计净资产（原始值）</dt><dd>{{ formatSourceNumber(basic.totalNetAsset, 4) }}</dd>
            <FieldHelpTooltip
              field-name="合计净资产"
              description="已披露的合计净资产原始数值。可辅助了解资产规模；未统一范围、币种和单位，不宜直接跨基金比较。"
            />
          </div>
        </dl>
      </section>

      <section
        v-if="section === 'nav'"
        class="analysis-section"
        aria-labelledby="watchlist-nav-history-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              净值走势
            </p>
            <h2 id="watchlist-nav-history-title">
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
      </section>

      <section
        v-if="section === 'manager'"
        class="analysis-section"
        aria-labelledby="watchlist-manager-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              基金经理
            </p>
            <h2 id="watchlist-manager-title">
              任职记录
            </h2>
          </div>
        </div>
        <p
          v-if="detail.managersStatus !== 'SYNCED'"
          class="empty-analysis"
        >
          暂无基金经理资料。
        </p>
        <p
          v-else-if="detail.managers.length === 0"
          class="empty-analysis"
        >
          暂无可展示的基金经理任职记录。
        </p>
        <template v-else>
          <p
            v-if="managerTimeline.periods.length && managerTimeline.unplacedRecords.length"
            class="manager-history-note"
          >
            部分记录尚无法分期，以下管理人信息可能不完整。
          </p>
          <ol
            v-if="managerTimeline.periods.length"
            class="manager-periods"
            aria-label="各时期基金经理，最近时期在前"
          >
            <li
              v-for="period in managerTimeline.periods"
              :key="period.beginDate"
              class="manager-period"
            >
              <div class="manager-period-dates">
                <span
                  v-if="!period.endDate"
                  class="manager-current-label"
                >当前</span>
                <span class="manager-period-range">
                  <time :datetime="period.beginDate">{{ period.beginDate }}</time>
                  <span>{{ period.endDate ? '至' : '至今' }}</span>
                  <time
                    v-if="period.endDate"
                    :datetime="period.endDate"
                  >{{ period.endDate }}</time>
                </span>
                <div class="manager-stage-return">
                  <span>本阶段回报</span>
                  <strong
                    :class="{
                      'is-positive': formatManagerTenureReturn(period.performance) !== '暂无法计算' && Number(period.performance?.returnRate) > 0,
                      'is-negative': formatManagerTenureReturn(period.performance) !== '暂无法计算' && Number(period.performance?.returnRate) < 0,
                    }"
                  >{{ formatManagerTenureReturn(period.performance) }}</strong>
                  <small v-if="formatManagerTenureReturn(period.performance) === '暂无法计算'">
                    {{ period.performance?.reason || '阶段回报资料暂不可用' }}
                  </small>
                </div>
              </div>
              <ul
                v-if="period.managerNames.length"
                class="manager-team"
                aria-label="该时期管理人"
              >
                <li
                  v-for="manager in period.managers"
                  :key="manager.managerName"
                >
                  <FundManagerCard
                    :profile="manager"
                    :manager-target="managerLinks[manager.managerName] ? { name: 'fund-manager-detail', params: { managerId: managerLinks[manager.managerName] }, query: { from: route.fullPath } } : undefined"
                  />
                </li>
              </ul>
              <p
                v-else
                class="manager-history-note"
              >
                该时期任职资料暂缺
              </p>
            </li>
          </ol>
          <p
            v-if="managerTimeline.periods.length"
            class="manager-data-note"
          >
            阶段回报对应左侧日期，完整任期回报对应经理的本基金任期；两者均按分红再投计算，不含个人申赎费用，不可直接相加。共管期业绩不等于个人贡献，从业年限和从业年均回报暂无资料。
          </p>
          <div
            v-if="managerTimeline.unplacedRecords.length"
            class="manager-unplaced"
          >
            <h3>其他任职记录</h3>
            <ul>
              <li
                v-for="(record, index) in managerTimeline.unplacedRecords"
                :key="index"
              >
                <strong>{{ record.manager.managerName || '姓名暂缺' }}</strong>
                <span>{{ record.dateRange }}</span>
                <span>{{ record.reason }}</span>
              </li>
            </ul>
          </div>
        </template>
      </section>

      <section
        v-if="section === 'share'"
        class="analysis-section"
        aria-labelledby="watchlist-share-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              规模快照
            </p>
            <h2 id="watchlist-share-title">
              基金份额规模趋势
            </h2>
          </div>
          <span class="section-note">{{ syncStatusLabel(detail.latestShareStatus) }}</span>
        </div>
        <p
          v-if="detail.latestShareStatus !== 'SYNCED'"
          class="empty-analysis"
        >
          基金份额规模尚未同步。
        </p>
        <template v-else>
          <dl
            v-if="detail.latestShare"
            class="detail-grid share-summary-grid"
          >
            <div><dt>最新变动日期</dt><dd>{{ detail.latestShare.tradeDate }}</dd></div>
            <div><dt>最新基金份额（万份）</dt><dd>{{ formatSourceNumber(detail.latestShare.fundShare, 4) }}</dd></div>
          </dl>
          <p
            v-else
            class="empty-analysis"
          >
            暂无最新基金份额规模记录；下方仅在存在历史数据时展示趋势。
          </p>
          <FundShareHistoryChart
            :error-message="shareHistoryError"
            :loading="shareHistoryLoading"
            :nav-loading="shareNavLoading"
            :nav-points="shareNavHistory?.items ?? []"
            :nav-stale="shareNavHistory?.stale ?? false"
            :nav-unavailable="shareNavUnavailable"
            :points="shareHistory?.items ?? []"
            :status="shareHistory?.status ?? detail.latestShareStatus"
          />
        </template>
      </section>

      <section
        v-if="section === 'dividend'"
        class="analysis-section"
        aria-labelledby="watchlist-dividend-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              分红记录
            </p>
            <h2 id="watchlist-dividend-title">
              历史分红
            </h2>
          </div>
          <span class="section-note">{{ syncStatusLabel(detail.dividendsStatus) }}</span>
        </div>
        <p
          v-if="detail.dividendsStatus !== 'SYNCED'"
          class="empty-analysis"
        >
          分红记录尚未同步。
        </p>
        <p
          v-else-if="detail.dividends.length === 0"
          class="empty-analysis"
        >
          暂无可展示的分红事件。
        </p>
        <ul
          v-else
          class="fund-timeline"
        >
          <li
            v-for="dividend in detail.dividends"
            :key="`${dividend.annDate || 'unknown'}-${dividend.exDate || 'unknown'}-${dividend.baseYear || ''}`"
          >
            <strong>公告日期：{{ dividend.annDate || '暂缺' }}</strong>
            <span>除息日：{{ dividend.exDate || '暂缺' }} · 派息日：{{ dividend.payDate || '暂缺' }}</span>
            <span>现金分红：{{ formatCashDividend(dividend.cashDividend) }}</span>
            <!-- 沿用来源的方案进度，仅展示一次；“实施”本身不表示红利已经到账。 -->
            <span>状态：{{ dividend.processStatus || '暂缺' }}</span>
          </li>
        </ul>
      </section>
      <p class="risk-disclaimer">
        持仓和财务资料以各自披露日期为准，历史表现与已披露事件不代表未来收益。
      </p>
    </template>
  </section>
</template>

<style scoped>
.fund-detail-topline { display: flex; flex-wrap: wrap; gap: 2.5rem; align-items: center; margin: 1.25rem 0; }
.fund-detail-topline > div { display: grid; gap: .3rem; }
.fund-detail-topline span, .fund-detail-topline small { color: #587171; font-size: .85rem; }
.fund-detail-topline strong { font-size: 1.6rem; font-variant-numeric: tabular-nums; }
.fund-detail-topline button { margin-left: auto; }

/* 份额快照只保留日期和份额，宽屏均分两列；窄屏沿用详情单列布局。 */
@media (min-width: 761px) {
  .share-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

/* 时间固定在左，管理人并排在右；窄屏改为上下排列，姓名自动换行而不产生横向滚动。 */
.manager-periods { padding: 0; margin: 18px 0 0; list-style: none; }
.manager-period { display: grid; grid-template-columns: minmax(230px, 270px) minmax(0, 1fr); gap: 24px; align-items: center; padding: 22px 0; border-top: 1px solid var(--workspace-border, #dfe8e3); }
.manager-period:first-child { padding-top: 8px; border-top: 0; }
.manager-period-dates { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; color: #536e63; }
.manager-period-range { display: flex; flex-wrap: wrap; gap: 6px; font-size: 13px; font-variant-numeric: tabular-nums; }
.manager-current-label { color: #0f766e; font-size: 12px; font-weight: 600; }
.manager-stage-return { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 4px 10px; margin-top: 8px; font-size: 12px; }
.manager-stage-return strong { font-size: 17px; line-height: 1.4; font-variant-numeric: tabular-nums; }
.manager-stage-return strong.is-positive { color: #b42318; }
.manager-stage-return strong.is-negative { color: #15803d; }
.manager-stage-return small { grid-column: 1 / -1; color: #647b72; font-size: 11px; line-height: 1.6; overflow-wrap: anywhere; }
.manager-team { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); gap: 12px; min-width: 0; padding: 0; margin: 0; list-style: none; }
.manager-team > li { min-width: 0; }
.manager-history-note { margin: 0; color: #647b72; font-size: 13px; line-height: 1.7; }
.manager-data-note { margin: 14px 0 0; color: #647b72; font-size: 12px; line-height: 1.7; }
.manager-unplaced { padding-top: 20px; margin-top: 12px; border-top: 1px solid var(--workspace-border, #dfe8e3); }
.manager-unplaced h3 { margin: 0 0 12px; font-size: 14px; }
.manager-unplaced ul { display: grid; gap: 10px; padding: 0; margin: 0; list-style: none; }
.manager-unplaced li { display: flex; flex-wrap: wrap; gap: 8px 16px; color: #647b72; font-size: 13px; }
.manager-unplaced strong { color: #203a34; }

@media (max-width: 760px) {
  .manager-period { grid-template-columns: minmax(0, 1fr); gap: 12px; padding: 18px 0; }
}
</style>
