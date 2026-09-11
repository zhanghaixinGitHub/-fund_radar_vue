<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { getLatestAdvice } from '@/api/advice'
import PortfolioAdviceCard from '@/components/PortfolioAdviceCard.vue'
import type { AdviceSummary } from '@/types/advice'
import { rememberPortfolioScroll, takePortfolioScroll } from '@/utils/advice'
import { cancelSimOrder, changeSimPlan, getSimLedger, getSimOrders, getSimOverview, getSimPerformance, getSimPeriods, getSimPlans } from '@/api/simulation'
import SimulationTradeDialog from '@/components/SimulationTradeDialog.vue'
import SimulationFundPicker from '@/components/SimulationFundPicker.vue'
import SimulationPerformanceChart from '@/components/SimulationPerformanceChart.vue'
import { usePageNavigation } from '@/composables/usePageNavigation'
import { useAuthStore } from '@/stores/auth'
import type { SimDaily, SimLedger, SimOrder, SimOverview, SimPage, SimPeriod, SimPlan } from '@/types/simulation'
import { planFrequency, shanghaiDate, simMoney, simPercent, simShares, simTime, simTone } from '@/utils/simulation'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { section, sectionLabel, sectionTarget } = usePageNavigation()
const overview = ref<SimOverview | null>(null)
const advice = ref<AdviceSummary[]>([])
const adviceError = ref('')
const adviceByFund = computed(() => new Map(advice.value.map(item => [item.fundCode, item])))
const plans = ref<SimPlan[]>([])
const orders = ref<SimPage<SimOrder> | null>(null)
const ledger = ref<SimPage<SimLedger> | null>(null)
const periods = ref<SimPage<SimPeriod> | null>(null)
const periodPlan = ref<SimPlan | null>(null)
const history = ref<SimDaily[]>([])
const loading = ref(false)
const error = ref('')
const message = ref('')
const detailError = ref('')
const busy = ref(false)
const endingPlan = ref<string | null>(null)
const picker = ref(false)
const pickerMode = ref<'BUY' | 'PLAN'>('BUY')
const trade = ref<{ fundCode: string; mode: 'BUY' | 'SELL' | 'PLAN'; plan?: SimPlan } | null>(null)
const showHistory = ref(false)
const orderPage = ref(1)
const ledgerPage = ref(1)
const periodPage = ref(1)
const recordMode = ref<'orders' | 'ledger'>('orders')
const days = ref(365)
const selectedCode = computed(() => /^\d{6}$/.test(String(route.query.fundCode ?? '')) ? String(route.query.fundCode) : '')
const selectedPosition = computed(() => overview.value?.positions.find(p => p.fundCode === selectedCode.value) ?? null)
const positions = computed(() => (overview.value?.positions ?? []).filter(p => (!selectedCode.value || p.fundCode === selectedCode.value) &&
  (showHistory.value || selectedCode.value || Number(p.shares) > 0 || (Number(p.totalBuy) === 0 && Number(p.totalSell) === 0))))
const canWrite = computed(() => auth.hasPermission('SIM_PORTFOLIO_SELF_WRITE'))
const canPlan = computed(() => auth.hasPermission('SIM_PLAN_SELF_WRITE'))
const jobStale = computed(() => !overview.value?.job?.completedAt || Date.now() - Date.parse(overview.value.job.completedAt) > 5 * 60_000)
const planLabels = { ACTIVE: '执行中', PAUSED: '已暂停', ENDED: '已结束' }
const orderLabels = { PENDING: '待确认', CONFIRMED: '已确认', CANCELLED: '已撤销' }
const ledgerLabels: Record<string, string> = { ORDER_SUBMITTED: '提交交易', ORDER_CANCELLED: '撤销交易', BUY_CONFIRMED: '买入确认', SELL_CONFIRMED: '卖出确认', NAV_CORRECTION: '净值更正', DIVIDEND_RECEIVABLE: '应收分红', DIVIDEND_PAID: '分红派发', PLAN_SAVED: '保存定投', PLAN_PAUSED: '暂停定投', PLAN_ACTIVE: '恢复定投', PLAN_ENDED: '结束定投', PLAN_CALENDAR_PAUSED: '日历不足暂停' }
let alive = true
let loadGeneration = 0
let detailGeneration = 0
let polling: ReturnType<typeof globalThis.setInterval> | undefined

