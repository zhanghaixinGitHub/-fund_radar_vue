<script setup lang="ts">
import PortfolioComposition from '@/components/PortfolioComposition.vue'
import HoldingManagementDrawer from '@/components/HoldingManagementDrawer.vue'
import ListPagination from '@/components/ListPagination.vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { readLatestDecisions } from '@/api/multiPrediction'
import type { DecisionReport } from '@/types/multiPrediction'
import AccountFundingPanel from '@/components/AccountFundingPanel.vue'
import AccountRiskPanel from '@/components/AccountRiskPanel.vue'
import AccountOptionsPanel from '@/components/AccountOptionsPanel.vue'
import { rememberPortfolioScroll, takePortfolioScroll } from '@/utils/advice'
import { rememberEarningsScroll, takeEarningsScroll } from '@/utils/simulationEarnings'
import { cancelSimOrder, changeSimPlan, getSimComposition, getSimLedger, getSimOrders, getSimOverview, getSimPeriods, getSimPlans } from '@/api/simulation'
import SimulationTradeDialog from '@/components/SimulationTradeDialog.vue'
import SimulationFundPicker from '@/components/SimulationFundPicker.vue'
import { useListLocation } from '@/composables/useListLocation'
import { usePageNavigation } from '@/composables/usePageNavigation'
import { usePortfolioRequest } from '@/composables/usePortfolioRequest'
import { useAuthStore } from '@/stores/auth'
import type { SimComposition, SimLedger, SimOrder, SimOverview, SimPage, SimPeriod, SimPlan } from '@/types/simulation'
import { buildPortfolioList, sortPortfolioList } from '@/utils/portfolioList'
import { planFrequency, simMoney, simPercent, simShares, simTime, simTone } from '@/utils/simulation'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { section, sectionLabel, sectionTarget } = usePageNavigation()
const { location: listLocation, navigate: navigateList, isCurrent } = useListLocation()
const overviewRequest = usePortfolioRequest<SimOverview | null>(getSimOverview, null, '持仓暂时无法读取，请刷新重试。')
const { data: overview, loading, error } = overviewRequest
const compositionRequest = usePortfolioRequest<SimComposition | null>(getSimComposition, null, '持仓构成暂时无法读取，可重试。')
const { data: composition, loading: compositionLoading, error: compositionError } = compositionRequest
const adviceRequest = usePortfolioRequest<DecisionReport[]>(readLatestDecisions, [], '操作建议暂时无法读取，可进入详情重试。')
const { data: advice } = adviceRequest
const adviceByFund = computed(() => new Map(advice.value.map(item => [item.fundCode, item])))
const plansRequest = usePortfolioRequest<SimPlan[]>(getSimPlans, [], '定投计划暂时无法读取，请重试。')
const { data: plans, loading: plansLoading, error: plansError } = plansRequest
const orders = ref<SimPage<SimOrder> | null>(null)
const ledger = ref<SimPage<SimLedger> | null>(null)
const periods = ref<SimPage<SimPeriod> | null>(null)
const periodPlan = ref<SimPlan | null>(null)
const message = ref('')
const detailError = ref('')
const busy = ref(false)
const endingPlan = ref<string | null>(null)
const picker = ref(false)
const pickerMode = ref<'BUY' | 'PLAN'>('BUY')
const trade = ref<{ fundCode: string; mode: 'BUY' | 'SELL' | 'PLAN'; plan?: SimPlan } | null>(null)
const showHistory = computed(() => route.query.showHistory === '1')
const orderPage = ref(1)
const ledgerPage = ref(1)
const periodPage = ref(1)
const orderPageSize = ref(10)
const ledgerPageSize = ref(10)
const periodPageSize = ref(10)
const detailsLoading = ref(false)
const periodsLoading = ref(false)
const recordMode = ref<'orders' | 'ledger'>('orders')
// 已提交的关键词由 URL 保存，输入框草稿在点击查询或按回车后才生效，返回持仓时可恢复。
const appliedKeyword = computed(() => listLocation.value.keyword.trim())
const keyword = ref(appliedKeyword.value)
const selectedCode = computed(() => /^\d{6}$/.test(String(route.query.fundCode ?? '')) ? String(route.query.fundCode) : '')
const selectedPosition = computed(() => overview.value ? buildPortfolioList(overview.value).find(p => p.fundCode === selectedCode.value) ?? null : null)
// 本人确认持仓但尚无模拟记录的基金只补列名单；资产汇总仍使用实际账本，不把未知值补零。
const positions = computed(() => {
  const query = appliedKeyword.value.toLocaleLowerCase()
  return (overview.value ? buildPortfolioList(overview.value) : []).filter(p => (!selectedCode.value || p.fundCode === selectedCode.value) &&
    (p.kind !== 'recorded' || showHistory.value || selectedCode.value || Number(p.shares) > 0 || (!p.estimatedShares && Number(p.totalBuy) === 0 && Number(p.totalSell) === 0)) &&
    (!query || p.fundCode.includes(query) || p.fundName.toLocaleLowerCase().includes(query)))
})
const managedCode = ref('')
const managedPosition = computed(() => managedCode.value ? positions.value.find(position => position.fundCode === managedCode.value) ?? null : null)
// 排序状态进入 URL，查看建议后返回持仓仍保持所选排序；均按数值降序。
const holdingSortOptions = [
  { value: 'marketValue', label: '持有金额' },
  { value: 'holdingGain', label: '持有收益' },
  { value: 'cumulativeGain', label: '累计收益' },
] as const
type HoldingSort = (typeof holdingSortOptions)[number]['value']
const holdingSort = computed<HoldingSort>(() => holdingSortOptions.find(o => o.value === route.query.sort)?.value ?? 'marketValue')
const sortedPositions = computed(() => sortPortfolioList(positions.value, holdingSort.value))
// 先按当前搜索与持仓状态筛选，再分页展示；沿用市场和关注页的 URL 页码、每页条数规则。
const holdingPageSizeOptions = [10, 20, 50]
const holdingPageSize = computed(() => listLocation.value.size)
const holdingTotalPages = computed(() => Math.max(1, Math.ceil(positions.value.length / holdingPageSize.value)))
const holdingPage = computed(() => Math.min(listLocation.value.page, holdingTotalPages.value))
const pagedPositions = computed(() => {
  const start = (holdingPage.value - 1) * holdingPageSize.value
  return sortedPositions.value.slice(start, start + holdingPageSize.value)
})
// 定投计划沿用持仓的 URL 页码与每页条数规则；切换基金范围时由 selectCode 重置页码。
const planPageSizeOptions = [10, 20, 50]
const planPageSize = computed(() => listLocation.value.size)
// 状态筛选进入 URL；进行中包含执行中与已暂停，已结束对应 ENDED。
const planStatusOptions = [
  { value: '', label: '全部状态' },
  { value: 'active', label: '进行中' },
  { value: 'ended', label: '已结束' },
] as const
const planStatus = computed(() => planStatusOptions.find(o => o.value === route.query.status)?.value ?? '')
const filteredPlans = computed(() => plans.value.filter(p =>
  (!selectedCode.value || p.fundCode === selectedCode.value) &&
  (!planStatus.value || (planStatus.value === 'ended' ? p.status === 'ENDED' : p.status !== 'ENDED'))))
