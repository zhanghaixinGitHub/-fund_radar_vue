<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  confirmHoldingRule, fetchFundDiagnosis, fetchHoldingRules, fetchRuleDraft, generateAdvice, generateRuleDraft,
  getAdviceHistory, getAdviceReport, revokeHoldingRule,
} from '@/api/advice'
import { getSimOverview } from '@/api/simulation'
import { getWatchlist } from '@/api/watchlist'
import type { WatchlistItem } from '@/types/watchlist'
import { usePageNavigation } from '@/composables/usePageNavigation'
import { useAuthStore } from '@/stores/auth'
import DecisionPanelV2 from '@/components/DecisionPanelV2.vue'
import AutomaticEffectsPanel from '@/components/AutomaticEffectsPanel.vue'
import type { AdviceDetail, AdviceHistory, DiagnosisHistory, HoldingRulesView, RuleDraftTier, RuleDraftView } from '@/types/advice'
import type { SimPosition } from '@/types/simulation'
import {
  adviceLabel, diagnosisItemLabel, diagnosisItemOrder, diagnosisStale, diagnosisVerdictLabel, diagnosisVerdictTone,
  evidenceUrl, reviewLabel, ruleAdjustedValue, ruleAdjustMaxSteps, rulePctText, ruleStatsUpdated, ruleStatusLabel,
  ruleTierLabel, ruleTriggerText,
} from '@/utils/advice'
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
const positionsReady = Promise.all([getSimOverview(), getWatchlist({pageSize:50, ...(code.value ? {keyword:code.value} : {})})])
  .then(([overview, watchlist]) => { positions.value = overview.positions; follows.value = watchlist.items })
  .catch(() => { positionsError.value = true })
  .finally(() => { positionsLoaded.value = true })
const fundInvalid = computed(() => !!code.value && positionsLoaded.value && !positionsError.value
  && !candidates.value.some((item) => item.fundCode === code.value))
const keyword = ref('')
const searchError = ref('')
async function search() {
  searchError.value = ''
  const value = keyword.value.trim()
  if (!value) return
  if (positionsError.value) { searchError.value = '持仓列表暂时无法读取，请稍后重试。'; return }
  try { const result = await getWatchlist({keyword:value,pageSize:50}); follows.value = result.items }
  catch { searchError.value = '关注范围暂时无法读取，请重试。'; return }
  const byCode = candidates.value.find((item) => item.fundCode === value)
  if (byCode) { selectFund(byCode.fundCode); return }
  const byName = candidates.value.filter((item) => item.fundName.includes(value))
  if (byName.length === 1 && byName[0]) { selectFund(byName[0].fundCode); return }
  searchError.value = byName.length > 1
    ? `找到 ${byName.length} 只名称包含「${value}」的持仓基金，请输入基金代码精确选择。`
    : '该基金不在本人持仓、已清仓记录或当前关注中。'
}
/** 切换基金时保留当前分区，丢弃上一份报告的分页、日期与报告定位参数；搜索框保留用户输入。 */
let selectingViaSearch = false
function selectFund(fundCode: string) {
  selectingViaSearch = fundCode !== code.value
  void router.replace({ query: { ...route.query, fund: fundCode, report: undefined, page: undefined, start: undefined, end: undefined } })
}
// 搜索选中的基金保留用户输入；从持仓卡片等入口带基金进入时，搜索框显示当前基金名称。
watch([code, positionsLoaded], () => {
  if (selectingViaSearch) { selectingViaSearch = false; return }
  const current = candidates.value.find((item) => item.fundCode === code.value)
  keyword.value = current ? current.fundName : ''
})
const history = ref<AdviceHistory | null>(null)
const detail = ref<AdviceDetail | null>(null)
const diagnosis = ref<DiagnosisHistory | null>(null)
const expandedDiagnosisId = ref('')
const today = shanghaiDate()
const loading = ref(false)
const generating = ref(false)
const error = ref('')
const message = ref('')
const start = ref('')
const end = ref('')
const page = computed(() => Math.max(1, Math.min(10000, Number(route.query.page) || 1)))
const reportId = computed(() => typeof route.query.report === 'string' ? route.query.report : '')
const showReport = computed(() => section.value === 'latest' || !!reportId.value)
/** 新版历史独立读取；旧版接口的空记录或异常只显示在旧版区域，避免误报新版失败。 */
const viewingLegacyHistory = computed(() => ['history', 'review'].includes(section.value) && !reportId.value)
const canGenerate = computed(() => auth.hasPermission('SIM_PORTFOLIO_SELF_WRITE'))
const stats = computed(() => history.value?.stats)
/** 逐项明细按固定顺序展示，不依赖接口返回顺序；证据为空时如实提示而不是留空。 */
const diagnosisItems = computed(() => [...(diagnosis.value?.latest?.items ?? [])]
  .sort((a, b) => diagnosisItemOrder.indexOf(a.item) - diagnosisItemOrder.indexOf(b.item)))
const diagnosisLatestId = computed(() => diagnosis.value?.latest?.report.reportId ?? '')
function toggleDiagnosisReport(id: string) { expandedDiagnosisId.value = expandedDiagnosisId.value === id ? '' : id }

