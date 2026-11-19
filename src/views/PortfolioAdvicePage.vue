<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { generateAdvice, getAdviceHistory, getAdviceReport } from '@/api/advice'
import { getSimOverview } from '@/api/simulation'
import { getWatchlist } from '@/api/watchlist'
import type { WatchlistItem } from '@/types/watchlist'
import { normalizePageSize } from '@/utils/pagination'
import { usePageNavigation } from '@/composables/usePageNavigation'
import { useAuthStore } from '@/stores/auth'
import DecisionPanelV2 from '@/components/DecisionPanelV2.vue'
import type { AdviceDetail, AdviceHistory } from '@/types/advice'
import type { SimPosition } from '@/types/simulation'
import { adviceLabel, reviewLabel } from '@/utils/advice'
import { shanghaiDate, simMoney, simPercent, simShares, simTime, simTone } from '@/utils/simulation'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { section } = usePageNavigation()
const code = computed(() => String(route.query.fund ?? ''))
/** 当前持仓、已清仓记录和本人关注共同作为综合建议入口；最终范围仍由服务端验证。 */
const positions = ref<SimPosition[]>([])
const follows = ref<WatchlistItem[]>([])
const candidates = computed(() => [...positions.value, ...follows.value.filter(f => !positions.value.some(p => p.fundCode === f.fundCode))])
const positionsLoaded = ref(false)
const positionsError = ref(false)
const followsError = ref(false)
const positionsLoading = ref(true)
const heldPositions = computed(() => positions.value.filter(item => Number(item.shares) > 0)
  .sort((left, right) => left.fundCode.localeCompare(right.fundCode)))
const currentFund = computed(() => candidates.value.find(item => item.fundCode === code.value))
const currentIsHeld = computed(() => heldPositions.value.some(item => item.fundCode === code.value))
let positionsGeneration = 0
async function loadPositions() {
  const run = ++positionsGeneration
  positionsLoading.value = true; positionsError.value = false; followsError.value = false
  try {
    const overview = await getSimOverview()
    if (!alive || run !== positionsGeneration) return
    positions.value = overview.positions
    // 明确带基金的旧链接照常打开；关注查询失败不能让当前持仓选择失效。
    if (code.value && !positions.value.some(item => item.fundCode === code.value)) {
      try {
        const result = await getWatchlist({ pageSize: 50, keyword: code.value })
        if (!alive || run !== positionsGeneration) return
        follows.value = result.items
      } catch { if (alive && run === positionsGeneration) followsError.value = true }
    }
  } catch {
    if (alive && run === positionsGeneration) positionsError.value = true
  } finally {
    if (alive && run === positionsGeneration) { positionsLoaded.value = true; positionsLoading.value = false }
  }
}
// 延后到setup声明完成，避免同步失败时读取尚未初始化的页面生命周期状态。
const positionsReady = Promise.resolve().then(loadPositions)
const fundInvalid = computed(() => !!code.value && positionsLoaded.value && !positionsError.value
  && !followsError.value
  && !candidates.value.some((item) => item.fundCode === code.value))