const planTotalPages = computed(() => Math.max(1, Math.ceil(filteredPlans.value.length / planPageSize.value)))
const planPage = computed(() => Math.min(listLocation.value.page, planTotalPages.value))
const pagedPlans = computed(() => {
  const start = (planPage.value - 1) * planPageSize.value
  return filteredPlans.value.slice(start, start + planPageSize.value)
})
const canWrite = computed(() => auth.hasPermission('SIM_PORTFOLIO_SELF_WRITE'))
const canPlan = computed(() => auth.hasPermission('SIM_PLAN_SELF_WRITE'))
const jobStale = computed(() => !overview.value?.job?.completedAt || Date.now() - Date.parse(overview.value.job.completedAt) > 5 * 60_000)
const planLabels = { ACTIVE: '执行中', PAUSED: '已暂停', ENDED: '已结束' }
const orderLabels = { PENDING: '待确认', CONFIRMED: '已确认', CANCELLED: '已撤销' }
const ledgerLabels: Record<string, string> = { ORDER_SUBMITTED: '提交交易', ORDER_CANCELLED: '撤销交易', BUY_CONFIRMED: '买入确认', SELL_CONFIRMED: '卖出确认', NAV_CORRECTION: '净值更正', DIVIDEND_RECEIVABLE: '应收分红', DIVIDEND_PAID: '分红派发', PLAN_SAVED: '保存定投', PLAN_PAUSED: '暂停定投', PLAN_ACTIVE: '恢复定投', PLAN_ENDED: '结束定投', PLAN_CALENDAR_PAUSED: '日历不足暂停' }
let alive = true
let detailGeneration = 0
let polling: ReturnType<typeof globalThis.setInterval> | undefined