const draft = ref<RuleDraftView | null>(null)
const holdingRules = ref<HoldingRulesView | null>(null)
const rulePosition = ref<SimPosition | null>(null)
const selectedTier = ref<RuleDraftTier['tier'] | ''>('')
const adjustProfit = ref(0)
const adjustReduce = ref(0)
const confirming = ref(false)
const revoking = ref(false)
const revokeArmed = ref(false)
const generatingDraft = ref(false)
const draftAvailable = computed(() => draft.value?.status === 'AVAILABLE')
const selectedTierDraft = computed(() => draft.value?.tiers.find(item => item.tier === selectedTier.value) ?? null)
/** 未做微调时不提交阈值字段，服务端按草案值处理；有微调即会被记为 CUSTOM 档。 */
const adjustedProfit = computed(() => selectedTierDraft.value ? ruleAdjustedValue(selectedTierDraft.value.takeProfitPct, adjustProfit.value) : null)
const adjustedReduce = computed(() => selectedTierDraft.value ? ruleAdjustedValue(selectedTierDraft.value.reduceDrawdownPct, adjustReduce.value) : null)
const profitAdjusted = computed(() => adjustedProfit.value !== null && selectedTierDraft.value !== null
  && Number(adjustedProfit.value) !== Number(selectedTierDraft.value.takeProfitPct))
const reduceAdjusted = computed(() => adjustedReduce.value !== null && selectedTierDraft.value !== null
  && Number(adjustedReduce.value) !== Number(selectedTierDraft.value.reduceDrawdownPct))
const activeRule = computed(() => holdingRules.value?.active ?? null)
const statsUpdated = computed(() => ruleStatsUpdated(activeRule.value, draft.value))
/** 规则只能由本人对已确认份额显式确认；份额缺失或有核对问题时只展示原因。 */
const ruleBlockReason = computed(() => {
  if (!canGenerate.value) return '当前账户没有确认持仓规则的权限。'
  if (!rulePosition.value) return '该基金当前没有持仓记录，规则草案仅供参考。'
  if (rulePosition.value.issue) return `持仓核对尚未通过：${rulePosition.value.issue}。核对完成前不能确认规则。`
  if (Number(rulePosition.value.shares) <= 0) return '份额尚未确认或已清仓，规则草案仅供参考。'
  return ''
})
const canConfirmRule = computed(() => draftAvailable.value && !ruleBlockReason.value)
function selectTier(tier: RuleDraftTier['tier']) {
  if (!canConfirmRule.value) return
  if (selectedTier.value === tier) return
  selectedTier.value = tier
  adjustProfit.value = 0
  adjustReduce.value = 0
}
function stepProfit(delta: number) { adjustProfit.value += delta }
function stepReduce(delta: number) { adjustReduce.value += delta }
function resetAdjust() { adjustProfit.value = 0; adjustReduce.value = 0 }
async function confirmRule() {
  const tier = selectedTierDraft.value
  if (!tier || confirming.value || !canConfirmRule.value) return
  confirming.value = true; error.value = ''; message.value = ''
  const fund = code.value
  try {
    const request: { tier: string; takeProfitPct?: string; reduceDrawdownPct?: string } = { tier: tier.tier }
    if (profitAdjusted.value && adjustedProfit.value) request.takeProfitPct = adjustedProfit.value
    if (reduceAdjusted.value && adjustedReduce.value) request.reduceDrawdownPct = adjustedReduce.value
    const result = await confirmHoldingRule(fund, request)
    if (!alive || fund !== code.value) return
    holdingRules.value = result
    selectedTier.value = ''; adjustProfit.value = 0; adjustReduce.value = 0
    message.value = '规则已确认并生效，可随时撤销；触发只产生复核提示。'
  } catch (reason) {
    if (alive && fund === code.value) error.value = reason instanceof Error ? reason.message : '规则确认失败，请稍后重试。'
  } finally { if (alive) confirming.value = false }
}
async function revokeRule() {
  if (!revokeArmed.value) { revokeArmed.value = true; return }
  if (revoking.value) return
  revoking.value = true; error.value = ''; message.value = ''
  const fund = code.value
  try {
    const result = await revokeHoldingRule(fund)
    if (!alive || fund !== code.value) return
    holdingRules.value = result
    revokeArmed.value = false
    message.value = '规则已撤销并留痕，相关建议随之降级。'
  } catch (reason) {
    if (alive && fund === code.value) error.value = reason instanceof Error ? reason.message : '撤销结果暂时无法确认，请刷新查看。'
  } finally { if (alive) revoking.value = false }
}
async function regenerateDraft() {
  if (generatingDraft.value) return
  generatingDraft.value = true; error.value = ''; message.value = ''
  const fund = code.value
  try {
    const result = await generateRuleDraft(fund)
    if (!alive || fund !== code.value) return
    draft.value = result
    selectedTier.value = ''; adjustProfit.value = 0; adjustReduce.value = 0
    message.value = '已检查最新统计；统计未变时沿用现有草案，已确认规则不受影响。'
  } catch (reason) {
    if (alive && fund === code.value) error.value = reason instanceof Error ? reason.message : '草案生成失败，请稍后重试。'
  } finally { if (alive) generatingDraft.value = false }
}
let generation = 0
let alive = true

