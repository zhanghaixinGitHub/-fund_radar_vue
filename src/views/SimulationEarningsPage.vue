<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSimEarnings, getSimEarningsDetails, getSimEarningsFunds } from '@/api/simulation'
import { ApiRequestError } from '@/api/http'
import SimulationPerformanceChart from '@/components/SimulationPerformanceChart.vue'
import type { SimEarnings, SimEarningsDetail, SimEarningsFund, SimPage } from '@/types/simulation'
import { earningsFailureMessage, earningsMoney, earningsReturnPath, earningsStatus } from '@/utils/simulationEarnings'
import { shanghaiDate, simMoney, simTone } from '@/utils/simulation'

const route = useRoute()
const router = useRouter()
const result = ref<SimEarnings | null>(null)
const loading = ref(false)
const error = ref('')
const keyword = ref('')
const matches = ref<SimPage<SimEarningsFund> | null>(null)
const searching = ref(false)
const searchError = ref('')
const expanded = ref('')
const details = ref<SimPage<SimEarningsDetail> | null>(null)
const detailLoading = ref(false)
const detailError = ref('')
const showCurve = ref(false)
const ranges = [{ value: 'MONTH', label: '近一个月' }, { value: 'QUARTER', label: '近三个月' },
  { value: 'YEAR', label: '今年' }, { value: 'ALL', label: '全部' }, { value: 'CUSTOM', label: '自选日期' }]
const range = computed(() => ranges.find(r => r.value === route.query.range)?.value ?? 'MONTH')
const code = computed(() => typeof route.query.fundCode === 'string' ? route.query.fundCode : '')
const start = ref(String(route.query.startDate ?? shanghaiDate(-29)))
const end = ref(String(route.query.endDate ?? shanghaiDate()))
const page = computed(() => Math.max(1, Math.min(100000, Number(route.query.page) || 1)))
const totalPages = computed(() => Math.max(1, Math.ceil((result.value?.days.totalCount ?? 0) / 20)))
const returnTarget = computed(() => earningsReturnPath(route.query.from))
let generation = 0
let searchGeneration = 0
let detailGeneration = 0
let alive = true

/** 本地排障只记录状态和业务码；现有 ApiRequestError 没有 requestId，不能猜测字段或打印完整错误/账户响应。 */
function diagnoseRequest(scope: 'earnings' | 'fund-search' | 'day-details', reason: unknown) {
  if (import.meta.env.DEV && reason instanceof ApiRequestError) {
    globalThis.console.warn(`SimulationEarningsPage.${scope} >>> status=${reason.status}, code=${reason.code}`)
  }
}
function failureMessage(scope: 'earnings' | 'fund-search' | 'day-details', reason: unknown) {
  return earningsFailureMessage(reason instanceof ApiRequestError ? reason.status : null,
    reason instanceof ApiRequestError ? reason.code : null, scope)
}