async function load() {
  if (loading.value || ['funding', 'account-risk', 'options'].includes(section.value)) return
  // 持仓先显示；附加区域各自完成，不能把慢请求变成整页等待。
  loadSectionData(true)
  const success = await overviewRequest.load()
  if (success && alive) void loadDetails()
}
function loadSectionData(refresh = false) {
  if (section.value === 'overview' && (refresh || !compositionRequest.ready.value)) void compositionRequest.load()
  if (['holdings', 'plans'].includes(section.value) && (refresh || !plansRequest.ready.value)) void plansRequest.load()
  if (section.value === 'holdings' && (refresh || !adviceRequest.ready.value)) void adviceRequest.load()
}
async function loadDetails() {
  const current = ++detailGeneration
  detailsLoading.value = true
  detailError.value = ''
  const code = selectedCode.value || undefined
  try {
    if (section.value === 'orders') {
      if (recordMode.value === 'orders') {
        const result = await getSimOrders(orderPage.value, code, orderPageSize.value)
        if (alive && current === detailGeneration) orders.value = result
      } else {
        const result = await getSimLedger(ledgerPage.value, code, ledgerPageSize.value)
        if (alive && current === detailGeneration) ledger.value = result
      }
    }
  } catch (reason) { if (alive && current === detailGeneration) detailError.value = reason instanceof Error ? reason.message : '记录加载失败。' }
  finally { if (alive && current === detailGeneration) detailsLoading.value = false }
}
function selectCode(code: string) { void router.replace({ path: route.path, query: { ...route.query, fundCode: code || undefined, page: undefined } }) }
// 定投与交易记录共用基金搜索：关键词解析为唯一持仓基金后沿用 fundCode 精确过滤，空关键词恢复全部基金。
const scopeKeyword = ref('')
const scopeHint = ref('')
function searchScope() {
  const value = scopeKeyword.value.trim()
  scopeHint.value = ''
  if (!value) { selectCode(''); return }
  if (/^\d{6}$/.test(value)) { selectCode(value); return }
  const query = value.toLocaleLowerCase()
  const matches = (overview.value?.positions ?? []).filter(p => p.fundCode.includes(value) || p.fundName.toLocaleLowerCase().includes(query))
  if (matches.length === 1) selectCode(matches[0].fundCode)
  else if (matches.length > 1) scopeHint.value = `匹配到多只基金：${matches.slice(0, 5).map(p => `${p.fundName}·${p.fundCode}`).join('、')}，请输入完整的 6 位基金代码。`
  else scopeHint.value = '未找到匹配的持仓基金，可输入完整的 6 位基金代码。'
}
/** 切换定投状态筛选时回到第一页，避免停留在旧筛选的中间页。 */
function changePlanStatus(value: string) {
  if (loading.value || value === planStatus.value) return
  void router.push({ path: route.path, query: { ...route.query, status: value || undefined, page: undefined } })
}
/** 查询时回到完整持仓列表，清除单基金详情限定，避免隐藏条件影响搜索；空关键词恢复全部持仓。 */
function searchHoldings() {
  if (loading.value) return
  keyword.value = keyword.value.trim().slice(0, 50)
  void router.push({ path: route.path, query: { ...route.query, section: 'holdings', fundCode: undefined, keyword: keyword.value || undefined, page: undefined } })
}
/** 切换展示范围时重置页码；状态进入 URL，查看建议后返回仍能恢复已清仓基金所在的列表。 */
function changeHoldingHistory(checked: boolean) {
  if (loading.value) return
  void router.push({ path: route.path, query: { ...route.query, showHistory: checked ? '1' : undefined, page: undefined } })
}
/** 切换排序时回到第一页，避免停留在旧排序的中间页。 */
function changeHoldingSort(value: string) {
  if (loading.value || value === holdingSort.value) return
  void router.push({ path: route.path, query: { ...route.query, sort: value === 'marketValue' ? undefined : value, page: undefined } })
}
/** 在已有筛选结果内翻页；切换每页条数时由调用方传入第一页，避免跳过持仓。 */
function changeHoldingPage(page: number, size = holdingPageSize.value) {
  if (loading.value || !Number.isInteger(page) || !holdingPageSizeOptions.includes(size)) return
  const total = Math.max(1, Math.ceil(positions.value.length / size))
  const target = Math.min(Math.max(1, page), total)
  void navigateList('', appliedKeyword.value, target, size)
}
/** 定投翻页只更新页码与每页条数，保留基金范围等其余查询参数。 */
function changePlanPage(page: number, size = planPageSize.value) {
  if (loading.value || !Number.isInteger(page) || !planPageSizeOptions.includes(size)) return
  const total = Math.max(1, Math.ceil(filteredPlans.value.length / size))
  const target = Math.min(Math.max(1, page), total)
  void router.push({ path: route.path, query: { ...route.query, page: target > 1 ? String(target) : undefined, size: size !== 10 ? String(size) : undefined } })
}
function openPicker(mode: 'BUY' | 'PLAN') { pickerMode.value = mode; picker.value = true }
function picked(code: string) { picker.value = false; trade.value = { fundCode: code, mode: pickerMode.value } }
function saved(value: string) { trade.value = null; message.value = value; void load() }
function editPlan(plan: SimPlan) { trade.value = { fundCode: plan.fundCode, mode: 'PLAN', plan } }
function planFor(code: string) { return plans.value.find(p => p.fundCode === code && p.status !== 'ENDED') }
async function openPlan(code: string) {
  // 计划尚未读到或刷新失败时先核对，不能把未知误当成没有计划。
  if ((!plansRequest.ready.value || plansError.value || plansLoading.value) && !await plansRequest.load()) return
  if (!alive) return
  const plan = planFor(code); trade.value = { fundCode: code, mode: 'PLAN', ...(plan ? { plan } : {}) }
}
function openManagedTrade(mode: 'BUY' | 'SELL' | 'PLAN') {
  const code = managedPosition.value?.fundCode
  if (!code) return
  if (mode === 'PLAN') openPlan(code)
  else trade.value = { fundCode: code, mode }
}
async function cancel(order: SimOrder) {
  if (busy.value) return
  busy.value = true; message.value = ''; error.value = ''
  try { await cancelSimOrder(order.orderId); message.value = '订单已撤销，冻结份额已释放。'; await load() }
  catch (reason) { error.value = reason instanceof Error ? reason.message : '撤单失败。' }
  finally { busy.value = false }
}
function cancellable(order: SimOrder) { return order.status === 'PENDING' && Date.now() < Date.parse(`${order.tradeDate}T15:00:00+08:00`) }
async function act(plan: SimPlan, action: 'PAUSE' | 'RESUME' | 'END') {
  if (busy.value) return
  if (action === 'END' && endingPlan.value !== plan.planId) { endingPlan.value = plan.planId; return }
  busy.value = true; error.value = ''; message.value = ''
  try { await changeSimPlan(plan, action); endingPlan.value = null; message.value = '定投计划已更新，已生成的订单保留。'; await load() }
  catch (reason) { error.value = reason instanceof Error ? reason.message : '计划更新失败。' }
  finally { busy.value = false }
}
async function viewPeriods(plan: SimPlan, page = 1) {
  periodsLoading.value = true
  periodPlan.value = plan; periodPage.value = page; periods.value = null; detailError.value = ''
  try {
    const result = await getSimPeriods(plan.planId, page, periodPageSize.value)
    if (alive && periodPlan.value?.planId === plan.planId && periodPage.value === page) periods.value = result
  } catch (reason) { detailError.value = reason instanceof Error ? reason.message : '执行记录加载失败。' }
  finally { periodsLoading.value = false }
}
watch([section, selectedCode], () => {
  loadSectionData(true)
  endingPlan.value = null
  managedCode.value = ''
  orderPage.value = 1; ledgerPage.value = 1; orders.value = null; ledger.value = null; periodPlan.value = null
  if (!['funding', 'account-risk', 'options'].includes(section.value) && !overview.value) void load()
  else void loadDetails()
})
watch([orderPage, ledgerPage, orderPageSize, ledgerPageSize, recordMode], () => void loadDetails())
watch(appliedKeyword, value => { keyword.value = value })
watch(selectedCode, code => {
  scopeKeyword.value = code ? (selectedPosition.value ? `${selectedPosition.value.fundName} · ${code}` : code) : ''
  scopeHint.value = ''
}, { immediate: true })
watch(managedPosition, position => { if (!position) managedCode.value = '' })
// 等持仓实际加载后才修正越界页码，避免刷新或详情返回时被尚未加载的空列表重置到第一页。
watch([() => listLocation.value.page, holdingPage, section, overview], () => {
  if (!isCurrent.value || section.value !== 'holdings' || !overview.value) return
  if (listLocation.value.page !== holdingPage.value) {
    void router.replace({ path: route.path, query: { ...route.query, page: holdingPage.value > 1 ? String(holdingPage.value) : undefined } })
  }
})
// 定投独立加载后才修正页码，不能用尚未返回的空计划列表重置位置。
watch([() => listLocation.value.page, planPage, section, plansRequest.ready], () => {
  if (!isCurrent.value || section.value !== 'plans' || !plansRequest.ready.value) return
  if (listLocation.value.page !== planPage.value) {
    void router.replace({ path: route.path, query: { ...route.query, page: planPage.value > 1 ? String(planPage.value) : undefined } })
  }
})
onMounted(() => {
  void load().then(async () => {
    await nextTick()
    const top = takeEarningsScroll(route.fullPath) ?? takePortfolioScroll(route.fullPath)
    if (alive && top !== null) globalThis.scrollTo({ top })
  })
  polling = globalThis.setInterval(() => { if (globalThis.document.visibilityState === 'visible' && !busy.value && !trade.value) void load() }, 60_000)
})
onBeforeRouteLeave(to => {
  if (to.name === 'portfolio-advice') rememberPortfolioScroll(route.fullPath, globalThis.scrollY)
  if (to.name === 'portfolio-earnings') rememberEarningsScroll(route.fullPath, globalThis.scrollY)
})
onBeforeUnmount(() => { alive = false; detailGeneration++; globalThis.clearInterval(polling) })
</script>