const keyword = ref('')
const previousSearch = ref('')
function prepareSearch() {
  if (keyword.value && keyword.value === previousSearch.value) keyword.value = ''
}
const searchError = ref('')
const searching = ref(false)
const searchResults = ref<{ fundCode: string; fundName: string }[]>([])
const showingResults = ref(false)
let searchGeneration = 0
function cancelSearch() { searchGeneration++; searching.value = false }
function editKeyword() { cancelSearch(); searchError.value = ''; searchResults.value = []; showingResults.value = false }
async function search() {
  cancelSearch(); searchError.value = ''; searchResults.value = []; showingResults.value = false
  previousSearch.value = keyword.value.trim()
  const value = keyword.value.trim().toLocaleLowerCase()
  if (!value) {
    void router.replace({ query: { ...route.query, fund: undefined, report: undefined, page: undefined, start: undefined, end: undefined } }); return
  }
  if (positionsError.value) { searchError.value = '持仓列表暂时无法读取，请稍后重试。'; return }
  const matches = () => {
    const exact = candidates.value.find(item => item.fundCode === value || `${item.fundName}（${item.fundCode}）`.toLocaleLowerCase() === value)
    return exact ? [exact] : candidates.value.filter(item => item.fundName.toLocaleLowerCase().includes(value) || item.fundCode.includes(value))
  }
  let found = matches()
  if (!found.length) {
    const run = ++searchGeneration
    searching.value = true
    try {
      const result = await getWatchlist({ keyword: value, pageSize: 50 })
      if (!alive || run !== searchGeneration) return
      follows.value = result.items
      found = matches()
    } catch {
      if (alive && run === searchGeneration) searchError.value = '关注范围暂时无法读取，请重试。'
      return
    } finally { if (alive && run === searchGeneration) searching.value = false }
  }
  if (found.length === 1) selectFund(found[0]!.fundCode)
  else {
    searchResults.value = found; showingResults.value = true
    if (!found.length) searchError.value = '未找到本人持仓、已清仓或关注的基金。'
  }
}
/** 切换基金时保留当前栏目与原持仓来源。 */
function selectFund(fundCode: string) {
  if (!/^\d{6}$/.test(fundCode)) return
  cancelSearch(); searchError.value = ''; showingResults.value = false; searchResults.value = []
  const fund = candidates.value.find(item => item.fundCode === fundCode)
  keyword.value = fund ? `${fund.fundName}（${fundCode}）` : fundCode
  previousSearch.value = keyword.value
  void router.replace({ query: { ...route.query, fund: fundCode, report: undefined, page: undefined, start: undefined, end: undefined } })
}
watch([code, currentFund], () => {
  if (searching.value) return
  keyword.value = currentFund.value ? `${currentFund.value.fundName}（${code.value}）` : code.value
  previousSearch.value = keyword.value
}, { immediate: true })
const history = ref<AdviceHistory | null>(null)
const detail = ref<AdviceDetail | null>(null)
const loading = ref(false)
const generating = ref(false)
const error = ref('')
const message = ref('')
const start = ref('')
const end = ref('')
const pageSize = computed(() => normalizePageSize(route.query.size))
const page = computed(() => Math.max(1, Math.min(10000, Number(route.query.page) || 1)))
const reportId = computed(() => typeof route.query.report === 'string' ? route.query.report : '')
const showReport = computed(() => section.value === 'latest' || !!reportId.value)
const canGenerate = computed(() => auth.hasPermission('SIM_PORTFOLIO_SELF_WRITE'))
let generation = 0
let alive = true

/** 切基金、翻页或选日期时丢弃旧请求，避免把上一只基金的报告显示到当前页面。 */
async function load() {
  const current = ++generation
  loading.value = true; error.value = ''; detail.value = null; history.value = null
  const fund = code.value
  start.value = typeof route.query.start === 'string' ? route.query.start : ''
  end.value = typeof route.query.end === 'string' ? route.query.end : ''
  if (!fund) { loading.value = false; return }
  // 先确认本人持仓或关注范围；未持仓但已关注的基金继续进入V2分析。
  await positionsReady
  if (!alive || current !== generation) return
  if (fundInvalid.value) { loading.value = false; return }
  try {
    if (section.value === 'latest' || (section.value === 'history' && !reportId.value)) return // 独立组件自行读取，不依赖旧建议历史接口。
    const result = await getAdviceHistory(fund, section.value === 'latest' ? 1 : page.value,
      section.value === 'latest' ? '' : start.value, section.value === 'latest' ? '' : end.value, pageSize.value)
    if (!alive || current !== generation) return
    history.value = result
    const id = section.value === 'latest' ? result.reports.items[0]?.reportId : reportId.value
    if (id) {
      const report = await getAdviceReport(fund, id)
      if (alive && current === generation) detail.value = report
    }
  } catch (reason) {
    if (alive && current === generation) error.value = reason instanceof Error ? reason.message : '建议记录暂时无法读取。'
  } finally { if (alive && current === generation) loading.value = false }
}
async function generate() {
  if (generating.value) return
  generating.value = true; error.value = ''; message.value = ''
  const fund = code.value
  try {
    await generateAdvice(fund)
    if (!alive || fund !== code.value) return
    message.value = '已检查当前建议，相同内容沿用原记录，内容变化会追加留档。'
    await load()
  } catch (reason) {
    if (alive && fund === code.value) error.value = reason instanceof Error ? reason.message : '生成结果暂时无法确认，请稍后重新进入查看。'
  } finally { if (alive) generating.value = false }
}
function selectReport(id?: string) { void router.replace({ query: { ...route.query, report: id } }) }
watch([code, section, () => route.query.page, () => route.query.size, () => route.query.start, () => route.query.end, reportId], () => void load(), { immediate: true })
onBeforeUnmount(() => { alive = false; generation++; positionsGeneration++; cancelSearch() })
</script>