/** 路由保存筛选与页码；请求序号阻止快速切换范围后旧账户/基金数据覆盖新页面。 */
async function load() {
  const current = ++generation
  ++detailGeneration
  result.value = null; expanded.value = ''; details.value = null; detailError.value = ''
  loading.value = true; error.value = ''
  const params = new globalThis.URLSearchParams({ range: range.value, page: String(page.value), pageSize: '20' })
  if (code.value) params.set('fundCode', code.value)
  if (range.value === 'CUSTOM') {
    params.set('startDate', String(route.query.startDate ?? start.value))
    params.set('endDate', String(route.query.endDate ?? end.value))
  }
  try {
    const data = await getSimEarnings(params)
    if (!alive || generation !== current) return
    result.value = data
    if (data.days.totalCount && page.value > totalPages.value) await navigate({ page: String(totalPages.value) })
  } catch (reason) {
    diagnoseRequest('earnings', reason)
    if (alive && generation === current) error.value = failureMessage('earnings', reason)
  } finally { if (alive && generation === current) loading.value = false }
}
function navigate(query: Record<string, string | undefined>) {
  return router.push({ name: 'portfolio-earnings', query: { ...route.query, ...query } })
}
function chooseFund(value: string) {
  ++searchGeneration; searching.value = false; matches.value = null; keyword.value = ''; searchError.value = ''
  void navigate({ fundCode: value || undefined, page: undefined })
}
async function search(pageNumber = 1) {
  const current = ++searchGeneration
  searching.value = true; searchError.value = ''
  try {
    const data = await getSimEarningsFunds(keyword.value.trim(), pageNumber)
    if (alive && current === searchGeneration) matches.value = data
  } catch (reason) {
    diagnoseRequest('fund-search', reason)
    if (alive && current === searchGeneration) searchError.value = failureMessage('fund-search', reason)
  }
  finally { if (alive && current === searchGeneration) searching.value = false }
}
function changeRange(value: string) {
  void navigate({ range: value, page: undefined, startDate: value === 'CUSTOM' ? start.value : undefined, endDate: value === 'CUSTOM' ? end.value : undefined })
}
function applyDates() {
  if (!start.value || !end.value || start.value > end.value || end.value > shanghaiDate()) {
    error.value = '请选择不晚于今天且起始不晚于结束的日期。'; return
  }
  void navigate({ range: 'CUSTOM', startDate: start.value, endDate: end.value, page: undefined })
}
/** 一次只展开一个日期，基金构成单独分页；切换日期时丢弃上一日期尚未完成的响应。 */
async function expand(date: string, pageNumber?: number) {
  if (expanded.value === date && pageNumber === undefined && details.value) {
    expanded.value = ''; details.value = null; ++detailGeneration; return
  }
  const current = ++detailGeneration
  expanded.value = date; details.value = null; detailLoading.value = true; detailError.value = ''
  try {
    const data = await getSimEarningsDetails(date, pageNumber ?? 1)
    if (alive && current === detailGeneration) details.value = data
  } catch (reason) {
    diagnoseRequest('day-details', reason)
    if (alive && current === detailGeneration) detailError.value = failureMessage('day-details', reason)
  }
  finally { if (alive && current === detailGeneration) detailLoading.value = false }
}
watch(() => route.fullPath, () => {
  start.value = String(route.query.startDate ?? start.value); end.value = String(route.query.endDate ?? end.value)
  void load()
}, { immediate: true })
onBeforeUnmount(() => { alive = false; ++generation; ++searchGeneration; ++detailGeneration })
</script>

