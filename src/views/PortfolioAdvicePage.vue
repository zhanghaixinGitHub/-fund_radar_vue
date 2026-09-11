<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { generateAdvice, getAdviceHistory, getAdviceReport } from '@/api/advice'
import { usePageNavigation } from '@/composables/usePageNavigation'
import { useAuthStore } from '@/stores/auth'
import type { AdviceDetail, AdviceHistory } from '@/types/advice'
import { adviceLabel, evidenceUrl, reviewLabel } from '@/utils/advice'
import { shanghaiDate, simMoney, simPercent, simShares, simTime, simTone } from '@/utils/simulation'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { section } = usePageNavigation()
const code = computed(() => String(route.params.fundCode ?? ''))
const history = ref<AdviceHistory | null>(null)
const detail = ref<AdviceDetail | null>(null)
const loading = ref(false)
const generating = ref(false)
const error = ref('')
const message = ref('')
const start = ref('')
const end = ref('')
const page = computed(() => Math.max(1, Math.min(10000, Number(route.query.page) || 1)))
const reportId = computed(() => typeof route.query.report === 'string' ? route.query.report : '')
const showReport = computed(() => section.value === 'latest' || !!reportId.value)
const canGenerate = computed(() => auth.hasPermission('SIM_PORTFOLIO_SELF_WRITE'))
const stats = computed(() => history.value?.stats)
let generation = 0
let alive = true

/** 切基金、翻页或选日期时丢弃旧请求，避免把上一只基金的报告显示到当前页面。 */
async function load() {
  const current = ++generation
  loading.value = true; error.value = ''; detail.value = null; history.value = null
  const fund = code.value
  start.value = typeof route.query.start === 'string' ? route.query.start : ''
  end.value = typeof route.query.end === 'string' ? route.query.end : ''
  try {
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
    <header class="sim-page-header">
      <div>
        <h1 id="advice-title">
          {{ history?.fundName || code }} · 持仓建议
        </h1>
        <p class="sim-muted">
          {{ code }} · 每天保存当时的建议与依据，日后对照实际表现回看。
        </p>
      </div>
      <div class="sim-actions">
        <button
          class="secondary-button"
          type="button"
          :disabled="loading || generating"
          @click="load"
        >
          刷新记录
        </button>
        <button
          v-if="canGenerate && section === 'latest'"
          class="primary-button"
          type="button"
          :disabled="loading || generating"
          @click="generate"
        >
          {{ generating ? '正在检查并留档…' : '更新并留档' }}
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

    <template v-if="!showReport">
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
@media(max-width: 800px) { .advice-table { min-width: 680px; }.advice-archive dl { grid-template-columns: repeat(2,minmax(0,1fr)); } }
@media(max-width: 580px) { .advice-stats { grid-template-columns: 1fr; }.advice-conclusion { padding: 18px; }.advice-conclusion h2 { font-size: 23px; }.advice-filter { align-items: stretch; }.advice-filter label { flex: 1; min-width: 130px; }.advice-filter input { font-size: 16px; width: 100%; box-sizing: border-box; }.advice-text-button { min-height: 44px; } }
</style>