/** 切基金、翻页或选日期时丢弃旧请求，避免把上一只基金的报告显示到当前页面。 */
async function load() {
  const current = ++generation
  loading.value = true; error.value = ''; detail.value = null; history.value = null; diagnosis.value = null
  draft.value = null; holdingRules.value = null; rulePosition.value = null
  selectedTier.value = ''; adjustProfit.value = 0; adjustReduce.value = 0; revokeArmed.value = false
  const fund = code.value
  start.value = typeof route.query.start === 'string' ? route.query.start : ''
  end.value = typeof route.query.end === 'string' ? route.query.end : ''
  if (!fund) { loading.value = false; return }
  // 先确认本人持仓或关注范围；未持仓但已关注的基金继续进入V2分析。
  await positionsReady
  if (!alive || current !== generation) return
  if (fundInvalid.value) { loading.value = false; return }
  try {
    if (section.value === 'diagnosis') {
      const result = await fetchFundDiagnosis(fund, { page: page.value })
      if (!alive || current !== generation) return
      diagnosis.value = result
      expandedDiagnosisId.value = ''
      return
    }
    if (section.value === 'rules') {
      const [draftResult, rulesResult, overview] = await Promise.all([fetchRuleDraft(fund), fetchHoldingRules(fund), getSimOverview()])
      if (!alive || current !== generation) return
      draft.value = draftResult
      holdingRules.value = rulesResult
      rulePosition.value = overview.positions.find(item => item.fundCode === fund) ?? null
      return
    }
    if (section.value === 'latest' || section.value === 'review') return // 结果与效果组件独立读取，不依赖旧V1历史接口。
    const result = await getAdviceHistory(fund, section.value === 'latest' ? 1 : page.value,
      section.value === 'latest' ? '' : start.value, section.value === 'latest' ? '' : end.value)
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
    if (alive && fund === code.value) error.value = reason instanceof Error ? reason.message : '生成结果暂时无法确认，请先刷新记录查看。'
  } finally { if (alive) generating.value = false }
}
function filter() {
  if (start.value && end.value && start.value > end.value) { error.value = '开始日期不能晚于结束日期。'; return }
  void router.replace({ query: { ...route.query, start: start.value || undefined, end: end.value || undefined, page: undefined, report: undefined } })
}
function selectReport(id?: string) { void router.replace({ query: { ...route.query, report: id } }) }
function changePage(value: number) { void router.replace({ query: { ...route.query, page: value, report: undefined } }) }
watch([code, section, () => route.query.page, () => route.query.start, () => route.query.end, reportId], () => void load(), { immediate: true })
onBeforeUnmount(() => { alive = false; generation++ })
</script>