<template>
  <section
    class="sim-page earnings-page"
    aria-labelledby="earnings-title"
  >
    <header class="sim-page-header">
      <div>
        <p class="eyebrow">
          我的持仓 · 模拟账户
        </p><h1 id="earnings-title">
          收益明细
        </h1><p class="earnings-subtitle">
          按日期查看每天的盈亏，已清仓基金的历史也会保留。
        </p>
      </div>
      <RouterLink
        class="secondary-button"
        :to="returnTarget"
      >
        返回持仓
      </RouterLink>
    </header>

    <section
      class="earnings-filters"
      aria-label="收益查询条件"
    >
      <form
        class="earnings-search"
        @submit.prevent="search()"
      >
        <label for="earnings-search">查找本人基金</label>
        <div class="search-row">
          <input
            id="earnings-search"
            v-model="keyword"
            maxlength="50"
            type="search"
            placeholder="基金名称或代码，包含已清仓基金"
          ><button
            class="primary-button"
            type="submit"
            :disabled="searching"
          >
            {{ searching ? '查询中…' : '查询' }}
          </button><button
            v-if="code"
            class="secondary-button"
            type="button"
            @click="chooseFund('')"
          >
            全部基金
          </button>
        </div>
      </form>
      <p
        v-if="searchError"
        class="error-message"
        role="alert"
      >
        {{ searchError }}
      </p>
      <div
        v-if="matches"
        class="earnings-matches"
        aria-label="基金搜索结果"
      >
        <div class="sim-section-header">
          <span>本人基金 · {{ matches.totalCount }} 只</span><button
            type="button"
            class="text-button"
            @click="matches = null"
          >
            收起
          </button>
        </div>
        <p v-if="!matches.items.length">
          没有匹配的本人基金，请调整名称或代码。
        </p>
        <ul>
          <li
            v-for="fund in matches.items"
            :key="fund.fundCode"
          >
            <button
              type="button"
              @click="chooseFund(fund.fundCode)"
            >
              <span>{{ fund.fundName }} <small>{{ fund.fundCode }}</small></span><span>{{ fund.closed ? '已清仓' : '查看收益' }} ›</span>
            </button>
          </li>
        </ul>
        <div
          v-if="matches.totalCount > matches.pageSize"
          class="sim-pagination"
        >
          <button
            class="secondary-button"
            :disabled="searching || matches.page <= 1"
            @click="search(matches.page - 1)"
          >
            上一页
          </button><span>第 {{ matches.page }} 页</span><button
            class="secondary-button"
            :disabled="searching || matches.page * matches.pageSize >= matches.totalCount"
            @click="search(matches.page + 1)"
          >
            下一页
          </button>
        </div>
      </div>
      <div
        class="earnings-range"
        role="group"
        aria-label="时间范围"
      >
        <button
          v-for="item in ranges"
          :key="item.value"
          type="button"
          :aria-pressed="range === item.value"
          :class="{ active: range === item.value }"
          @click="changeRange(item.value)"
        >
          {{ item.label }}
        </button>
      </div>
      <form
        v-if="range === 'CUSTOM'"
        class="earnings-dates"
        @submit.prevent="applyDates"
      >
        <label>起始日期<input
          v-model="start"
          type="date"
          :max="end || shanghaiDate()"
          required
        ></label><label>结束日期<input
          v-model="end"
          type="date"
          :min="start"
          :max="shanghaiDate()"
          required
        ></label><button
          class="secondary-button"
          type="submit"
        >
          应用日期
        </button>
      </form>
      <p
        v-if="range === 'ALL'"
        class="sim-muted"
      >
        全部历史单次支持十年；超过十年请使用自选日期分段查看，不会截断后冒充全部。
      </p>
    </section>

    <p
      v-if="error"
      class="error-message"
      role="alert"
    >
      {{ error }} <button
        type="button"
        class="text-button"
        @click="load"
      >
        重试
      </button>
    </p>
    <p
      v-if="loading"
      class="state-message"
      role="status"
    >
      正在读取收益明细…
    </p>
    <template v-if="result">
      <section
        class="earnings-summary"
        aria-label="所选期间收益概况"
      >
        <div>
          <h2>{{ result.fund?.fundName ?? '全部基金' }}</h2><p class="sim-muted">
            {{ result.fund ? `${result.fund.fundCode} · ${result.fund.closed ? '已清仓' : '模拟持仓'}` : '同一天的基金收益合计' }}
          </p><p class="earnings-period">
            {{ result.startDate }} — {{ result.endDate }}
          </p>
          <template v-if="result.fund">
            <p class="sim-muted">
              {{ result.fund.navDate ? `市值 ${simMoney(result.fund.marketValue)} 元 · 截至 ${result.fund.navDate}` : '首笔交易尚待确认' }}{{ result.fund.reviewRequired ? ' · 当前估值待核对' : '' }}
            </p><div class="sim-actions">
              <RouterLink :to="{ name: 'portfolio-snapshot', query: { section: 'orders', fundCode: code } }">
                交易记录 ›
              </RouterLink><RouterLink :to="{ name: 'portfolio-snapshot', query: { section: 'plans', fundCode: code } }">
                定投计划 ›
              </RouterLink>
            </div>
          </template>
        </div>
        <div class="earnings-total">
          <span>所选期间收益（元）</span><strong :class="simTone(result.periodGain)">{{ earningsMoney(result.periodGain) }}</strong><small v-if="!result.complete && result.incompleteDays">{{ result.incompleteDays }} 天数据未完整，完整合计待更新<span v-if="result.knownGain !== null">；已知部分 {{ earningsMoney(result.knownGain) }} 元</span></small><small v-else-if="result.complete">按完整区间计算，包含所有分页</small><small v-else>当前范围暂无收益记录</small>
        </div>
      </section>

      <section
        aria-labelledby="earnings-daily-title"
        class="earnings-daily"
      >
        <div class="sim-section-header">
          <h2 id="earnings-daily-title">
            每日收益
          </h2><span class="sim-muted">最近日期在前 · 单位：元</span>
        </div>
        <p
          v-if="!result.days.items.length"
          class="sim-empty"
        >
          所选期间暂无收益记录。可调整日期，首笔交易确认后将显示每日盈亏。
        </p>
        <div
          v-else
          class="earnings-table-wrap"
        >
          <table class="earnings-table">
            <thead>
              <tr>
                <th scope="col">
                  日期
                </th><th
                  scope="col"
                  class="number"
                >
                  当日收益
                </th><th
                  scope="col"
                  class="number"
                >
                  截至当日累计
                </th><th scope="col">
                  数据情况
                </th><th
                  v-if="!code"
                  scope="col"
                >
                  <span class="earnings-visually-hidden">基金构成</span>
                </th>
              </tr>
            </thead><tbody>
              <template
                v-for="day in result.days.items"
                :key="day.date"
              >
                <tr>
                  <th scope="row">
                    {{ day.date }}
                  </th><td
                    class="number"
                    :class="simTone(day.dailyGain)"
                  >
                    {{ earningsMoney(day.dailyGain) }}
                  </td><td
                    class="number"
                    :class="simTone(day.cumulativeGain)"
                  >
                    {{ earningsMoney(day.cumulativeGain) }}
                  </td><td><span :class="{ 'earnings-pending': !['COMPLETE', 'NON_TRADING'].includes(day.status) }">{{ earningsStatus(day.status) }}</span><small v-if="day.status === 'PARTIAL'">{{ day.updatedFunds }}/{{ day.expectedFunds }} 只完整<span v-if="day.knownGain !== null"> · 已知 {{ earningsMoney(day.knownGain) }}</span></small></td><td v-if="!code">
                    <button
                      type="button"
                      class="text-button"
                      :aria-expanded="expanded === day.date"
                      :aria-label="`${day.date}基金收益构成`"
                      @click="expand(day.date)"
                    >
                      {{ expanded === day.date ? '收起' : '查看构成' }}
                    </button>
                  </td>
                </tr>
                <tr
                  v-if="expanded === day.date && !code"
                  class="earnings-expanded"
                >
                  <td colspan="5">
                    <p
                      v-if="detailLoading"
                      role="status"
                    >
                      正在读取当天基金构成…
                    </p><p
                      v-if="detailError"
                      class="error-message"
                      role="alert"
                    >
                      {{ detailError }} <button
                        class="text-button"
                        @click="expand(day.date)"
                      >
                        重试
                      </button>
                    </p><ul v-if="details">
                      <li
                        v-for="fund in details.items"
                        :key="fund.fundCode"
                      >
                        <RouterLink :to="{ name: 'portfolio-earnings', query: { ...route.query, fundCode: fund.fundCode, page: undefined } }">
                          {{ fund.fundName }} <small>{{ fund.fundCode }}</small>
                        </RouterLink><span :class="simTone(fund.dailyGain)">{{ earningsMoney(fund.dailyGain) }}</span><small>{{ earningsStatus(fund.status) }}</small>
                      </li>
                    </ul><nav
                      v-if="details && details.totalCount > details.pageSize"
                      class="sim-pagination"
                      aria-label="当天基金构成分页"
                    >
                      <button
                        class="secondary-button"
                        :disabled="detailLoading || details.page <= 1"
                        @click="expand(day.date, details.page - 1)"
                      >
                        上一页
                      </button><span>第 {{ details.page }} 页</span><button
                        class="secondary-button"
                        :disabled="detailLoading || details.page * details.pageSize >= details.totalCount"
                        @click="expand(day.date, details.page + 1)"
                      >
                        下一页
                      </button>
                    </nav>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <nav
          v-if="totalPages > 1"
          class="sim-pagination"
          aria-label="收益日期分页"
        >
          <button
            class="secondary-button"
            :disabled="loading || page <= 1"
            @click="navigate({ page: String(page - 1) })"
          >
            上一页
          </button><span>第 {{ page }} / {{ totalPages }} 页</span><button
            class="secondary-button"
            :disabled="loading || page >= totalPages"
            @click="navigate({ page: String(page + 1) })"
          >
            下一页
          </button>
        </nav>
      </section>
      <section
        v-if="result.curve.length"
        class="earnings-curve"
      >
        <button
          type="button"
          class="text-button"
          :aria-expanded="showCurve"
          @click="showCurve = !showCurve"
        >
          {{ showCurve ? '收起' : '查看' }}累计收益走势 {{ showCurve ? '⌃' : '⌄' }}
        </button><template v-if="showCurve">
          <p class="sim-muted">
            截至各日的累计收益；缺少数据处留空。非所选期间内从零开始累加。
          </p><SimulationPerformanceChart :points="result.curve" />
        </template>
      </section>
    </template>
    <p class="earnings-footnote">
      这里是模拟收益，不代表真实账户盈利。投入与收回的本金不算收益；包含卖出盈亏、现金分红及原交易规则计入的费用。净值延迟或历史缺失时保持未知，非交易日不记作零收益。
    </p>
  </section>