<template>
  <section
    class="sim-page advice-page"
    aria-labelledby="advice-title"
  >
    <h1
      id="advice-title"
      class="visually-hidden"
    >
      持仓分析
    </h1>
    <section
      class="fund-results-panel advice-results-panel"
      aria-label="持仓分析内容"
    >
      <h2 class="fund-results-title">
        持仓分析
      </h2>
      <form
        class="fund-filter-toolbar"
        aria-label="选择分析基金"
        :aria-busy="positionsLoading || searching"
        @submit.prevent="search"
      >
        <div class="fund-filter-search">
          <label
            class="visually-hidden"
            for="advice-fund-keyword"
          >基金代码或名称</label>
          <svg
            class="fund-filter-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            aria-hidden="true"
          ><circle
            cx="10.5"
            cy="10.5"
            r="6.5"
          /><path d="m15.5 15.5 4.5 4.5" /></svg>
          <input
            id="advice-fund-keyword"
            v-model="keyword"
            maxlength="50"
            :placeholder="previousSearch || '搜索基金名称 / 代码'"
            type="search"
            autocomplete="off"
            @focus="prepareSearch"
            @input="editKeyword"
          >
        </div>
        <button
          class="secondary-button fund-filter-submit"
          type="submit"
          :disabled="positionsLoading || searching"
        >
          {{ searching ? '查询中…' : '查询' }}
        </button>
        <RouterLink
          v-if="code && !fundInvalid"
          class="secondary-button"
          :to="{ name: 'notifications', query: { section: 'holding-rules', fund: code } }"
        >
          设置该基金提醒
        </RouterLink>
        <button
          v-if="canGenerate && section === 'legacy'"
          class="secondary-button"
          type="button"
          :disabled="loading || generating"
          @click="generate"
        >
          {{ generating ? '正在检查并留档…' : '更新并留档' }}
        </button>
        <span
          v-if="!positionsLoading && !positionsError"
          class="sim-muted"
        >当前持仓 {{ heldPositions.length }} 只</span>
      </form>
      <p
        v-if="positionsError"
        class="error-message"
        role="alert"
      >
        持仓列表暂时无法读取。 <button
          type="button"
          class="secondary-button"
          @click="loadPositions"
        >
          重新读取持仓
        </button>
      </p>
      <p
        v-else-if="positionsLoading"
        class="sim-muted"
        role="status"
      >
        正在读取本人持仓基金…
      </p>
      <p
        v-if="followsError && code && !currentIsHeld"
        class="sim-muted"
        role="status"
      >
        当前基金的关注信息暂时无法核对；仍可搜索本人持仓，已保存记录以实际读取结果为准。
      </p>
      <p
        v-if="searchError"
        class="error-message"
        role="alert"
      >
        {{ searchError }}
        <button
          v-if="searchError.includes('重试')"
          type="button"
          class="secondary-button"
          @click="search"
        >
          重试查找
        </button>
      </p>
      <section
        v-if="showingResults && searchResults.length"
        aria-label="基金查询结果"
      >
        <h3>找到 {{ searchResults.length }} 只基金，请选择查看</h3>
        <ul class="advice-search-results">
          <li
            v-for="fund in searchResults"
            :key="fund.fundCode"
          >
            <button
              type="button"
              class="advice-text-button"
              @click="selectFund(fund.fundCode)"
            >
              {{ fund.fundName }}（{{ fund.fundCode }}）
            </button>
          </li>
        </ul>
      </section>
      <div
        v-else-if="showingResults"
        class="sim-empty"
      >
        请修改基金名称或代码后重新查询。
      </div>
      <div
        v-else-if="!code"
        class="sim-empty"
      >
        <strong>{{ positionsLoading ? '正在读取持仓' : positionsError ? '持仓列表暂时无法展示' : '请选择要分析的基金' }}</strong>
        <p v-if="!positionsLoading && !positionsError">
          输入基金名称或代码，点击查询查看分析。
        </p>
      </div>
      <div
        v-else-if="fundInvalid"
        class="sim-empty"
      >
        <strong>该基金不在本人的持仓或关注中</strong>
        <p>请在上方选择本人的持仓或关注基金。</p>
      </div>
      <template v-else>
        <p
          v-if="error"
          class="error-message"
          role="alert"
        >
          {{ error }}
          <button
            type="button"
            class="secondary-button"
            @click="load"
          >
            重试
          </button>
        </p>
        <p
          v-if="message"
          class="sim-success"
          role="status"
        >
          {{ message }}
        </p>
        <p
          v-if="history?.job && ['FAILED', 'PARTIAL'].includes(history.job.status)"
          class="notice-banner"
          role="status"
        >
          {{ history.job.message }} 上次检查：{{ simTime(history.job.attemptedAt) }}
        </p>
        <p
          v-if="loading"
          class="sim-muted"
          role="status"
        >
          正在读取已保存的建议记录…
        </p>

        <DecisionPanelV2
          v-if="section === 'latest'"
          :fund-code="code"
        />
        <template v-else-if="!showReport">
          <DecisionPanelV2
            :fund-code="code"
            history-only
          />
        </template>

        <template v-else-if="detail && !loading">
          <button
            v-if="section !== 'latest'"
            type="button"
            class="advice-text-button"
            @click="selectReport()"
          >
            ← 返回记录列表
          </button>
          <p
            v-if="section === 'latest' && detail.report.reportDate !== shanghaiDate()"
            class="notice-banner"
          >
            当前显示 {{ detail.report.reportDate }} 保存的报告，今日尚无新的留档。
          </p>
          <article
            class="advice-conclusion"
            :class="{ 'advice-conclusion-sell': detail.report.decision === 'SELL' }"
          >
            <span class="advice-kicker">{{ section === 'latest' ? '当前保存的操作建议' : '当天原始操作建议' }}</span>
            <h2>{{ adviceLabel(detail.report.decision) }}</h2>
            <p>{{ detail.report.summary }}</p>
            <div class="advice-meta">
              <span>实际留档：{{ simTime(detail.report.generatedAt) }}</span><span v-if="detail.report.cutoffDate">依据截至：{{ detail.report.cutoffDate }}</span>
            </div>
          </article>
          <section
            class="sim-detail-panel"
            aria-labelledby="advice-evidence-title"
          >
            <h2 id="advice-evidence-title">
              为什么给出这条建议
            </h2>
            <ol class="advice-evidence">
              <li
                v-for="(item, index) in detail.snapshot.evidence"
                :key="index"
              >
                <div class="advice-evidence-heading">
                  <h3>{{ item.title }}</h3><span :class="{ 'advice-against': item.relation === 'AGAINST' }">{{ item.relation === 'AGAINST' ? '反对依据' : item.relation === 'SUPPORT' ? '支持依据' : '说明' }}</span>
                </div>
                <p>{{ item.content }}</p>
                <div
                  v-if="item.sourceDate"
                  class="sim-muted"
                >
                  资料日期：{{ item.sourceDate }}
                </div>
              </li>
            </ol>
            <div
              v-if="detail.snapshot.limitations.length"
              class="advice-gaps"
            >
              <h3>这次判断还没有覆盖什么</h3><ul>
                <li
                  v-for="item in detail.snapshot.limitations"
                  :key="item"
                >
                  {{ item }}
                </li>
              </ul>
            </div>
          </section>
          <section
            class="sim-detail-panel"
            aria-labelledby="advice-outcome-title"
          >
            <h2 id="advice-outcome-title">
              后来实际怎么样
            </h2>
            <template v-if="detail.report.observationStart">
              <p>观察区间：{{ detail.report.observationStart }} → {{ detail.report.observationEnd }}（20 个交易日）</p>
              <p
                v-if="detail.report.originalReportId"
                class="sim-muted"
              >
                本份沿用已有判断，共享首次报告的观察区间；不重复计入样本统计。
              </p>
              <div class="advice-outcome">
                <strong
                  v-if="detail.report.totalReturn !== null"
                  :class="simTone(detail.report.totalReturn)"
                >{{ simPercent(detail.report.totalReturn) }}</strong><span>{{ reviewLabel(detail.report) }}</span>
              </div>
              <p>{{ detail.outcome?.message || '区间结束且净值、分红资料齐全后，后台会自动补上实际回报。' }}</p>
              <p
                v-if="detail.outcome"
                class="sim-muted"
              >
                核验时间：{{ simTime(detail.outcome.checkedAt) }} · 原始建议保留不变。
              </p>
            </template>
            <p v-else>
              这份报告没有形成操作建议，不计入建议效果统计。
            </p>
          </section>
          <details class="sim-detail-panel advice-archive">
            <summary>当时持仓与留档信息</summary>
            <dl><div><dt>当时持有</dt><dd>{{ simShares(detail.snapshot.position.shares) }} 份</dd></div><div><dt>当时剩余成本</dt><dd>{{ simMoney(detail.snapshot.position.cost) }} 元</dd></div><div><dt>当时市值</dt><dd>{{ simMoney(detail.snapshot.position.marketValue) }} 元</dd></div><div><dt>持仓数据日期</dt><dd>{{ detail.snapshot.position.navDate || '尚未确认' }}</dd></div></dl>
            <p class="sim-muted">
              规则版本：{{ detail.snapshot.ruleVersion }} · 报告编号：{{ detail.report.reportId }}
            </p>
            <p
              v-if="detail.snapshot.experiment?.models.length"
              class="sim-muted"
            >
              主模型版本：{{ detail.snapshot.experiment.models[0]?.modelHash }}
            </p>
          </details>
        </template>
        <div
          v-else-if="showReport && !loading && !error"
          class="sim-empty"
        >
          <strong>还没有保存的建议</strong><p>可以点击“更新并留档”保存当前判断；资料不足时会说明原因。</p>
        </div>
        <p class="advice-schedule sim-muted">
          生成后保存当时依据 · 内容变化另存记录 · 历史原文保留
        </p>
      </template>
    </section>
  </section>