<template>
  <section
    class="sim-page"
    aria-labelledby="sim-title"
  >
    <header class="sim-page-header">
      <div class="visually-hidden">
        <h1 id="sim-title">
          {{ section === 'overview' ? '持仓总览' : sectionLabel }}
        </h1>
      </div>
      <div
        v-if="!['funding', 'account-risk', 'options'].includes(section)"
        class="sim-actions"
      >
        <button
          v-if="canWrite"
          class="primary-button"
          type="button"
          @click="openPicker('BUY')"
        >
          添加基金
        </button><button
          class="secondary-button"
          type="button"
          :disabled="loading"
          @click="load()"
        >
          {{ loading ? '刷新中…' : '刷新记录' }}
        </button>
      </div>
    </header>
    <AccountFundingPanel v-if="section === 'funding'" />
    <AccountRiskPanel v-if="section === 'account-risk'" />
    <AccountOptionsPanel v-if="section === 'options'" />
    <form
      v-if="section === 'holdings'"
      class="fund-filter-toolbar"
      :aria-busy="loading"
      @submit.prevent="searchHoldings"
    >
      <div class="fund-filter-search">
        <label
          class="visually-hidden"
          for="portfolio-keyword"
        >基金代码或名称</label>
        <svg
          class="fund-filter-search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          aria-hidden="true"
        ><circle
          cx="11"
          cy="11"
          r="6.5"
        /><path d="m16 16 4 4" /></svg>
        <input
          id="portfolio-keyword"
          v-model="keyword"
          maxlength="50"
          placeholder="基金代码或名称，例如：000001"
          type="search"
        >
      </div>
      <label for="portfolio-sort">排序方式</label>
      <div class="fund-filter-select">
        <select
          id="portfolio-sort"
          :value="holdingSort"
          :disabled="loading"
          @change="changeHoldingSort(($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="option in holdingSortOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
      <button
        class="secondary-button fund-filter-submit"
        :disabled="loading"
        type="submit"
      >
        {{ loading ? '查询中' : '查询' }}
      </button>
    </form>
    <p
      v-if="error"
      class="error-message"
      role="alert"
    >
      {{ error }}
    </p>
    <p
      v-if="message"
      class="sim-success"
      role="status"
    >
      {{ message }}
    </p>
    <p
      v-if="loading && !overview"
      role="status"
    >
      正在加载模拟持仓…
    </p>
    <template v-if="overview">
      <!-- 账户汇总集中在总览，明细页直接展示当前功能，减少首屏重复信息。 -->
      <template v-if="section === 'overview'">
        <div class="sim-metrics">
          <article><span>持有金额（元）</span><strong>{{ simMoney(overview.marketValue) }}</strong><small>{{ overview.confirmedBaseline ? '部分持仓份额待补全，金额暂未随净值更新' : overview.complete ? '按已公布净值计算' : '部分数据待核对，汇总含上次估值' }}</small></article>
          <article><span>持有收益（元）</span><strong :class="simTone(overview.holdingGain)">{{ simMoney(overview.holdingGain) }}</strong><small>当前剩余份额的浮动盈亏</small></article>
          <article><span>累计收益（元）</span><strong :class="simTone(overview.cumulativeGain)">{{ simMoney(overview.cumulativeGain) }}</strong><small>包含卖出盈亏与现金分红</small></article>
        </div>
        <p
          v-if="overview.pendingOrders"
          class="notice-banner"
        >
          {{ overview.pendingOrders }} 笔交易待确认，其中买入金额 {{ simMoney(overview.pendingBuyAmount) }} 元，尚未计入持仓市值。<RouterLink :to="sectionTarget('orders')">
            查看交易
          </RouterLink>
        </p>
        <PortfolioComposition
          :data="composition"
          :loading="compositionLoading"
          :error="compositionError"
          @retry="compositionRequest.load()"
        />
        <div class="sim-status">
          <span :class="jobStale || overview.job?.status === 'FAILED' ? 'sim-warning' : ''">{{ jobStale ? '后台运行状态待确认' : overview.job?.message }}</span><span>最近完成：{{ simTime(overview.job?.completedAt) }}</span>
        </div>
      </template>
      <form
        v-if="section === 'plans' || section === 'orders'"
        class="search-panel"
        @submit.prevent="searchScope"
      >
        <label for="scope-keyword">基金代码或名称</label>
        <div class="sim-search-line">
          <div class="search-row">
            <input
              id="scope-keyword"
              v-model="scopeKeyword"
              maxlength="50"
              placeholder="例如：000001"
              type="search"
            >
            <button
              class="primary-button"
              :disabled="loading"
              type="submit"
            >
              {{ loading ? '查询中…' : '查询基金' }}
            </button>
          </div>
          <label
            v-if="section === 'plans'"
            class="sim-sort"
          >计划状态 <select
            :value="planStatus"
            :disabled="loading"
            @change="changePlanStatus(($event.target as HTMLSelectElement).value)"
          ><option
            v-for="option in planStatusOptions"
            :key="option.value"
            :value="option.value"
          >{{ option.label }}</option></select></label>
        </div>
      </form>
      <p
        v-if="scopeHint && (section === 'plans' || section === 'orders')"
        class="state-message"
        role="status"
      >
        {{ scopeHint }}
      </p>
      <p
        v-if="detailError"
        class="error-message"
        role="alert"
      >
        {{ detailError }}
      </p>

      <template v-if="section === 'holdings'">
        <p
          v-if="plansError"
          class="error-message"
          role="alert"
        >
          {{ plansError }} <button
            type="button"
            class="secondary-button"
            @click="plansRequest.load()"
          >
            重试
          </button>
        </p>
        <section
          class="fund-results-panel holdings-results-panel"
          aria-label="持仓列表"
        >
          <div class="sim-section-header holdings-list-header">
            <h2>{{ selectedPosition?.fundName ?? '持仓明细' }}</h2><label class="sim-check"><input
              :checked="showHistory"
              :disabled="loading"
              type="checkbox"
              @change="changeHoldingHistory(($event.target as HTMLInputElement).checked)"
            >显示已清仓基金</label>
          </div>
          <div
            v-if="!positions.length"
            class="sim-empty"
          >
            <template v-if="appliedKeyword">
              <h3>没有符合条件的持仓基金</h3>
              <p>请调整基金代码或名称后重新查询，清空关键词可恢复持仓列表。</p>
            </template>
            <template v-else>
              <h3>还没有{{ selectedCode ? '这只基金的' : '' }}模拟持仓</h3><p>从关注中选一只基金买入，或直接设置第一笔定投。</p>
            </template>
            <div
              v-if="!appliedKeyword"
              class="sim-actions"
            >
              <button
                v-if="canWrite"
                class="primary-button"
                type="button"
                @click="selectedCode ? trade = { fundCode: selectedCode, mode: 'BUY' } : openPicker('BUY')"
              >
                模拟买入
              </button><button
                v-if="canPlan"
                class="secondary-button"
                type="button"
                @click="selectedCode ? openPlan(selectedCode) : openPicker('PLAN')"
              >
                设置定投
              </button>
            </div>
          </div>
          <div
            v-else
            class="holdings-table-scroll"
            tabindex="0"
          >
            <table class="holdings-table">
              <thead>
                <tr>
                  <th scope="col">
                    基金
                  </th>
                  <th
                    class="holdings-number"
                    scope="col"
                  >
                    市值（元）
                  </th>
                  <th
                    class="holdings-number"
                    scope="col"
                  >
                    昨日收益（元）
                  </th>
                  <th
                    class="holdings-number"
                    scope="col"
                  >
                    持有收益 / 收益率
                  </th>
                  <th
                    class="holdings-number"
                    scope="col"
                  >
                    累计收益（元）
                  </th>
                  <th
                    class="holdings-number"
                    scope="col"
                  >
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                <template
                  v-for="p in pagedPositions"
                  :key="p.fundCode"
                >
                  <tr>
                    <th scope="row">
                      <div class="holding-fund-heading">
                        <span :title="p.fundName">{{ p.fundName }}</span>
                        <span
                          v-if="planFor(p.fundCode)"
                          class="sim-badge"
                        >定投{{ planLabels[planFor(p.fundCode)!.status] }}</span>
                        <span
                          v-else-if="p.kind === 'recorded' && Number(p.shares) === 0 && (Number(p.totalBuy) > 0 || p.estimatedShares)"
                          class="sim-badge"
                        >已清仓</span>
                      </div>
                      <p class="holding-fund-meta">
                        {{ p.fundCode }}<template v-if="p.kind === 'recorded'">
                          · {{ p.navDate ? `净值 ${p.navDate} / ${p.unitNav}` : '等待首笔交易确认' }}
                        </template><template v-else-if="p.kind === 'confirmed' && p.dataAsOfDate">
                          · 截至 {{ p.dataAsOfDate }}
                        </template>
                      </p>
                    </th>
                    <template v-if="p.kind === 'unrecorded'">
                      <td class="holdings-number">
                        —
                      </td>
                      <td class="holdings-number">
                        —
                      </td>
                      <td class="holdings-number">
                        —
                      </td>
                      <td class="holdings-number">
                        —
                      </td>
                    </template>
                    <template v-else>
                      <td class="holdings-number">
                        {{ simMoney(p.marketValue) }}
                      </td>
                      <td class="holdings-number">
                        <span :class="simTone(p.yesterdayGain)">{{ simMoney(p.yesterdayGain) }}</span>
                        <small>{{ p.yesterdayDate }}{{ p.yesterdayGain == null ? ' · 暂不可用' : '' }}</small>
                      </td>
                      <td class="holdings-number">
                        <span :class="simTone(p.holdingGain)">{{ simMoney(p.holdingGain) }}</span>
                        <small :class="simTone(p.holdingGain)">{{ simPercent(p.holdingGainRate) }}</small>
                      </td>
                      <td :class="['holdings-number', simTone(p.cumulativeGain)]">
                        {{ simMoney(p.cumulativeGain) }}
                      </td>
                    </template>
                    <td class="holdings-number">
                      <button
                        class="secondary-button holding-manage-button"
                        type="button"
                        :aria-label="`管理 ${p.fundName}`"
                        @click="managedCode = p.fundCode"
                      >
                        管理与详情
                      </button>
                    </td>
                  </tr>
                  <tr class="holding-metadata-row">
                    <td colspan="6">
                      <p
                        v-if="p.kind === 'recorded' && p.issue"
                        class="holding-inline-notice"
                        role="status"
                      >
                        {{ p.issue }} 当前显示上次有效估值。
                      </p>
                      <p
                        v-if="p.kind === 'recorded'"
                        class="holding-metadata"
                      >
                        持有 {{ simShares(p.shares) }} 份 · 可卖 {{ simShares(p.availableShares) }} 份 · 冻结 {{ simShares(p.frozenShares) }} 份 · 剩余成本 {{ simMoney(p.cost) }} 元{{ p.estimatedShares ? ' · 份额按金额折算' : '' }}
                      </p>
                      <p
                        v-else-if="p.kind === 'confirmed'"
                        class="holding-metadata"
                      >
                        持仓份额待补全，暂不能更新全部持仓估值或卖出原持仓。
                      </p>
                      <p
                        v-else
                        class="holding-metadata"
                      >
                        暂无模拟持仓数据，金额、份额和收益暂不可用。
                      </p>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <ListPagination
            v-if="positions.length > 0"
            :page="holdingPage"
            :page-size="holdingPageSize"
            :total="positions.length"
            :loading="loading"
            label="持仓分页"
            @change="changeHoldingPage"
          />
        </section>
      </template>

      <template v-else-if="section === 'plans'">
        <div class="sim-section-header">
          <h2>我的定投</h2><button
            v-if="canPlan"
            class="primary-button"
            type="button"
            @click="openPicker('PLAN')"
          >
            新建定投
          </button>
        </div>
        <p
          v-if="plansLoading && !plansRequest.ready.value"
          role="status"
        >
          正在读取定投计划…
        </p>
        <p
          v-else-if="plansError"
          role="alert"
          class="error-message"
        >
          {{ plansError }} <button
            type="button"
            class="secondary-button"
            @click="plansRequest.load()"
          >
            重试
          </button>
        </p>
        <p
          v-else-if="!plans.length"
          class="sim-empty"
        >
          还没有定投计划。无需先买入，也可以直接设置第一期定投。
        </p>
        <p
          v-else-if="!filteredPlans.length"
          class="sim-empty"
        >
          没有符合条件的定投计划，可调整搜索关键词或计划状态后查看。
        </p>
        <div class="sim-position-list">
          <article
            v-for="plan in pagedPlans"
            :key="plan.planId"
            class="sim-position-card"
          >
            <header><div><h3>{{ plan.fundName }}</h3><p>{{ plan.fundCode }} · {{ planFrequency(plan) }}投入 {{ simMoney(plan.amount) }} 元</p></div><span class="sim-badge">{{ planLabels[plan.status] }}</span></header><p>{{ plan.status === 'ACTIVE' ? `下一期 ${plan.executionDate} 上午 10:00` : plan.status === 'PAUSED' ? '已暂停，恢复后从下一期继续' : '计划已结束，交易和持仓保留' }}</p><p>已生成 {{ plan.orderedPeriods }} 期 · 已确认投入 {{ simMoney(plan.investedAmount) }} 元{{ plan.endDate ? ` · 截止 ${plan.endDate}` : '' }}{{ plan.maxPeriods ? ` · 共 ${plan.maxPeriods} 期` : '' }}</p><div class="sim-actions">
              <template v-if="canPlan && plan.status !== 'ENDED'">
                <button
                  class="secondary-button"
                  type="button"
                  :disabled="busy"
                  @click="editPlan(plan)"
                >
                  修改
                </button><button
                  class="secondary-button"
                  type="button"
                  :disabled="busy"
                  @click="act(plan, plan.status === 'ACTIVE' ? 'PAUSE' : 'RESUME')"
                >
                  {{ plan.status === 'ACTIVE' ? '暂停' : '恢复' }}
                </button><button
                  class="secondary-button"
                  type="button"
                  :disabled="busy"
                  @click="act(plan, 'END')"
                >
                  结束计划
                </button>
              </template><button
                class="secondary-button"
                type="button"
                @click="viewPeriods(plan)"
              >
                执行记录
              </button>
            </div>
            <div
              v-if="endingPlan === plan.planId"
              class="notice-banner"
              role="alert"
            >
              <p>结束这个定投计划？已有持仓和已生成买单会保留，以后继续定投需新建计划。</p>
              <div class="sim-actions">
                <button
                  class="primary-button"
                  type="button"
                  :disabled="busy"
                  @click="act(plan, 'END')"
                >
                  确认结束
                </button>
                <button
                  class="secondary-button"
                  type="button"
                  :disabled="busy"
                  @click="endingPlan = null"
                >
                  继续保留
                </button>
              </div>
            </div>
          </article>
        </div>
        <ListPagination
          v-if="filteredPlans.length > 0"
          :page="planPage"
          :page-size="planPageSize"
          :total="filteredPlans.length"
          :loading="loading"
          label="定投计划分页"
          @change="changePlanPage"
        />
        <section
          v-if="periodPlan"
          class="sim-detail-panel"
          aria-label="定投执行记录"
        >
          <div class="sim-section-header">
            <h2>{{ periodPlan.fundName }} · 执行记录</h2><button
              class="secondary-button"
              type="button"
              @click="periodPlan = null"
            >
              收起
            </button>
          </div><p v-if="!periods">
            正在加载…
          </p><p v-else-if="!periods.items.length">
            尚未到第一期执行时间。
          </p><ul
            v-else
            class="sim-record-list"
          >
            <li
              v-for="item in periods.items"
              :key="item.executionId"
            >
              <strong>{{ item.scheduledDate }} → {{ item.executionDate }}</strong><span>{{ item.status === 'ORDERED' ? '已生成买单' : item.status === 'MISSED' ? '错过执行' : '已跳过' }}</span><p>{{ item.message }}</p>
            </li>
          </ul><ListPagination
            v-if="periods && periodPlan && periods.totalCount > 0"
            :page="periodPage"
            :page-size="periodPageSize"
            :total="periods.totalCount"
            :loading="periodsLoading"
            label="定投执行记录分页"
            @change="(value, size) => { periodPageSize = size; viewPeriods(periodPlan!, value) }"
          />
        </section>
      </template>

      <template v-else-if="section === 'orders'">
        <div class="sim-section-header">
          <h2>交易记录</h2><label>记录类型 <select v-model="recordMode"><option value="orders">买卖订单</option><option value="ledger">账务与分红变动</option></select></label>
        </div>
        <template v-if="recordMode === 'orders'">
          <p v-if="!orders">
            正在加载…
          </p><p
            v-else-if="!orders.items.length"
            class="sim-empty"
          >
            还没有交易记录。
          </p><div
            v-else
            class="sim-record-list"
          >
            <article
              v-for="order in orders.items"
              :key="order.orderId"
            >
              <header><strong>{{ order.fundName }}</strong><span class="sim-badge">{{ orderLabels[order.status] }}</span></header><p>{{ order.sourceKind === 'RECURRING' ? '定投买入' : order.side === 'BUY' ? '手动买入' : '卖出' }} · {{ order.side === 'BUY' ? `${simMoney(order.amount)} 元` : `${simShares(order.shares ?? 0)} 份` }}</p><p class="sim-muted">
                提交 {{ simTime(order.createdAt) }} · 净值归属 {{ order.tradeDate }} · 最早确认 {{ order.eligibleDate }}
              </p><p v-if="order.execution">
                确认 {{ simShares(order.execution.shares) }} 份 · 成交净值 {{ order.execution.unitNav }} · {{ order.side === 'SELL' ? '卖出收入' : '投入' }} {{ simMoney(order.execution.netAmount ?? order.execution.grossAmount) }} 元{{ order.execution.fee != null ? ` · 费用 ${simMoney(order.execution.fee)} 元` : '' }}{{ order.side === 'SELL' ? ` · 已实现收益 ${simMoney(order.execution.realizedGain)} 元` : '' }}
              </p><p v-if="order.status === 'PENDING'">
                {{ Date.now() < Date.parse(`${order.eligibleDate}T00:00:00+08:00`) ? '等待确认日期。' : '等待对应净值、分红核验及后台确认。' }}
              </p><details>
                <summary>订单编号及确认时间</summary><p class="sim-break">
                  {{ order.orderId }}
                </p><p>{{ simTime(order.confirmedAt) }}</p>
              </details><button
                v-if="canWrite && cancellable(order)"
                class="secondary-button"
                type="button"
                :disabled="busy"
                @click="cancel(order)"
              >
                撤销订单
              </button>
            </article>
          </div><ListPagination
            v-if="orders && orders.totalCount > 0"
            :page="orderPage"
            :page-size="orderPageSize"
            :total="orders.totalCount"
            :loading="detailsLoading || busy"
            label="交易记录分页"
            @change="(value, size) => { orderPageSize = size; orderPage = value }"
          />
        </template>
        <template v-else>
          <p v-if="!ledger">
            正在加载…
          </p><p
            v-else-if="!ledger.items.length"
            class="sim-empty"
          >
            还没有账务变动。
          </p><ul
            v-else
            class="sim-record-list"
          >
            <li
              v-for="entry in ledger.items"
              :key="entry.entryId"
            >
              <strong>{{ ledgerLabels[entry.entryType] ?? entry.entryType }} · {{ entry.fundCode }}</strong><span>{{ simTime(entry.createdAt) }}</span><p v-if="entry.entryType.startsWith('DIVIDEND')">
                分红 {{ simMoney(entry.payload.amount as string) }} 元 · 除息 {{ entry.payload.exDate }} · 派息 {{ entry.payload.payDate }}
              </p><p v-else-if="entry.entryType === 'NAV_CORRECTION'">
                净值已更正，保留旧版本，并已重新核对份额、成本及历史收益。
              </p><p v-else-if="entry.payload.message">
                {{ entry.payload.message }}
              </p>
            </li>
          </ul><ListPagination
            v-if="ledger && ledger.totalCount > 0"
            :page="ledgerPage"
            :page-size="ledgerPageSize"
            :total="ledger.totalCount"
            :loading="detailsLoading"
            label="资金流水分页"
            @change="(value, size) => { ledgerPageSize = size; ledgerPage = value }"
          />
        </template>
      </template>
    </template>
    <HoldingManagementDrawer
      v-if="managedPosition"
      :key="managedPosition.fundCode"
      :position="managedPosition"
      :plan="planFor(managedPosition.fundCode) ?? null"
      :initial-report="adviceByFund.get(managedPosition.fundCode) ?? null"
      :can-write="canWrite"
      :can-plan="canPlan"
      @close="managedCode = ''"
      @trade="openManagedTrade"
    />
    <SimulationFundPicker
      v-if="picker"
      @close="picker = false"
      @select="picked"
    />
    <SimulationTradeDialog
      v-if="trade"
      :fund-code="trade.fundCode"
      :mode="trade.mode"
      :plan="trade.plan"
      @close="trade = null"
      @saved="saved"
    />
  </section>