</template>

<style scoped>
.earnings-page { max-width: 1280px; margin: 0 auto; }
.earnings-page h1 { margin: 4px 0 6px; }
.earnings-page > .sim-page-header { margin-bottom: 16px; }
.earnings-subtitle { color: #647b72; margin: 0; font-size: 14px; }
.earnings-filters { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 14px 20px; background: #fff; border: 1px solid #dfe8e3; border-radius: 10px; padding: 16px 20px; }
.earnings-search { flex: 1 1 320px; }
.earnings-filters > .error-message, .earnings-matches, .earnings-dates, .earnings-filters > .sim-muted { flex-basis: 100%; }
.earnings-search label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; }
.earnings-search input { min-width: 140px; flex: 1; }
.earnings-range { display: flex; flex-wrap: wrap; gap: 6px; }
.earnings-range button { padding: 8px 12px; border: 1px solid transparent; border-radius: 6px; background: #f3f7f5; color: #48665b; min-height: 40px; cursor: pointer; }
.earnings-range .active { border-color: #0f766e; background: #e7f3ef; color: #0f766e; font-weight: 600; }
.earnings-dates { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; margin-top: 16px; }
.earnings-dates label { display: grid; gap: 5px; font-size: 13px; }
.earnings-summary { display: flex; justify-content: space-between; gap: 24px; margin: 18px 0; padding: 0 0 16px; border-bottom: 1px solid #dfe8e3; }
.earnings-summary p { margin: 6px 0; }
.earnings-period { color: #48665b; font-size: 14px; margin: 10px 0; }
.earnings-summary .sim-actions { font-size: 13px; gap: 20px; }
.earnings-total { max-width: 390px; text-align: right; }
.earnings-total > span { font-size: 13px; color: #647b72; }
.earnings-total strong { display: block; font-size: 32px; font-variant-numeric: tabular-nums; font-weight: 600; margin: 8px 0; }
.earnings-total small { color: #647b72; line-height: 1.8; }
.earnings-table-wrap { overflow-x: auto; border: 1px solid #dfe8e3; border-radius: 9px; }
.earnings-table { width: 100%; min-width: 610px; border-collapse: collapse; background: #fff; font-size: 14px; }
.earnings-table th, .earnings-table td { padding: 14px 18px; border-bottom: 1px solid #edf1ee; text-align: left; }
.earnings-table thead { background: #f8faf9; color: #647b72; font-size: 12px; }
.earnings-table tbody th { font-weight: 500; white-space: nowrap; }
.earnings-table .number { text-align: right; font-variant-numeric: tabular-nums; }
.earnings-table small { display: block; color: #647b72; font-size: 11px; margin-top: 4px; }
.earnings-pending { color: #855710; }
.earnings-expanded { background: #f6faf8; }
.earnings-expanded ul, .earnings-matches ul { list-style: none; margin: 0; padding: 0; }
.earnings-expanded li { display: grid; grid-template-columns: minmax(150px, 1fr) 110px 130px; gap: 18px; align-items: center; padding: 10px 0; }
.earnings-expanded li > span { text-align: right; font-variant-numeric: tabular-nums; }
.earnings-matches { border: 1px solid #c8ded4; border-radius: 8px; padding: 0 16px 14px; margin-top: 12px; }
.earnings-matches .sim-section-header { margin: 10px 0; font-size: 13px; }
.earnings-matches li button { border: 0; border-top: 1px solid #edf1ee; background: transparent; padding: 12px 0; width: 100%; display: flex; justify-content: space-between; text-align: left; gap: 12px; color: #203a34; cursor: pointer; }
.earnings-matches small { color: #647b72; }
.earnings-curve { padding: 24px 0 0; }
.earnings-footnote { margin: 28px 0 10px; max-width: 900px; color: #647b72; font-size: 12px; line-height: 1.9; }
.earnings-visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
button:focus-visible, a:focus-visible { outline: 2px solid #0f766e; outline-offset: 3px; }
@media (max-width: 700px) { .earnings-summary { flex-direction: column; gap: 16px; }.earnings-total { text-align: left; max-width: none; }.earnings-filters { padding: 16px; }.search-row { flex-wrap: wrap; }.earnings-range button { padding: 8px 12px; }.earnings-table th, .earnings-table td { padding: 12px; } }
</style>