<template>
  <section
    class="sim-page advice-page"
    aria-labelledby="advice-title"
  >
    <form
      class="search-panel"
      @submit.prevent="search"
    >
      <label for="advice-fund-keyword">基金代码或名称</label>
      <div class="search-row">
        <input
          id="advice-fund-keyword"
          v-model="keyword"
          maxlength="50"
          placeholder="例如：000001"
          type="search"
        >
        <button
          class="primary-button"
          type="submit"
        >
          查询基金
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
    <header class="sim-page-header">
      <div>
        <h1 id="advice-title">
          {{ code ? `${history?.fundName || code} · 持仓建议` : '持仓分析' }}
        </h1>
        <p class="sim-muted">
          {{ code ? `${code} · 每天保存当时的建议与依据，日后对照实际表现回看。` : '搜索并选择一只持仓或关注基金，查看它的建议、诊断、规则与回看。' }}
        </p>
      </div>
      <div
        v-if="code && !fundInvalid"
        class="sim-actions"
      >
        <button
          class="secondary-button"
          type="button"
          :disabled="loading || generating"
          @click="load"
        >
          刷新记录
        </button>
        <button
          v-if="canGenerate && section === 'legacy'"
          class="primary-button"
          type="button"
          :disabled="loading || generating"
          @click="generate"
        >
          {{ generating ? '正在检查并留档…' : '更新并留档' }}
        </button>
      </div>
    </header>
    <div
      v-if="!code"
      class="sim-empty"
    >
      <strong>请选择本人持仓或关注的基金</strong>
      <p>在上方输入基金代码或名称；已清仓或仅关注的基金也能获得买入/不建议买入判断。</p>
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
        v-if="error && !viewingLegacyHistory"
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
        v-if="history?.job && ['FAILED', 'PARTIAL'].includes(history.job.status)"
        class="notice-banner"
        role="status"
      >
        {{ history.job.message }} 上次检查：{{ simTime(history.job.attemptedAt) }}
      </p>
      <p
        v-if="diagnosis?.job && ['FAILED', 'PARTIAL'].includes(diagnosis.job.status)"
        class="notice-banner"
        role="status"
      >
        {{ diagnosis.job.message }} 上次检查：{{ simTime(diagnosis.job.attemptedAt) }}
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
      <AutomaticEffectsPanel
        v-else-if="section === 'review'"
        :fund-code="code"
      />
      <template v-else-if="section === 'diagnosis'">
        <template v-if="diagnosis && !loading">
          <template v-if="diagnosis.latest">
            <p
              v-if="diagnosisStale(diagnosis.latest.report.cutoffDate, today)"
              class="notice-banner"
              role="status"
            >
              诊断数据截至 {{ diagnosis.latest.report.cutoffDate ?? '未知日期' }}，距今较久，结论可能未反映最新情况。
            </p>
            <article
              class="advice-conclusion"
              :class="{ 'advice-conclusion-sell': diagnosis.latest.report.verdict !== 'VALID' }"
            >
              <span class="advice-kicker">最新诊断总体结论 · {{ diagnosis.latest.report.reportDate }}</span>
              <h2>
                <span
                  class="diagnosis-verdict"
                  :class="diagnosisVerdictTone(diagnosis.latest.report.verdict)"
                >{{ diagnosisVerdictLabel(diagnosis.latest.report.verdict) }}</span>
              </h2>
              <p>逐项核对「持有理由是否仍成立」。诊断是事实核对，不是涨跌预测；结论供复核参考，不构成投资建议。</p>
              <div class="advice-meta">
                <span>实际留档：{{ simTime(diagnosis.latest.report.generatedAt) }}</span><span v-if="diagnosis.latest.report.cutoffDate">数据截至：{{ diagnosis.latest.report.cutoffDate }}</span>
              </div>
            </article>
            <section
              class="sim-detail-panel"
              aria-labelledby="diagnosis-items-title"
            >
              <h2 id="diagnosis-items-title">
                逐项核对
              </h2>
              <ol class="advice-evidence">
                <li
                  v-for="item in diagnosisItems"
                  :key="item.item"
                  :class="{ 'diagnosis-item-changed': item.verdict === 'CHANGED' }"
                >
                  <div class="advice-evidence-heading">
                    <h3>{{ diagnosisItemLabel(item.item) }}</h3><span
                      class="diagnosis-verdict"
                      :class="diagnosisVerdictTone(item.verdict)"
                    >{{ diagnosisVerdictLabel(item.verdict) }}</span>
                  </div>
                  <p>{{ item.evidence || '未提供具体说明，请以数据来源为准。' }}</p>
                  <div class="sim-muted">
                    来源：{{ item.source }}<template v-if="item.dataAsOfDate">
                      · 数据截至：{{ item.dataAsOfDate }}
                    </template>
                  </div>
                </li>
              </ol>
            </section>
          </template>
          <div
            v-else-if="!diagnosis.reports.items.length"
            class="sim-empty"
          >
            <strong>还没有诊断报告</strong><p>后台每日对持仓逐项核对并留档；首份报告没有可比基线，多数项会如实标记为「数据不足」。</p>
          </div>
          <div
            v-if="diagnosis.reports.items.length"
            class="advice-table-wrap diagnosis-history"
          >
            <table class="advice-table">
              <thead>
                <tr>
                  <th scope="col">
                    报告日期
                  </th><th scope="col">
                    总体结论
                  </th><th scope="col">
                    数据截至
                  </th><th scope="col">
                    详情
                  </th>
                </tr>
              </thead>
              <tbody>
                <template
                  v-for="item in diagnosis.reports.items"
                  :key="item.reportId"
                >
                  <tr>
                    <td>{{ item.reportDate }}<small>{{ simTime(item.generatedAt) }} 留档</small></td>
                    <td>
                      <span
                        class="diagnosis-verdict"
                        :class="diagnosisVerdictTone(item.verdict)"
                      >{{ diagnosisVerdictLabel(item.verdict) }}</span>
                    </td>
                    <td>{{ item.cutoffDate ?? '未提供' }}</td>
                    <td>
                      <button
                        type="button"
                        class="advice-text-button"
                        :aria-expanded="expandedDiagnosisId === item.reportId"
                        @click="toggleDiagnosisReport(item.reportId)"
                      >
                        {{ expandedDiagnosisId === item.reportId ? '收起' : '查看详情' }}
                      </button>
                    </td>
                  </tr>
                  <tr v-if="expandedDiagnosisId === item.reportId">
                    <td colspan="4">
                      <dl class="diagnosis-expanded">
                        <div><dt>报告日期</dt><dd>{{ item.reportDate }}</dd></div>
                        <div><dt>留档时间</dt><dd>{{ simTime(item.generatedAt) }}</dd></div>
                        <div><dt>数据截至</dt><dd>{{ item.cutoffDate ?? '未提供' }}</dd></div>
                        <div><dt>报告编号</dt><dd>{{ item.reportId }}</dd></div>
                      </dl>
                      <p
                        v-if="item.reportId === diagnosisLatestId"
                        class="sim-muted"
                      >
                        这是最新报告，逐项核对明细见上方区块。
                      </p>
                      <p
                        v-else
                        class="sim-muted"
                      >
                        历史报告保留总体结论与留档信息；逐项明细仅最新报告可查。
                      </p>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <div
            v-if="diagnosis.reports.totalCount > 20"
            class="sim-pagination"
          >
            <button
              class="secondary-button"
              type="button"
              :disabled="loading || page <= 1"
              @click="changePage(page - 1)"
            >
              上一页
            </button>
            <span>第 {{ page }} / {{ Math.ceil(diagnosis.reports.totalCount / 20) }} 页</span>
            <button
              class="secondary-button"
              type="button"
              :disabled="loading || page * 20 >= diagnosis.reports.totalCount"
              @click="changePage(page + 1)"
            >
              下一页
            </button>
          </div>
        </template>
        <div
          v-else-if="!loading && !error"
          class="sim-empty"
        >
          <strong>诊断记录暂时无法展示</strong><p>请刷新记录重试；接口异常时不会以「一切正常」代替真实状态。</p>
        </div>
      </template>

      <template v-else-if="section === 'rules'">
        <template v-if="draft && holdingRules && !loading">
          <section
            v-if="activeRule"
            class="sim-detail-panel"
            aria-labelledby="rule-active-title"
          >
            <h2 id="rule-active-title">
              当前生效规则
              <span
                v-if="statsUpdated"
                class="diagnosis-verdict diagnosis-insufficient rule-badge"
              >统计已更新</span>
            </h2>
            <p
              v-if="statsUpdated"
              class="sim-muted"
            >
              草案统计已有新版本（当前统计截至 {{ draft.statsCutoffDate ?? '未知' }}），已确认的阈值不会自动替换；可在下方重新确认。
            </p>
            <dl class="rule-active-detail">
              <div><dt>档位</dt><dd>{{ ruleTierLabel(activeRule.tier) }}</dd></div>
              <div><dt>减仓线（回撤触发）</dt><dd>{{ rulePctText(activeRule.reduceDrawdownPct) }}</dd></div>
              <div><dt>止盈线（收益触发）</dt><dd>{{ rulePctText(activeRule.takeProfitPct) }}</dd></div>
              <div><dt>确认时间</dt><dd>{{ simTime(activeRule.confirmedAt) }}</dd></div>
            </dl>
            <p class="sim-muted">
              规则版本：{{ activeRule.ruleVersion }}<template v-if="!statsUpdated && draft.statsCutoffDate">
                · 来源草案统计截止：{{ draft.statsCutoffDate }}
              </template>
            </p>
            <div class="sim-actions">
              <button
                class="secondary-button"
                type="button"
                :disabled="revoking"
                @click="revokeRule"
              >
                {{ revokeArmed ? '确认撤销？撤销后立即失效并留痕' : '撤销规则' }}
              </button>
              <button
                v-if="revokeArmed"
                class="secondary-button"
                type="button"
                :disabled="revoking"
                @click="revokeArmed = false"
              >
                取消
              </button>
            </div>
          </section>

          <section
            class="sim-detail-panel"
            aria-labelledby="rule-draft-title"
          >
            <h2 id="rule-draft-title">
              规则草案
            </h2>
            <template v-if="draftAvailable">
              <p class="sim-muted">
                依据 {{ draft.historyDays ?? '—' }} 个交易日、{{ draft.windowCount ?? '—' }} 个滚动窗口统计 · 统计截止 {{ draft.statsCutoffDate ?? '未知' }}<template v-if="draft.navBasis">
                  · 净值口径：{{ draft.navBasis }}
                </template>
              </p>
              <p
                v-if="draft.assumption"
                class="sim-muted"
              >
                {{ draft.assumption }}
              </p>
              <p
                v-if="ruleBlockReason"
                class="notice-banner"
                role="status"
              >
                {{ ruleBlockReason }}
              </p>
              <div class="rule-tier-grid">
                <article
                  v-for="tier in draft.tiers"
                  :key="tier.tier"
                  class="rule-tier-card"
                  :class="{ 'rule-tier-selected': selectedTier === tier.tier, 'rule-tier-disabled': !canConfirmRule }"
                >
                  <h3>{{ ruleTierLabel(tier.tier) }}</h3>
                  <dl>
                    <div><dt>减仓线</dt><dd>{{ rulePctText(tier.reduceDrawdownPct) }}</dd></div>
                    <div><dt>止盈线</dt><dd>{{ rulePctText(tier.takeProfitPct) }}</dd></div>
                  </dl>
                  <p class="rule-tier-stats">
                    减仓线：{{ ruleTriggerText(tier.reduceTrigger) }}
                  </p>
                  <p class="rule-tier-stats">
                    止盈线：{{ ruleTriggerText(tier.takeProfitTrigger) }}
                  </p>
                  <button
                    class="secondary-button"
                    type="button"
                    :disabled="!canConfirmRule"
                    @click="selectTier(tier.tier)"
                  >
                    {{ selectedTier === tier.tier ? '已选中' : '选择此档' }}
                  </button>
                </article>
              </div>
              <div
                v-if="selectedTier && selectedTierDraft"
                class="rule-adjust"
              >
                <h3>微调「{{ ruleTierLabel(selectedTier) }}」档阈值（限草案值 ±20% 步进）</h3>
                <div class="rule-stepper">
                  <span>减仓线</span>
                  <button
                    class="secondary-button"
                    type="button"
                    :disabled="-adjustReduce >= ruleAdjustMaxSteps(selectedTierDraft.reduceDrawdownPct)"
                    @click="stepReduce(-1)"
                  >
                    更深
                  </button>
                  <strong>{{ rulePctText(adjustedReduce) }}</strong>
                  <button
                    class="secondary-button"
                    type="button"
                    :disabled="adjustReduce >= ruleAdjustMaxSteps(selectedTierDraft.reduceDrawdownPct)"
                    @click="stepReduce(1)"
                  >
                    更浅
                  </button>
                </div>
                <div class="rule-stepper">
                  <span>止盈线</span>
                  <button
                    class="secondary-button"
                    type="button"
                    :disabled="adjustProfit >= ruleAdjustMaxSteps(selectedTierDraft.takeProfitPct)"
                    @click="stepProfit(-1)"
                  >
                    更低
                  </button>
                  <strong>{{ rulePctText(adjustedProfit) }}</strong>
                  <button
                    class="secondary-button"
                    type="button"
                    :disabled="adjustProfit >= ruleAdjustMaxSteps(selectedTierDraft.takeProfitPct)"
                    @click="stepProfit(1)"
                  >
                    更高
                  </button>
                </div>
                <p
                  v-if="profitAdjusted || reduceAdjusted"
                  class="sim-muted"
                >
                  已微调草案值，确认后记为「自定义」档。<button
                    type="button"
                    class="advice-text-button"
                    @click="resetAdjust"
                  >
                    恢复草案值
                  </button>
                </p>
                <div class="sim-actions">
                  <button
                    class="primary-button"
                    type="button"
                    :disabled="confirming"
                    @click="confirmRule"
                  >
                    {{ confirming ? '正在确认…' : '确认此规则' }}
                  </button>
                  <button
                    class="secondary-button"
                    type="button"
                    :disabled="confirming"
                    @click="selectedTier = ''"
                  >
                    取消选择
                  </button>
                </div>
                <p class="sim-muted">
                  规则由本人确认后生效，可随时撤销；确认前草案只是参考数字，不参与任何建议。
                </p>
              </div>
              <div
                v-if="canGenerate"
                class="sim-actions"
              >
                <button
                  class="secondary-button"
                  type="button"
                  :disabled="generatingDraft"
                  @click="regenerateDraft"
                >
                  {{ generatingDraft ? '正在检查统计…' : '重新生成草案' }}
                </button>
              </div>
            </template>
            <template v-else>
              <p class="notice-banner">
                {{ draft.status === 'NOT_APPLICABLE' ? '该类别暂不适用此类规则。' : '草案数据不足。' }}{{ draft.reason || '未提供具体原因。' }}
              </p>
              <p class="sim-muted">
                数据不足时不提供阈值数字，也不建议凭感觉填写。
              </p>
              <div
                v-if="canGenerate"
                class="sim-actions"
              >
                <button
                  class="secondary-button"
                  type="button"
                  :disabled="generatingDraft"
                  @click="regenerateDraft"
                >
                  {{ generatingDraft ? '正在检查统计…' : '重新检查数据' }}
                </button>
              </div>
            </template>
          </section>

          <section
            v-if="holdingRules.history.length"
            class="sim-detail-panel"
            aria-labelledby="rule-history-title"
          >
            <h2 id="rule-history-title">
              确认历史
            </h2>
            <div class="advice-table-wrap">
              <table class="advice-table">
                <thead>
                  <tr>
                    <th scope="col">
                      确认时间
                    </th><th scope="col">
                      档位与阈值
                    </th><th scope="col">
                      状态
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in holdingRules.history"
                    :key="item.ruleId"
                  >
                    <td>{{ simTime(item.confirmedAt) }}</td>
                    <td>
                      <strong>{{ ruleTierLabel(item.tier) }}</strong>
                      <p>减仓线 {{ rulePctText(item.reduceDrawdownPct) }} · 止盈线 {{ rulePctText(item.takeProfitPct) }}</p>
                    </td>
                    <td>
                      {{ ruleStatusLabel(item) }}<small v-if="item.supersededAt">{{ simTime(item.supersededAt) }}</small>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <p class="sim-muted">
            止盈线、减仓线触发只产生复核提示，不构成投资建议，是否操作由本人决定。
          </p>
        </template>
        <div
          v-else-if="!loading && !error"
          class="sim-empty"
        >
          <strong>规则草案暂时无法展示</strong><p>请刷新记录重试；数据不足时会如实显示原因，不会给出伪造的阈值。</p>
        </div>
      </template>

      <template v-else-if="!showReport">
        <DecisionPanelV2
          :fund-code="code"
          history-only
        />
        <h2>旧版二十日建议历史（V1）</h2>
        <p class="sim-muted">
          以下日期筛选和统计只针对旧版报告，不计入新综合策略的效果。
        </p>
        <p
          v-if="error"
          class="notice-banner"
          role="status"
        >
          旧版记录：{{ error }}
        </p>
        <form
          class="advice-filter"
          @submit.prevent="filter"
        >
          <label>开始日期<input
            v-model="start"
            type="date"
            :max="shanghaiDate()"
          ></label>
          <label>结束日期<input
            v-model="end"
            type="date"
            :max="shanghaiDate()"
          ></label>
          <button
            class="secondary-button"
            type="submit"
            :disabled="loading"
          >
            按日期查看
          </button>
        </form>
        <template v-if="section === 'review' && stats">
          <div class="advice-stats">
            <article><span>独立建议样本</span><strong>{{ stats.samples }}</strong><small>沿用记录不重复计算</small></article>
            <article><span>已完成核验</span><strong>{{ stats.assessed }}</strong><small>另有 {{ stats.pending }} 份等待核验</small></article>
            <article><span>后续表现支持</span><strong>{{ stats.supported }}</strong><small>不支持 {{ stats.unsupported }} · 持平 {{ stats.flat }}</small></article>
          </div>
          <p class="advice-review-note">
            持有后区间回报为正、卖出后区间回报为负，分别记为后续表现支持；零回报单列持平。
            回报采用现金分红再投资口径，未计申赎费和资金机会成本，不代表实际交易盈亏。
            每日观察区间存在重叠，统计供回看。当前规则：{{ stats.ruleVersion }}。
          </p>
          <p class="sim-muted">
            当前筛选共 {{ stats.reports }} 份留档，其中 {{ stats.carried }} 份沿用，{{ stats.noAdvice }} 份未形成建议。
          </p>
        </template>
        <div
          v-if="history?.reports.items.length"
          class="advice-table-wrap"
        >
          <table class="advice-table">
            <thead>
              <tr>
                <th scope="col">
                  留档时间
                </th><th scope="col">
                  当时建议与主要理由
                </th><th scope="col">
                  后续表现
                </th><th scope="col">
                  原始报告
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in history.reports.items"
                :key="item.reportId"
              >
                <td>{{ simTime(item.generatedAt) }}<small v-if="item.originalReportId">沿用已有判断</small></td>
                <td><strong>{{ adviceLabel(item.decision) }}</strong><p>{{ item.summary }}</p></td>
                <td>
                  <span
                    v-if="item.totalReturn !== null"
                    :class="simTone(item.totalReturn)"
                  >{{ simPercent(item.totalReturn) }}</span><small>{{ reviewLabel(item) }}</small>
                </td>
                <td>
                  <button
                    type="button"
                    class="advice-text-button"
                    @click="selectReport(item.reportId)"
                  >
                    查看原报告
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-else-if="!loading && !error"
          class="sim-empty"
        >
          <strong>当前日期范围没有建议记录</strong><p>每天生成的内容会保留在这里，同一天的不同版本也可以逐份查看。</p>
        </div>
        <div
          v-if="history && history.reports.totalCount > 20"
          class="sim-pagination"
        >
          <button
            class="secondary-button"
            type="button"
            :disabled="loading || page <= 1"
            @click="changePage(page - 1)"
          >
            上一页
          </button>
          <span>第 {{ page }} / {{ Math.ceil(history.reports.totalCount / 20) }} 页</span>
          <button
            class="secondary-button"
            type="button"
            :disabled="loading || page * 20 >= history.reports.totalCount"
            @click="changePage(page + 1)"
          >
            下一页
          </button>
        </div>
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
              <div class="sim-muted">
                来源：{{ item.source }}<template v-if="item.sourceDate">
                  · {{ item.sourceDate }}
                </template>
                <a
                  v-if="evidenceUrl(item.sourceUrl)"
                  :href="evidenceUrl(item.sourceUrl)"
                  target="_blank"
                  rel="noopener noreferrer"
                >查看原文</a>
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
          <p
            v-if="detail.outcome?.evidenceHash"
            class="sim-muted"
          >
            核验来源版本：{{ detail.outcome.evidenceHash }}
          </p>
        </details>
      </template>
      <div
        v-else-if="showReport && !loading && !error"
        class="sim-empty"
      >
        <strong>还没有保存的建议</strong><p>每天北京时间 08:30 起，后台会检查持仓并留档。也可以点击“更新并留档”保存当前判断。</p>
      </div>
      <p class="advice-schedule sim-muted">
        每日自动留档 · 同日内容变化追加版本 · 原文保留 · 停机期间不补造历史报告
      </p>
    </template>
  </section>
