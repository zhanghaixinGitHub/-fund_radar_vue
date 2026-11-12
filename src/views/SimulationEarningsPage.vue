<script setup lang="ts">
import ListPagination from '@/components/ListPagination.vue'
import SimulationEarningsPanel from '@/components/SimulationEarningsPanel.vue'
import SimulationPerformanceChart from '@/components/SimulationPerformanceChart.vue'
import { normalizePageSize } from '@/utils/pagination'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSimEarnings, getSimEarningsDetails, getSimEarningsFunds } from '@/api/simulation'
import { ApiRequestError } from '@/api/http'
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
const showFundPicker = ref(false)
const selectedDate = ref('')
const details = ref<SimPage<SimEarningsDetail> | null>(null)
const detailLoading = ref(false)
const detailError = ref('')
const showCurve = ref(false)
const dateError = ref('')
const ranges = [{ value: 'MONTH', label: '近一个月' }, { value: 'QUARTER', label: '近三个月' },
  { value: 'YEAR', label: '今年' }, { value: 'ALL', label: '全部' }, { value: 'CUSTOM', label: '自选日期' }]
const range = computed(() => ranges.find(r => r.value === route.query.range)?.value ?? 'MONTH')
const customDatesOpen = ref(range.value === 'CUSTOM')
const code = computed(() => typeof route.query.fundCode === 'string' ? route.query.fundCode : '')
const start = ref(String(route.query.startDate ?? shanghaiDate(-29)))
const end = ref(String(route.query.endDate ?? shanghaiDate()))
const pageSize = computed(() => normalizePageSize(route.query.size))
const searchPageSize = ref(10)
const detailPageSize = ref(10)
const page = computed(() => Math.max(1, Math.min(100000, Number(route.query.page) || 1)))
const totalPages = computed(() => Math.max(1, Math.ceil((result.value?.days.totalCount ?? 0) / pageSize.value)))
const returnTarget = computed(() => earningsReturnPath(route.query.from))
const selectedDay = computed(() => result.value?.days.items.find(day => day.date === selectedDate.value))
let generation = 0
let searchGeneration = 0
let detailGeneration = 0
let alive = true