</template>

<style scoped>
/* 控件外观复用全站工具栏；这里只限定基金名称所需的布局宽度。 */
.advice-search-results { list-style:none; padding:0; margin:0; }
.advice-search-results li { border-bottom:1px solid var(--ui-line); }
.advice-search-results .advice-text-button { display:block; width:100%; min-height:48px; box-sizing:border-box; padding:16px 12px; overflow-wrap:anywhere; }
.advice-search-results .advice-text-button:hover, .advice-search-results .advice-text-button:focus-visible { background:var(--ui-surface-muted, #f2f5f0); }
.advice-results-panel :deep(.decision-panel) { padding:0; margin:0; border:0; border-radius:0; background:transparent; }
.advice-results-panel :deep(.decision-panel h2) { font-size:20px; margin:0; }

.advice-conclusion { background: #edf6f1; border: 1px solid #d3e5da; border-radius: 10px; padding: 25px; margin-top: 14px; }
.advice-conclusion-sell { background: #fbf6ee; border-color: #e8dcc8; }
.advice-kicker { font-size: 13px; color: #566e60; }.advice-conclusion h2 { font-size: 26px; margin: 10px 0; }.advice-conclusion p { font-size: 16px; line-height: 1.85; max-width: 900px; }
.advice-meta { display: flex; flex-wrap: wrap; gap: 8px 24px; color: #586f64; font-size: 13px; }
.advice-evidence { list-style: none; padding: 0; margin-bottom: 0; }.advice-evidence > li { padding: 20px 0; border-bottom: 1px solid #e4ebe6; }.advice-evidence > li:last-child { border-bottom: 0; }
.advice-evidence-heading { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }.advice-evidence-heading > span { color: #326a56; background: #edf5ef; padding: 4px 8px; border-radius: 4px; font-size: 12px; }.advice-evidence-heading .advice-against { color: #825621; background: #fbf1df; }
.advice-evidence p, .sim-detail-panel > p { line-height: 1.85; color: #385247; }.advice-evidence a { margin-left: 12px; color: #0f766e; }
.advice-gaps { border-top: 1px solid #dfe8e3; padding-top: 20px; margin-top: 4px; }.advice-gaps li { margin: 8px 0; line-height: 1.8; color: #53685d; }.advice-gaps ul { padding-left: 20px; }
.advice-text-button { background: transparent; color: #08776b; border: 0; padding: 8px 0; cursor: pointer; font: inherit; min-height: 36px; text-align: left; }
.advice-outcome { display: flex; align-items: center; gap: 18px; margin: 18px 0; }.advice-outcome strong { font-size: 30px; font-variant-numeric: tabular-nums; }
.advice-archive summary { cursor: pointer; }.advice-archive dl { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 16px; }.advice-archive dt { color: #657a6e; font-size: 13px; }.advice-archive dd { margin: 8px 0; }.advice-archive p { overflow-wrap: anywhere; }.advice-schedule { margin-top: 24px; }
@media(max-width: 800px) { .advice-archive dl { grid-template-columns: repeat(2,minmax(0,1fr)); } }
@media(max-width: 580px) { .advice-conclusion { padding: 18px; }.advice-conclusion h2 { font-size: 23px; }.advice-text-button { min-height: 44px; } }
</style>