</template>

<style scoped>
.holdings-results-panel { margin-top: 22px; }
.holdings-list-header { margin: 0 0 20px; }
.holdings-table-scroll { width: 100%; max-width: 100%; overflow-x: auto; overscroll-behavior-x: contain; border-radius: 7px; }
.holdings-table { width: 100%; min-width: 900px; border-collapse: collapse; table-layout: fixed; text-align: left; }
.holdings-table thead th { padding: 13px 10px; background: #f3f6f0; color: var(--ui-muted); font-size: 12px; font-weight: 500; }
.holdings-table thead th:first-child { width: 28%; }
.holdings-table thead th:nth-child(2) { width: 12%; }
.holdings-table thead th:nth-child(3) { width: 15%; }
.holdings-table thead th:nth-child(4) { width: 17%; }
.holdings-table thead th:nth-child(5) { width: 13%; }
.holdings-table thead th:nth-child(6) { width: 15%; }
.holdings-table tbody th, .holdings-table tbody td { padding: 18px 10px; border-bottom: 1px solid #e4ebe0; vertical-align: middle; font-size: 14px; font-weight: 400; }
.holdings-table tbody th { background: #fff; color: var(--ui-ink); text-align: left; }
.holdings-table tbody tr:not(.holding-metadata-row) :is(th,td) { border-bottom: 0; }
.holding-fund-heading { display: flex; align-items: center; flex-wrap: nowrap; gap: 8px; min-width: 0; }
.holding-fund-heading > span:first-child { flex: 0 1 auto; min-width: 0; overflow: hidden; font-size: 16px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.holding-fund-heading .sim-badge { flex: none; }
.holding-fund-meta { margin: 8px 0 0; overflow: hidden; color: var(--ui-muted); font-size: 12px; font-weight: 400; line-height: 1.7; text-overflow: ellipsis; white-space: nowrap; }
.holdings-number { text-align: right; font-variant-numeric: tabular-nums; }
.holdings-number small { display: block; margin-top: 6px; color: var(--ui-muted); font-size: 12px; }
.holding-manage-button { min-height: 38px; padding: 8px 10px; font-size: 13px; white-space: nowrap; }
.holding-metadata-row td { padding-top: 0; }
.holding-metadata { margin: 0; color: var(--ui-muted); font-size: 12px; line-height: 1.8; }
.holding-inline-notice { margin: 0 0 8px; color: #80632d; font-size: 12px; line-height: 1.8; }
.holdings-table tbody tr:last-child td { border-bottom: 0; }
@media (max-width: 720px) {
  .holdings-results-panel { margin-top: 18px; }
  .holding-manage-button { min-height: 44px; }
}
</style>