/** 本地排障只记录状态和业务码，不打印完整错误或账户响应。 */
function diagnoseRequest(scope: 'earnings' | 'fund-search' | 'day-details', reason: unknown) {
  if (import.meta.env.DEV && reason instanceof ApiRequestError) {
    globalThis.console.warn(`SimulationEarningsPage.${scope} >>> status=${reason.status}, code=${reason.code}`)
  }
}
function failureMessage(scope: 'earnings' | 'fund-search' | 'day-details', reason: unknown) {
  return earningsFailureMessage(reason instanceof ApiRequestError ? reason.status : null,
    reason instanceof ApiRequestError ? reason.code : null, scope)
}
function closeDetails() {
  ++detailGeneration
  selectedDate.value = ''; details.value = null; detailError.value = ''; detailLoading.value = false
}
function closeFundPicker() {
  ++searchGeneration
  showFundPicker.value = false; searching.value = false; matches.value = null; searchError.value = ''
}
/** 路由保存筛选与页码；请求序号阻止旧账户/基金数据覆盖新页面。 */
async function load() {
  const current = ++generation
  closeDetails()
  result.value = null
  loading.value = true; error.value = ''
  const params = new globalThis.URLSearchParams({ range: range.value, page: String(page.value), pageSize: String(pageSize.value) })
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
  closeFundPicker(); keyword.value = ''
  void navigate({ fundCode: value || undefined, page: undefined })
}
function openFundPicker() {
  showFundPicker.value = true
  keyword.value = ''
  void search()
}
async function search(pageNumber = 1) {
  const current = ++searchGeneration
  searching.value = true; searchError.value = ''; matches.value = null
  try {
    const data = await getSimEarningsFunds(keyword.value.trim(), pageNumber, searchPageSize.value)
    if (alive && current === searchGeneration) matches.value = data
  } catch (reason) {
    diagnoseRequest('fund-search', reason)
    if (alive && current === searchGeneration) searchError.value = failureMessage('fund-search', reason)
  }
  finally { if (alive && current === searchGeneration) searching.value = false }
}
function changeRange(value: string) {
  dateError.value = ''
  customDatesOpen.value = value === 'CUSTOM'
  // 自选日期先编辑，提交有效日期后才查询，避免切换时立刻加载旧日期。
  if (value === 'CUSTOM') return
  void navigate({ range: value, page: undefined, startDate: undefined, endDate: undefined })
}
function applyDates() {
  if (!start.value || !end.value || start.value > end.value || end.value > shanghaiDate()) {
    dateError.value = '请选择不晚于今天，且开始不晚于结束的日期。'; return
  }
  dateError.value = ''
  void navigate({ range: 'CUSTOM', startDate: start.value, endDate: end.value, page: undefined })
}
/** 当天构成使用独立面板与分页；关闭或切换时丢弃未完成的响应。 */
async function openDetails(date: string, pageNumber = 1) {
  const current = ++detailGeneration
  selectedDate.value = date; details.value = null; detailLoading.value = true; detailError.value = ''
  try {
    const data = await getSimEarningsDetails(date, pageNumber, detailPageSize.value)
    if (alive && current === detailGeneration) details.value = data
  } catch (reason) {
    diagnoseRequest('day-details', reason)
    if (alive && current === detailGeneration) detailError.value = failureMessage('day-details', reason)
  }
  finally { if (alive && current === detailGeneration) detailLoading.value = false }
}
watch(() => route.fullPath, () => {
  closeFundPicker()
  start.value = String(route.query.startDate ?? start.value); end.value = String(route.query.endDate ?? end.value)
  customDatesOpen.value = range.value === 'CUSTOM'; dateError.value = ''
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
        </p>
        <h1 id="earnings-title">
          收益明细
        </h1>
        <p class="earnings-subtitle">
          看清每天的盈亏，也看清每只基金的贡献。
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
      class="earnings-overview"
      aria-label="收益查询与概况"
      :aria-busy="loading"
    >
      <div class="earnings-filters">
        <div class="earnings-fund-filter">
          <span class="earnings-label">查看基金</span>
          <button
            class="earnings-fund-trigger"
            type="button"
            aria-haspopup="dialog"
            @click="openFundPicker"
          >
            <span>{{ result?.fund?.fundName ?? (code || '全部基金') }}</span>
            <small>切换</small>
          </button>
          <button
            v-if="code"
            class="text-button"
            type="button"
            @click="chooseFund('')"
          >
            全部基金
          </button>
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
            :aria-pressed="(customDatesOpen ? 'CUSTOM' : range) === item.value"
            :class="{ active: (customDatesOpen ? 'CUSTOM' : range) === item.value }"
            @click="changeRange(item.value)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
      <form
        v-if="customDatesOpen"
        class="earnings-dates"
        @submit.prevent="applyDates"
      >
        <label>开始日期<input
          v-model="start"
          type="date"
          :max="end || shanghaiDate()"
          required
        ></label>
        <span class="earnings-date-divider">至</span>
        <label>结束日期<input
          v-model="end"
          type="date"
          :min="start"
          :max="shanghaiDate()"
          required
        ></label>
        <button
          class="primary-button"
          type="submit"
        >
          查询
        </button>
        <p
          v-if="dateError"
          class="error-message"
          role="alert"
        >
          {{ dateError }}
        </p>
      </form>
      <div
        v-if="result"
        class="earnings-summary"
      >
        <div class="earnings-total">
          <span class="earnings-label">所选期间收益 <small>元</small></span>
          <strong :class="simTone(result.periodGain)">{{ earningsMoney(result.periodGain) }}</strong>
          <p
            v-if="!result.complete && result.incompleteDays"
            class="earnings-pending"
          >
            {{ result.incompleteDays }} 天数据未完整，合计待更新
            <span
              v-if="result.knownGain !== null"
              class="earnings-known"
            >已知部分 <b :class="simTone(result.knownGain)">{{ earningsMoney(result.knownGain) }}</b> 元</span>
          </p>
          <p
            v-else-if="result.complete"
            class="sim-muted"
          >
            所选日期内的收益合计
          </p>
          <p
            v-else
            class="sim-muted"
          >
            当前范围暂无收益记录
          </p>
        </div>
        <div class="earnings-context">
          <p class="earnings-label">
            统计区间
          </p>
          <p class="earnings-period">
            {{ result.startDate }} <span>至</span> {{ result.endDate }}
          </p>
          <template v-if="result.fund">
            <p class="sim-muted">
              {{ result.fund.fundCode }} · {{ result.fund.closed ? '已清仓 · 保留历史收益' : '模拟持仓' }}
            </p>
            <p class="sim-muted">
              {{ result.fund.navDate ? `市值 ${simMoney(result.fund.marketValue)} 元 · 截至 ${result.fund.navDate}` : '首笔交易尚待确认' }}{{ result.fund.reviewRequired ? ' · 当前估值待核对' : '' }}
            </p>
            <div class="earnings-related">
              <RouterLink :to="{ name: 'portfolio-snapshot', query: { section: 'orders', fundCode: code } }">
                交易记录
              </RouterLink>
              <RouterLink :to="{ name: 'portfolio-snapshot', query: { section: 'plans', fundCode: code } }">
                定投计划
              </RouterLink>
            </div>
          </template>
          <p
            v-else
            class="sim-muted"
          >
            全部基金按日合计，包含已清仓基金的历史收益
          </p>
          <p
            v-if="range === 'ALL'"
            class="sim-muted"
          >
            单次最多查看十年，更早记录请按日期分段查询。
          </p>
        </div>
      </div>
      <p
        v-if="loading"
        class="earnings-loading"
        role="status"
      >
        正在读取收益明细…
      </p>
      <p
        v-if="error"
        class="error-message earnings-load-error"
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
    </section>

    <section
      v-if="result"
      class="earnings-records"
      aria-labelledby="earnings-daily-title"
    >
      <header class="earnings-records-header">
        <div>
          <h2 id="earnings-daily-title">
            {{ showCurve ? '累计收益走势' : '每日收益' }}
          </h2>
          <p class="sim-muted">
            {{ showCurve ? '截至各日的历史累计收益，缺失数据处留空' : '最近日期在前 · 金额单位：元' }}
          </p>
        </div>
        <div
          class="earnings-view-switch"
          role="group"
          aria-label="收益展示方式"
        >
          <button
            type="button"
            :aria-pressed="!showCurve"
            :class="{ active: !showCurve }"
            @click="showCurve = false"
          >
            每日明细
          </button>
          <button
            type="button"
            :aria-pressed="showCurve"
            :class="{ active: showCurve }"
            @click="showCurve = true"
          >
            收益走势
          </button>
        </div>
      </header>
      <div
        v-if="showCurve"
        class="earnings-curve"
      >
        <SimulationPerformanceChart :points="result.curve" />
        <p class="sim-muted">
          累计收益包含所选区间之前的历史收益，不从区间开始日重新计算。
        </p>
      </div>
      <template v-else>
        <p
          v-if="!result.days.items.length"
          class="earnings-empty"
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
                </th>
                <th
                  scope="col"
                  class="number"
                >
                  当日收益
                </th>
                <th
                  scope="col"
                  class="number"
                >
                  截至当日累计
                </th>
                <th scope="col">
                  更新情况
                </th>
                <th
                  v-if="!code"
                  scope="col"
                  class="earnings-action-heading"
                >
                  收益构成
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="day in result.days.items"
                :key="day.date"
                :class="{ 'earnings-row-selected': selectedDate === day.date }"
              >
                <th scope="row">
                  {{ day.date }}
                </th>
                <td
                  class="number earnings-daily-amount"
                  :class="simTone(day.dailyGain)"
                >
                  {{ earningsMoney(day.dailyGain) }}
                </td>
                <td
                  class="number"
                  :class="simTone(day.cumulativeGain)"
                >
                  {{ earningsMoney(day.cumulativeGain) }}
                </td>
                <td>
                  <span
                    class="earnings-status"
                    :class="{ 'earnings-status-pending': !['COMPLETE', 'NON_TRADING', 'BASELINE'].includes(day.status) }"
                  >{{ earningsStatus(day.status) }}</span>
                  <small v-if="day.status === 'PARTIAL'">{{ day.updatedFunds }}/{{ day.expectedFunds }} 只完整<span v-if="day.knownGain !== null"> · 已知 {{ earningsMoney(day.knownGain) }}</span></small>
                </td>
                <td
                  v-if="!code"
                  class="earnings-row-action"
                >
                  <button
                    type="button"
                    class="earnings-detail-button"
                    aria-haspopup="dialog"
                    :aria-label="`查看 ${day.date} 的基金收益构成`"
                    @click="openDetails(day.date)"
                  >
                    查看构成
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-if="result.days.totalCount > 0"
          class="earnings-pagination"
        >
          <ListPagination
            :page="page"
            :page-size="pageSize"
            :total="result.days.totalCount"
            :loading="loading"
            label="收益日期分页"
            @change="(value, size) => navigate({ page: String(value), size: String(size) })"
          />
        </div>
      </template>
    </section>

    <p class="earnings-footnote">
      模拟收益不代表真实账户盈利。投入与收回的本金不计入收益；包含卖出盈亏、现金分红及交易费用。净值延迟或历史缺失时显示“—”，非交易日不记作零收益。
    </p>

    <SimulationEarningsPanel
      v-if="showFundPicker"
      title="选择基金"
      subtitle="查看本人基金的收益，包含已清仓基金。"
      @close="closeFundPicker"
    >
      <form
        class="earnings-picker-search"
        @submit.prevent="search()"
      >
        <label
          class="earnings-label"
          for="earnings-search"
        >基金名称或代码</label>
        <div class="earnings-search-row">
          <input
            id="earnings-search"
            v-model="keyword"
            maxlength="50"
            type="search"
            placeholder="输入基金名称或代码"
          >
          <button
            class="primary-button"
            type="submit"
            :disabled="searching"
          >
            {{ searching ? '查询中…' : '查询' }}
          </button>
        </div>
      </form>
      <button
        class="earnings-picker-all"
        type="button"
        @click="chooseFund('')"
      >
        <span>全部基金</span><small>查看账户整体收益</small>
      </button>
      <p
        v-if="searching"
        class="earnings-empty"
        role="status"
      >
        正在查找本人基金…
      </p>
      <p
        v-if="searchError"
        class="error-message"
        role="alert"
      >
        {{ searchError }} <button
          class="text-button"
          type="button"
          @click="search()"
        >
          重试
        </button>
      </p>
      <template v-if="matches">
        <p class="earnings-picker-count">
          {{ keyword.trim() ? '查询结果' : '本人基金' }} · {{ matches.totalCount }} 只
        </p>
        <p
          v-if="!matches.items.length"
          class="earnings-empty"
        >
          没有找到匹配的基金，请换个名称或代码。
        </p>
        <ul
          v-else
          class="earnings-picker-list"
        >
          <li
            v-for="fund in matches.items"
            :key="fund.fundCode"
          >
            <button
              type="button"
              :aria-current="code === fund.fundCode ? 'true' : undefined"
              @click="chooseFund(fund.fundCode)"
            >
              <span><b>{{ fund.fundName }}</b><small>{{ fund.fundCode }}<span v-if="fund.closed"> · 已清仓</span></small></span>
              <span class="earnings-picker-action">{{ code === fund.fundCode ? '当前基金' : '查看收益' }}</span>
            </button>
          </li>
        </ul>
        <ListPagination
          v-if="matches.totalCount > 0"
          :page="matches.page"
          :page-size="searchPageSize"
          :total="matches.totalCount"
          :loading="searching"
          label="收益基金查询分页"
          @change="(value, size) => { searchPageSize = size; search(value) }"
        />
      </template>
    </SimulationEarningsPanel>

    <SimulationEarningsPanel
      v-if="selectedDate"
      title="当日收益构成"
      :subtitle="`${selectedDate} · 全部基金 · 单位：元`"
      drawer
      @close="closeDetails"
    >
      <div
        v-if="selectedDay"
        class="earnings-day-summary"
      >
        <span class="earnings-label">当日收益</span>
        <strong :class="simTone(selectedDay.dailyGain)">{{ earningsMoney(selectedDay.dailyGain) }}</strong>
        <p class="sim-muted">
          {{ earningsStatus(selectedDay.status) }}<span v-if="selectedDay.status === 'PARTIAL'"> · {{ selectedDay.updatedFunds }}/{{ selectedDay.expectedFunds }} 只基金完整</span>
        </p>
        <p
          v-if="selectedDay.status === 'PARTIAL' && selectedDay.knownGain !== null"
          class="earnings-pending"
        >
          已知部分 {{ earningsMoney(selectedDay.knownGain) }} 元，完整合计待更新
        </p>
      </div>
      <p
        v-if="detailLoading"
        class="earnings-empty"
        role="status"
      >
        正在读取当天基金构成…
      </p>
      <p
        v-if="detailError"
        class="error-message"
        role="alert"
      >
        {{ detailError }} <button
          class="text-button"
          type="button"
          @click="openDetails(selectedDate)"
        >
          重试
        </button>
      </p>
      <template v-if="details">
        <div class="earnings-detail-heading">
          <h3>基金贡献</h3><span>共 {{ details.totalCount }} 只基金</span>
        </div>
        <p
          v-if="!details.items.length"
          class="earnings-empty"
        >
          当天暂无基金收益记录。
        </p>
        <ul
          v-else
          class="earnings-contributions"
        >
          <li
            v-for="fund in details.items"
            :key="fund.fundCode"
          >
            <div class="earnings-contribution-fund">
              <RouterLink :to="{ name: 'portfolio-earnings', query: { ...route.query, fundCode: fund.fundCode, page: undefined } }">
                {{ fund.fundName }}
              </RouterLink>
              <small>{{ fund.fundCode }}</small>
              <small v-if="fund.message">{{ fund.message }}</small>
            </div>
            <div class="earnings-contribution-value">
              <strong :class="simTone(fund.dailyGain)">{{ earningsMoney(fund.dailyGain) }}</strong><small :class="{ 'earnings-pending': !['COMPLETE', 'NON_TRADING', 'BASELINE'].includes(fund.status) }">{{ earningsStatus(fund.status) }}</small>
            </div>
          </li>
        </ul>
      </template>
      <template #footer>
        <ListPagination
          v-if="details && details.totalCount > 0"
          :page="details.page"
          :page-size="detailPageSize"
          :total="details.totalCount"
          :loading="detailLoading"
          label="当日收益明细分页"
          @change="(value, size) => { detailPageSize = size; openDetails(selectedDate, value) }"
        />
        <p
          v-else
          class="earnings-panel-note"
        >
          缺失数据保留“—”，不计作零收益。
        </p>
      </template>
    </SimulationEarningsPanel>
  </section>
</template>

<style scoped>
.earnings-page { max-width: 1280px; margin: 0 auto; }
.earnings-page h1 { margin: 4px 0 6px; }
.earnings-page > .sim-page-header { margin-bottom: 22px; }
.earnings-subtitle { color: #647b72; margin: 0; font-size: 14px; }
.earnings-label { font-size: 12px; font-weight: 500; color: #647b72; }
.earnings-overview, .earnings-records { background: #fff; border: 1px solid #dfe8e3; border-radius: 12px; }
.earnings-overview { margin-bottom: 24px; }
.earnings-filters { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px 24px; padding: 18px 24px; border-bottom: 1px solid #edf1ee; }
.earnings-fund-filter { display: flex; align-items: center; flex: 1 1 240px; min-width: 0; gap: 12px; }
.earnings-fund-filter > .earnings-label, .earnings-fund-filter > .text-button { flex-shrink: 0; }
.earnings-fund-trigger { display: flex; align-items: center; justify-content: space-between; gap: 20px; max-width: 340px; min-width: 140px; min-height: 38px; padding: 7px 12px; border: 1px solid #d7e3dd; border-radius: 7px; color: #203a34; background: #fff; font: inherit; font-weight: 600; text-align: left; cursor: pointer; }
.earnings-fund-trigger > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.earnings-fund-trigger small { flex-shrink: 0; color: #0f766e; font-size: 12px; font-weight: 500; }
.earnings-range, .earnings-view-switch { display: flex; flex-wrap: wrap; gap: 3px; padding: 4px; border-radius: 8px; background: #f2f6f4; }
.earnings-range button, .earnings-view-switch button { min-height: 34px; padding: 6px 12px; border: 1px solid transparent; border-radius: 6px; color: #647b72; background: transparent; font: inherit; font-size: 13px; cursor: pointer; }
.earnings-range button.active, .earnings-view-switch button.active { border-color: #dce7e1; color: #0f766e; background: #fff; box-shadow: 0 1px 3px #203a3408; font-weight: 600; }
.earnings-dates { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; padding: 16px 24px; border-bottom: 1px solid #edf1ee; background: #fafcfb; }
.earnings-dates label { display: grid; min-width: 0; gap: 6px; color: #647b72; font-size: 12px; }
.earnings-dates input, .earnings-search-row input { min-width: 0; box-sizing: border-box; border: 1px solid #c8d8cd; border-radius: 7px; padding: 9px 12px; background: #fff; color: #203a34; font: inherit; font-size: 14px; }
.earnings-dates input { min-height: 40px; }
.earnings-date-divider { align-self: flex-end; padding-bottom: 10px; color: #647b72; font-size: 13px; }
.earnings-dates > .error-message { flex-basis: 100%; margin: 0; }
.earnings-summary { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 32px; padding: 28px 28px 30px; }
.earnings-total .earnings-label small { margin-left: 5px; font-weight: 400; }
.earnings-total > strong { display: block; margin: 8px 0; font-size: clamp(30px, 3vw, 40px); line-height: 1.3; letter-spacing: -1px; font-weight: 600; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.earnings-total p { margin: 7px 0 0; font-size: 12px; line-height: 1.8; }
.earnings-known { display: block; color: #647b72; }
.earnings-known b { font-weight: 500; font-variant-numeric: tabular-nums; }
.earnings-context { align-self: center; padding-left: 28px; border-left: 1px solid #e5ece7; }
.earnings-context p { margin: 4px 0; }
.earnings-context .earnings-period { margin: 7px 0; color: #203a34; font-size: 16px; font-weight: 500; font-variant-numeric: tabular-nums; }
.earnings-period span { margin: 0 8px; color: #8ba097; font-size: 12px; font-weight: 400; }
.earnings-related { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 10px; font-size: 12px; }
.earnings-related a { color: #0f766e; text-decoration: none; }
.earnings-loading { margin: 0; padding: 38px 24px; color: #647b72; font-size: 14px; }
.earnings-load-error { margin: 20px 24px; }
.earnings-records { overflow: hidden; }
.earnings-records-header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 24px; }
.earnings-records-header h2 { margin: 0; font-size: 18px; }
.earnings-records-header p { margin: 4px 0 0; font-size: 12px; }
.earnings-table-wrap { overflow-x: auto; }
.earnings-table { width: 100%; min-width: 650px; border-collapse: collapse; font-size: 14px; }
.earnings-table th, .earnings-table td { padding: 16px 24px; border-bottom: 1px solid #edf1ee; text-align: left; }
.earnings-table thead { background: #f7faf8; color: #647b72; font-size: 12px; }
.earnings-table thead th { padding-top: 12px; padding-bottom: 12px; font-weight: 500; }
.earnings-table tbody th { font-weight: 500; white-space: nowrap; font-variant-numeric: tabular-nums; }
.earnings-table .number { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
.earnings-table .earnings-daily-amount { font-weight: 600; }
.earnings-table small { display: block; max-width: 260px; color: #647b72; font-size: 11px; margin-top: 5px; line-height: 1.7; }
.earnings-table tbody tr:hover, .earnings-table .earnings-row-selected { background: #f8fbf9; }
.earnings-status { display: inline-block; padding: 3px 8px; border-radius: 4px; color: #647b72; background: #f1f5f3; font-size: 12px; white-space: nowrap; }
.earnings-status-pending { color: #855710; background: #fcf5e8; }
.earnings-pending { color: #855710 !important; }
.earnings-table .earnings-action-heading, .earnings-table .earnings-row-action { text-align: right; }
.earnings-detail-button { padding: 5px 9px; min-height: 32px; border: 1px solid #d7e6de; border-radius: 6px; color: #0f766e; background: #fff; font: inherit; font-size: 12px; white-space: nowrap; cursor: pointer; }
.earnings-detail-button:hover, .earnings-fund-trigger:hover { border-color: #0f766e; background: #f5faf7; }
.earnings-pagination { padding: 0 24px; }
.earnings-pagination :deep(.pagination) { margin: 0; padding: 16px 0; border: 0; background: transparent; }
.earnings-curve { padding: 0 24px 18px; }
.earnings-empty { margin: 0; padding: 32px 12px; color: #647b72; text-align: center; font-size: 14px; line-height: 1.8; }
.earnings-footnote { margin: 18px 4px 10px; color: #647b72; font-size: 12px; line-height: 1.9; }
.earnings-picker-search { margin-bottom: 18px; }
.earnings-search-row { display: flex; gap: 10px; margin-top: 8px; }
.earnings-search-row input { flex: 1; width: 0; }
.earnings-search-row button { flex-shrink: 0; }
.earnings-picker-all { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 18px; width: 100%; padding: 14px; border: 1px solid #d7e6de; border-radius: 8px; background: #f4faf7; color: #0f766e; text-align: left; font: inherit; font-size: 14px; cursor: pointer; }
.earnings-picker-all small { color: #647b72; font-size: 12px; }
.earnings-picker-count { margin: 22px 0 8px; color: #647b72; font-size: 12px; }
.earnings-picker-list, .earnings-contributions { list-style: none; margin: 0; padding: 0; }
.earnings-picker-list li + li, .earnings-contributions li + li { border-top: 1px solid #edf1ee; }
.earnings-picker-list button { display: flex; align-items: center; justify-content: space-between; gap: 20px; width: 100%; padding: 14px 8px; border: 0; background: #fff; color: #203a34; text-align: left; font: inherit; font-size: 14px; cursor: pointer; }
.earnings-picker-list button:hover, .earnings-picker-list button[aria-current="true"] { background: #f4faf7; }
.earnings-picker-list b { font-weight: 500; overflow-wrap: anywhere; }
.earnings-picker-list small { display: block; margin-top: 5px; color: #647b72; font-size: 12px; }
.earnings-picker-action { flex-shrink: 0; color: #0f766e; font-size: 12px; }
.earnings-day-summary { margin-bottom: 24px; padding: 20px; border: 1px solid #dfe8e3; border-radius: 9px; background: #f7faf8; }
.earnings-day-summary > strong { display: block; margin: 8px 0; font-size: 32px; font-weight: 600; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.earnings-day-summary p { margin: 6px 0 0; font-size: 12px; line-height: 1.8; }
.earnings-detail-heading { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 8px; padding-bottom: 10px; border-bottom: 1px solid #e5ece7; }
.earnings-detail-heading h3 { margin: 0; font-size: 14px; font-weight: 600; }
.earnings-detail-heading > span { color: #647b72; font-size: 12px; }
.earnings-contributions li { display: grid; grid-template-columns: minmax(0, 1fr) minmax(90px, auto); align-items: center; gap: 20px; padding: 18px 0; }
.earnings-contribution-fund a { color: #203a34; text-decoration: none; font-size: 14px; font-weight: 500; line-height: 1.6; overflow-wrap: anywhere; }
.earnings-contribution-fund a:hover, .earnings-related a:hover { color: #0f766e; text-decoration: underline; }
.earnings-contributions small { display: block; margin-top: 6px; color: #647b72; font-size: 12px; line-height: 1.5; }
.earnings-contribution-value { text-align: right; }
.earnings-contribution-value strong { font-size: 16px; font-weight: 600; font-variant-numeric: tabular-nums; }
.earnings-panel-note { margin: 0; color: #647b72; font-size: 12px; line-height: 1.8; }
button:focus-visible, a:focus-visible, input:focus-visible { outline: 2px solid #0f766e; outline-offset: 3px; }
@media (max-width: 1050px) {
  .earnings-filters { align-items: flex-start; }
  .earnings-fund-filter { flex-basis: 100%; }
  .earnings-range { width: fit-content; }
  .earnings-table th, .earnings-table td { padding-right: 16px; padding-left: 16px; }
}
@media (max-width: 650px) {
  .earnings-page > .sim-page-header { display: flex; gap: 14px; }
  .earnings-filters, .earnings-records-header { padding: 16px; }
  .earnings-fund-filter { flex-wrap: wrap; gap: 10px; }
  .earnings-fund-filter > .earnings-label { flex-basis: 100%; }
  .earnings-fund-trigger { flex: 1; min-width: 0; max-width: none; }
  .earnings-range { width: 100%; }
  .earnings-range button { flex: 1 0 auto; padding-right: 8px; padding-left: 8px; }
  .earnings-summary { grid-template-columns: 1fr; padding: 22px 18px; gap: 22px; }
  .earnings-context { padding: 18px 0 0; border-left: 0; border-top: 1px solid #e5ece7; }
  .earnings-dates { padding: 16px; gap: 10px; }
  .earnings-dates label { flex: 1 1 125px; }
  .earnings-dates input { width: 100%; font-size: 16px; }
  .earnings-date-divider { display: none; }
  .earnings-pagination { padding: 0 16px; }
  .earnings-curve { padding-right: 12px; padding-left: 12px; }
  .earnings-contributions li { gap: 12px; }
  .earnings-search-row input { font-size: 16px; }
}
</style>