async function load(silent = false) {
  if (loading.value) return
  const current = ++loadGeneration
  if (!silent) loading.value = true
  error.value = ''
  try {
    // 建议读取失败不遮挡已有持仓和交易功能；批量读取避免每张卡片单独请求。
    const [result, planResult, adviceResult] = await Promise.all([
      getSimOverview(), getSimPlans(), getLatestAdvice().then(items => ({ items, error: '' })).catch(() => ({ items: null, error: '操作建议暂时无法读取，可进入详情重试。' })),
    ])
    if (!alive || current !== loadGeneration) return
    overview.value = result; plans.value = planResult
    if (adviceResult.items) advice.value = adviceResult.items
    adviceError.value = adviceResult.error
    await loadDetails()
  } catch (reason) { if (alive && current === loadGeneration) error.value = reason instanceof Error ? reason.message : '持仓加载失败。' }
  finally { if (alive && current === loadGeneration) loading.value = false }
}
async function loadDetails() {
  const current = ++detailGeneration
  detailError.value = ''
  const code = selectedCode.value || undefined
  try {
    if (section.value === 'orders') {
      if (recordMode.value === 'orders') {
        const result = await getSimOrders(orderPage.value, code)
        if (alive && current === detailGeneration) orders.value = result
      } else {
        const result = await getSimLedger(ledgerPage.value, code)
        if (alive && current === detailGeneration) ledger.value = result
      }
    } else if (section.value === 'holdings' && code) {
      const result = await getSimPerformance(code, shanghaiDate(-days.value), shanghaiDate())
      if (alive && current === detailGeneration) history.value = result
    }
  } catch (reason) { if (alive && current === detailGeneration) detailError.value = reason instanceof Error ? reason.message : '记录加载失败。' }
}
function selectCode(code: string) { void router.replace({ path: route.path, query: { ...route.query, fundCode: code || undefined } }) }
function openPicker(mode: 'BUY' | 'PLAN') { pickerMode.value = mode; picker.value = true }
function picked(code: string) { picker.value = false; trade.value = { fundCode: code, mode: pickerMode.value } }
function saved(value: string) { trade.value = null; message.value = value; void load() }
function editPlan(plan: SimPlan) { trade.value = { fundCode: plan.fundCode, mode: 'PLAN', plan } }
function planFor(code: string) { return plans.value.find(p => p.fundCode === code && p.status !== 'ENDED') }
function openPlan(code: string) { const plan = planFor(code); trade.value = { fundCode: code, mode: 'PLAN', ...(plan ? { plan } : {}) } }
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
  periodPlan.value = plan; periodPage.value = page; periods.value = null; detailError.value = ''
  try {
    const result = await getSimPeriods(plan.planId, page)
    if (alive && periodPlan.value?.planId === plan.planId && periodPage.value === page) periods.value = result
  } catch (reason) { detailError.value = reason instanceof Error ? reason.message : '执行记录加载失败。' }
}
watch([section, selectedCode], () => {
  endingPlan.value = null
  orderPage.value = 1; ledgerPage.value = 1; history.value = []; orders.value = null; ledger.value = null; periodPlan.value = null
  void loadDetails()
})
watch([orderPage, ledgerPage, recordMode, days], () => void loadDetails())
onMounted(() => {
  void load().then(async () => {
    await nextTick()
    const top = takePortfolioScroll(route.fullPath)
    if (alive && top !== null) globalThis.scrollTo({ top })
  })
  polling = globalThis.setInterval(() => { if (globalThis.document.visibilityState === 'visible' && !busy.value && !trade.value) void load(true) }, 60_000)
})
onBeforeRouteLeave(to => { if (to.name === 'portfolio-advice') rememberPortfolioScroll(route.fullPath, globalThis.scrollY) })
onBeforeUnmount(() => { alive = false; loadGeneration++; detailGeneration++; globalThis.clearInterval(polling) })
</script>