</template>

<style scoped>
.advice-conclusion { background: #edf6f1; border: 1px solid #d3e5da; border-radius: 10px; padding: 25px; margin-top: 14px; }
.advice-conclusion-sell { background: #fbf6ee; border-color: #e8dcc8; }
.advice-kicker { font-size: 13px; color: #566e60; }.advice-conclusion h2 { font-size: 26px; margin: 10px 0; }.advice-conclusion p { font-size: 16px; line-height: 1.85; max-width: 900px; }
.advice-meta { display: flex; flex-wrap: wrap; gap: 8px 24px; color: #586f64; font-size: 13px; }
.advice-evidence { list-style: none; padding: 0; margin-bottom: 0; }.advice-evidence > li { padding: 20px 0; border-bottom: 1px solid #e4ebe6; }.advice-evidence > li:last-child { border-bottom: 0; }
.advice-evidence-heading { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }.advice-evidence-heading > span { color: #326a56; background: #edf5ef; padding: 4px 8px; border-radius: 4px; font-size: 12px; }.advice-evidence-heading .advice-against { color: #825621; background: #fbf1df; }
.advice-evidence p, .sim-detail-panel > p { line-height: 1.85; color: #385247; }.advice-evidence a { margin-left: 12px; color: #0f766e; }
.advice-gaps { border-top: 1px solid #dfe8e3; padding-top: 20px; margin-top: 4px; }.advice-gaps li { margin: 8px 0; line-height: 1.8; color: #53685d; }.advice-gaps ul { padding-left: 20px; }
.advice-filter { display: flex; align-items: end; gap: 14px; flex-wrap: wrap; margin: 16px 0 22px; }.advice-filter label { display: flex; gap: 8px; flex-direction: column; color: #53695e; font-size: 13px; }.advice-filter input { padding: 10px; border: 1px solid #cad9d0; border-radius: 6px; background: #fff; color: #203a34; font: inherit; }
.advice-table-wrap { overflow-x: auto; background: #fff; border: 1px solid #dde7df; border-radius: 10px; }.advice-table { width: 100%; border-collapse: collapse; font-size: 14px; }.advice-table th { padding: 15px 18px; text-align: left; color: #5b7165; font-weight: 500; background: #f6f9f6; }.advice-table td { padding: 18px; border-top: 1px solid #e4ebe5; vertical-align: top; }.advice-table td:first-child { width: 170px; }.advice-table td:nth-child(3) { width: 145px; }.advice-table td:last-child { width: 110px; }.advice-table p { margin: 9px 0 0; color: #546c5e; line-height: 1.7; }.advice-table small { display: block; color: #657a6d; font-size: 12px; margin-top: 8px; }
.advice-text-button { background: transparent; color: #08776b; border: 0; padding: 8px 0; cursor: pointer; font: inherit; min-height: 36px; text-align: left; }
.advice-stats { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; }.advice-stats article { padding: 20px; background: #fff; border: 1px solid #dfe8e3; border-radius: 10px; }.advice-stats strong { display: block; font-size: 30px; margin: 10px 0; font-variant-numeric: tabular-nums; }.advice-stats span, .advice-stats small { color: #5b7264; }.advice-stats small { display: block; }
.advice-review-note { color: #51695b; line-height: 1.9; font-size: 14px; }.advice-outcome { display: flex; align-items: center; gap: 18px; margin: 18px 0; }.advice-outcome strong { font-size: 30px; font-variant-numeric: tabular-nums; }
.advice-archive summary { cursor: pointer; }.advice-archive dl { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 16px; }.advice-archive dt { color: #657a6e; font-size: 13px; }.advice-archive dd { margin: 8px 0; }.advice-archive p { overflow-wrap: anywhere; }.advice-schedule { margin-top: 24px; }
.diagnosis-verdict { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 14px; }
h2 > .diagnosis-verdict { font-size: 22px; padding: 6px 14px; }
.diagnosis-valid { color: #326a56; background: #edf5ef; }.diagnosis-changed { color: #9a3b3b; background: #fbeaea; }.diagnosis-insufficient { color: #825621; background: #fbf1df; }.diagnosis-unknown { color: #5b6b62; background: #eef1ee; }
.diagnosis-item-changed { background: #fdf6f0; margin: 0 -12px; padding-left: 12px !important; padding-right: 12px; border-radius: 8px; }
.diagnosis-history { margin-top: 22px; }.diagnosis-expanded { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 16px; margin: 0 0 12px; }.diagnosis-expanded dt { color: #657a6e; font-size: 13px; }.diagnosis-expanded dd { margin: 8px 0; overflow-wrap: anywhere; }
.rule-badge { margin-left: 12px; font-size: 13px; vertical-align: middle; }
.rule-active-detail { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 16px; margin: 12px 0; }.rule-active-detail dt { color: #657a6e; font-size: 13px; }.rule-active-detail dd { margin: 8px 0; font-variant-numeric: tabular-nums; }
.rule-tier-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; margin: 16px 0; }
.rule-tier-card { padding: 20px; background: #fff; border: 1px solid #dfe8e3; border-radius: 10px; display: flex; flex-direction: column; gap: 10px; }
.rule-tier-selected { border-color: #13796e; box-shadow: 0 0 0 1px #13796e; }
.rule-tier-disabled { opacity: 0.75; }
.rule-tier-card h3 { margin: 0; }.rule-tier-card dl { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; margin: 0; }.rule-tier-card dt { color: #657a6e; font-size: 13px; }.rule-tier-card dd { margin: 6px 0 0; font-size: 18px; font-variant-numeric: tabular-nums; }
.rule-tier-stats { margin: 0; color: #546c5e; line-height: 1.7; font-size: 13px; }
.rule-tier-card .secondary-button { margin-top: auto; }
.rule-adjust { border-top: 1px solid #dfe8e3; padding-top: 16px; margin-top: 4px; }
.rule-stepper { display: flex; align-items: center; gap: 14px; margin: 12px 0; flex-wrap: wrap; }.rule-stepper > span { color: #53695e; min-width: 60px; }.rule-stepper strong { min-width: 110px; text-align: center; font-variant-numeric: tabular-nums; }
@media(max-width: 800px) { .advice-table { min-width: 680px; }.advice-archive dl, .diagnosis-expanded, .rule-active-detail { grid-template-columns: repeat(2,minmax(0,1fr)); }.rule-tier-grid { grid-template-columns: 1fr; } }
@media(max-width: 580px) { .advice-stats { grid-template-columns: 1fr; }.advice-conclusion { padding: 18px; }.advice-conclusion h2 { font-size: 23px; }.advice-filter { align-items: stretch; }.advice-filter label { flex: 1; min-width: 130px; }.advice-filter input { font-size: 16px; width: 100%; box-sizing: border-box; }.advice-text-button { min-height: 44px; } }
</style>