<template>
  <section
    class="sim-page"
    aria-labelledby="sim-title"
  >
    <header class="sim-page-header">
      <div>
        <p class="eyebrow">
          我的持仓 · 模拟账户
        </p><h1 id="sim-title">
          {{ section === 'overview' ? '持仓总览' : sectionLabel }}
        </h1><p
          v-if="section === 'overview'"
          class="lead"
        >
          按真实净值更新，买入、定投和卖出均为模拟记录。
        </p>
      </div>
      <div class="sim-actions">
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
          <article><span>持仓市值（元）</span><strong>{{ simMoney(overview.marketValue) }}</strong><small>{{ overview.complete ? '按已公布净值计算' : '部分数据待核对，汇总含上次估值' }}</small></article>
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
        <div class="sim-status">
          <span :class="jobStale || overview.job?.status === 'FAILED' ? 'sim-warning' : ''">{{ jobStale ? '后台运行状态待确认' : overview.job?.message }}</span><span>最近完成：{{ simTime(overview.job?.completedAt) }}</span><RouterLink to="/portfolio/confirmed-snapshot">
            查看历史确认快照
          </RouterLink>
        </div>
        <details class="sim-rules">
          <summary>模拟规则与数据说明</summary><p>{{ overview.rules }}</p><p>未公布净值时保持待更新。新增投入不算收益，卖出和现金分红记录为转出，不模拟钱包余额。旧确认快照独立保存。全部卖出后累计收益及历史交易保留。</p>
        </details>
      </template>
      <label
        v-if="section !== 'overview' && (overview.positions.length || selectedCode)"
        class="sim-filter"
      >基金范围<select
        :value="selectedCode"
        @change="selectCode(($event.target as HTMLSelectElement).value)"
      ><option value="">全部基金</option><option
        v-for="p in overview.positions"
        :key="p.fundCode"
        :value="p.fundCode"
      >{{ p.fundName }} · {{ p.fundCode }}</option><option
        v-if="selectedCode && !selectedPosition"
        :value="selectedCode"
      >{{ selectedCode }}</option></select></label>
      <p
        v-if="detailError"
        class="error-message"
        role="alert"
      >
        {{ detailError }}
      </p>

      <template v-if="section === 'holdings'">
        <div class="sim-section-header">
          <h2>{{ selectedPosition?.fundName ?? '持仓明细' }}</h2><label class="sim-check"><input
            v-model="showHistory"
            type="checkbox"
          >显示已清仓基金</label>
        </div>
        <div
          v-if="!positions.length"
          class="sim-empty"
        >
          <h3>还没有{{ selectedCode ? '这只基金的' : '' }}模拟持仓</h3><p>从关注中选一只基金买入，或直接设置第一笔定投。</p><div class="sim-actions">
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
          class="sim-position-list"
        >
          <article
            v-for="p in positions"
            :key="p.fundCode"
            class="sim-position-card"
          >
            <header>
              <div>
                <button
                  class="sim-fund-link"
                  type="button"
                  @click="selectCode(p.fundCode)"
                >
                  {{ p.fundName }}
                </button><p>{{ p.fundCode }} · {{ p.navDate ? `净值 ${p.navDate} / ${p.unitNav}` : '等待首笔交易确认' }}</p>
              </div><span
                v-if="planFor(p.fundCode)"
                class="sim-badge"
              >定投{{ planLabels[planFor(p.fundCode)!.status] }}</span><span
                v-else-if="Number(p.shares) === 0 && Number(p.totalBuy) > 0"
                class="sim-badge"
              >已清仓</span>
            </header>
            <p
              v-if="p.issue"
              class="notice-banner"
              role="status"
            >
              {{ p.issue }} 当前显示上次有效估值。
            </p>
            <dl class="sim-position-values">
              <div><dt>市值</dt><dd>{{ simMoney(p.marketValue) }}</dd></div><div>
                <dt>持有收益 / 收益率</dt><dd :class="simTone(p.holdingGain)">
                  {{ simMoney(p.holdingGain) }} <small>{{ simPercent(p.holdingGainRate) }}</small>
                </dd>
              </div><div>
                <dt>最近一期收益 · {{ p.navDate ?? '待更新' }}</dt><dd :class="simTone(p.dailyGain)">
                  {{ simMoney(p.dailyGain) }}
                </dd>
              </div><div>
                <dt>累计收益</dt><dd :class="simTone(p.cumulativeGain)">
                  {{ simMoney(p.cumulativeGain) }}
                </dd>
              </div>
            </dl>
            <p class="sim-muted">
              持有 {{ simShares(p.shares) }} 份 · 可卖 {{ simShares(p.availableShares) }} 份 · 冻结 {{ simShares(p.frozenShares) }} 份 · 剩余成本 {{ simMoney(p.cost) }} 元
            </p>
            <PortfolioAdviceCard
              :fund-code="p.fundCode"
              :report="adviceByFund.get(p.fundCode)"
              :error="adviceError"
              :loading="loading && !advice.length"
            />
            <div class="sim-actions">
              <button
                v-if="canWrite"
                class="primary-button"
                type="button"
                :disabled="!!p.issue"
                @click="trade = { fundCode: p.fundCode, mode: 'BUY' }"
              >
                {{ Number(p.shares) > 0 ? '加仓' : '买入' }}
              </button><button
                v-if="canWrite"
                class="secondary-button"
                type="button"
                :disabled="!!p.issue || Number(p.availableShares) <= 0"
                @click="trade = { fundCode: p.fundCode, mode: 'SELL' }"
              >
                卖出
              </button><button
                v-if="canPlan"
                class="secondary-button"
                type="button"
                @click="openPlan(p.fundCode)"
              >
                {{ planFor(p.fundCode) ? '管理定投' : '设置定投' }}
              </button><button
                class="secondary-button"
                type="button"
                @click="router.replace({ path: route.path, query: { section: 'orders', fundCode: p.fundCode } })"
              >
                交易记录
              </button>
            </div>
          </article>
        </div>
        <section
          v-if="selectedPosition"
          class="sim-detail-panel"
          aria-label="基金收益详情"
        >
          <div class="sim-section-header">
            <h2>收益记录</h2><label>时间范围 <select v-model="days"><option :value="30">近一个月</option><option :value="90">近三个月</option><option :value="365">近一年</option><option :value="3650">全部（最多十年）</option></select></label>
          </div>
          <p>已实现收益 {{ simMoney(selectedPosition.realizedGain) }} 元 · 分红收益 {{ simMoney(selectedPosition.dividendGain) }} 元（应收 {{ simMoney(selectedPosition.receivableDividend) }} 元，已派 {{ simMoney(selectedPosition.paidDividend) }} 元）</p>
          <SimulationPerformanceChart :points="history" />
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
          v-if="!plans.length"
          class="sim-empty"
        >
          还没有定投计划。无需先买入，也可以直接设置第一期定投。
        </p>
        <div class="sim-position-list">
          <article
            v-for="plan in plans.filter(p => !selectedCode || p.fundCode === selectedCode)"
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
          </ul><nav
            v-if="periods && periods.totalCount > 20"
            class="sim-pagination"
            aria-label="定投记录分页"
          >
            <button
              class="secondary-button"
              type="button"
              :disabled="periodPage <= 1"
              @click="viewPeriods(periodPlan, periodPage - 1)"
            >
              上一页
            </button><span>{{ periodPage }}</span><button
              class="secondary-button"
              type="button"
              :disabled="periodPage * 20 >= periods.totalCount"
              @click="viewPeriods(periodPlan, periodPage + 1)"
            >
              下一页
            </button>
          </nav>
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
                确认 {{ simShares(order.execution.shares) }} 份 · 成交净值 {{ order.execution.unitNav }} · {{ order.side === 'SELL' ? '卖出收入' : '投入' }} {{ simMoney(order.execution.grossAmount) }} 元{{ order.side === 'SELL' ? ` · 已实现收益 ${simMoney(order.execution.realizedGain)} 元` : '' }}
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
          </div><nav
            v-if="orders && orders.totalCount > 20"
            class="sim-pagination"
            aria-label="买卖记录分页"
          >
            <button
              class="secondary-button"
              type="button"
              :disabled="orderPage <= 1"
              @click="orderPage--"
            >
              上一页
            </button><span>第 {{ orderPage }} 页</span><button
              class="secondary-button"
              type="button"
              :disabled="orderPage * 20 >= orders.totalCount"
              @click="orderPage++"
            >
              下一页
            </button>
          </nav>
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
                来源净值已更正，保留旧版本，并已重新核对份额、成本及历史收益。
              </p><p v-else-if="entry.payload.message">
                {{ entry.payload.message }}
              </p>
            </li>
          </ul><nav
            v-if="ledger && ledger.totalCount > 20"
            class="sim-pagination"
            aria-label="账务记录分页"
          >
            <button
              class="secondary-button"
              type="button"
              :disabled="ledgerPage <= 1"
              @click="ledgerPage--"
            >
              上一页
            </button><span>第 {{ ledgerPage }} 页</span><button
              class="secondary-button"
              type="button"
              :disabled="ledgerPage * 20 >= ledger.totalCount"
              @click="ledgerPage++"
            >
              下一页
            </button>
          </nav>
        </template>
      </template>
    </template>
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
