<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFundDocuments, getFundMaterials } from '@/api/fundMaterials'
import type { FundDocuments, FundMaterials } from '@/types/fundMaterials'

const props = defineProps<{ fundCode: string; view: string; watched?: boolean }>()
const route = useRoute()
const router = useRouter()
const data = ref<FundMaterials | null>(null)
const docs = ref<FundDocuments | null>(null)
const loading = ref(false)
const docLoading = ref(false)
const error = ref('')
const docError = ref('')
const reportId = ref('')
const stockCode = ref('')
const kind = ref('all')
const keyword = ref('')
const latestOnly = ref(Boolean(props.watched))
const page = ref(1)
let sequence = 0
let docSequence = 0
const report = computed(() => data.value?.report)
const company = computed(() => data.value?.company)
const currentCompanies = computed(() => data.value?.companies.filter(c => c.latestHeld) ?? [])
const pastCompanies = computed(() => data.value?.companies.filter(c => !c.latestHeld) ?? [])
const money = (n: number | null | undefined) => n == null ? '暂缺' : `${(n / 100_000_000).toLocaleString('zh-CN', { maximumFractionDigits: 2 })} 亿`
const pct = (n: number | null | undefined) => n == null ? '暂缺' : `${n.toFixed(2)}%`
const title = computed(() => ({ overview: props.watched ? '近期动态与持仓' : '投资方向与动态', holdings: '基金持仓', company: '持仓公司经营', documents: '公告与动态' })[props.view] ?? '基金资料')

/** 每次切换基金清除旧结果；请求序号阻止较慢的旧请求覆盖新基金资料。 */
async function load() {
  const ticket = ++sequence
  loading.value = true
  error.value = ''
  data.value = null
  try {
    const result = await getFundMaterials(props.fundCode, reportId.value, stockCode.value)
    if (ticket !== sequence) return
    data.value = result
    if (props.view === 'company' && !stockCode.value && result.report?.holdings[0]) {
      stockCode.value = result.report.holdings[0].stockCode
      await load()
      return
    }
    if (props.view === 'overview' || props.view === 'documents') void loadDocuments()
  } catch {
    if (ticket === sequence) error.value = '基金补充资料暂时无法加载，请重试。'
  } finally {
    if (ticket === sequence) loading.value = false
  }
}

async function loadDocuments() {
  const ticket = ++docSequence
  docLoading.value = true
  docError.value = ''
  docs.value = null
  const query: Record<string, string> = {
    page: String(page.value), pageSize: props.view === 'overview' ? '3' : '20',
    kind: kind.value, keyword: keyword.value.trim(), latestOnly: String(latestOnly.value),
  }
  if (stockCode.value) query.stockCode = stockCode.value
  try {
    const result = await getFundDocuments(props.fundCode, query)
    if (ticket === docSequence) docs.value = result
  } catch {
    if (ticket === docSequence) docError.value = '公告暂时无法加载，请重试。'
  } finally {
    if (ticket === docSequence) docLoading.value = false
  }
}
function searchDocuments() {
  if (kind.value === 'fund' || kind.value === 'news') stockCode.value = ''
  if (stockCode.value) latestOnly.value = false
  page.value = 1; void loadDocuments()
}
function turnPage(delta: number) { page.value += delta; void loadDocuments() }
function navigate(section: string, code = '') {
  void router.push({ path: route.path, query: { ...route.query, section, stock: code || undefined } })
}
watch(() => [props.fundCode, props.view, route.query.stock], () => {
  ++sequence; ++docSequence
  reportId.value = ''; stockCode.value = typeof route.query.stock === 'string' ? route.query.stock : ''
  kind.value = 'all'; keyword.value = ''; page.value = 1
  docs.value = null; docError.value = ''; docLoading.value = false
  latestOnly.value = !stockCode.value && (props.view === 'overview' || Boolean(props.watched))
  void load()
}, { immediate: true })
</script>

<template>
  <section
    class="materials-panel analysis-section"
    aria-labelledby="materials-title"
  >
    <div class="section-heading">
      <h2 id="materials-title">
        {{ title }}
      </h2>
      <span
        v-if="data?.asOfDate"
        class="section-note"
      >资料收集截至 {{ data.asOfDate }}</span>
    </div>
    <p
      v-if="loading"
      role="status"
      class="state-message"
    >
      正在加载资料…
    </p>
    <p
      v-else-if="error"
      role="alert"
      class="state-message error-message"
    >
      {{ error }} <button
        type="button"
        @click="load"
      >
        重试
      </button>
    </p>
    <p
      v-else-if="!data?.available"
      class="empty-analysis"
    >
      {{ data?.notice }}
    </p>
    <template v-else>
      <template v-if="view === 'overview' && report">
        <p class="materials-note">
          {{ report.endDate }} 披露持仓：股票占净资产 <strong>{{ pct(report.stockWeightPct) }}</strong>，前几大持仓为 {{ report.holdings.slice(0, 3).map(h => h.stockName).join('、') }}。持仓可能已发生变化。
        </p>
        <button
          type="button"
          class="material-link"
          @click="navigate('holdings')"
        >
          查看持仓与行业分布 →
        </button>
      </template>

      <template v-if="view === 'holdings' && report">
        <label class="material-field">选择报告
          <select
            v-model="reportId"
            @change="load"
          >
            <option value="">最新披露</option>
            <option
              v-for="r in data.reports"
              :key="r.id"
              :value="r.id"
            >{{ r.title }}</option>
          </select>
        </label>
        <p class="materials-note">
          持仓截至 <strong>{{ report.endDate }}</strong>，报告公布于 {{ report.publishedDate }}。{{ report.fullDisclosure ? '本报告披露全部股票持仓。' : '本报告仅披露部分股票持仓。' }} 不代表实时持仓。
        </p>
        <div class="material-stat-line">
          <span>股票仓位 <strong>{{ pct(report.stockWeightPct) }}</strong></span>
          <span>已披露股票 <strong>{{ report.holdings.length }} 只</strong></span>
          <a
            v-if="report.sourceUrl"
            :href="report.sourceUrl"
            target="_blank"
            rel="noopener noreferrer"
          >查看报告原文 ↗</a>
        </div>
        <div class="material-table-wrap">
          <table class="material-table">
            <caption>股票持仓 · 占基金净资产比例</caption>
            <thead>
              <tr>
                <th scope="col">
                  股票
                </th><th scope="col">
                  占比
                </th><th scope="col">
                  持仓市值（元）
                </th><th scope="col">
                  相关资料
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="h in report.holdings"
                :key="h.stockCode"
              >
                <td><strong>{{ h.stockName }}</strong><small>{{ h.stockCode }}</small></td>
                <td>{{ pct(h.weightPct) }}</td><td>{{ money(h.marketValue) }}</td>
                <td class="material-actions">
                  <button
                    type="button"
                    @click="navigate('company', h.stockCode)"
                  >
                    经营情况
                  </button><button
                    type="button"
                    @click="navigate('documents', h.stockCode)"
                  >
                    公告
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="allocation-columns">
          <div>
            <h3>资产配置 <small>占总资产</small></h3>
            <div
              v-for="a in report.assets"
              :key="a.name"
              class="allocation-row"
            >
              <span>{{ a.name }}</span><strong>{{ pct(a.weightPct) }}</strong>
            </div>
          </div>
          <div>
            <h3>行业分布 <small>占净资产</small></h3>
            <div
              v-for="a in report.industries"
              :key="a.name"
              class="allocation-row"
            >
              <span>{{ a.name }}</span><strong>{{ pct(a.weightPct) }}</strong>
            </div>
            <p class="materials-note">
              按基金报告的行业分类展示，不能据此推断更细的行业比例。
            </p>
          </div>
        </div>
      </template>

      <template v-if="view === 'company'">
        <label class="material-field">选择公司
          <select
            v-model="stockCode"
            @change="load"
          >
            <optgroup label="最新报告披露的持仓"><option
              v-for="c in currentCompanies"
              :key="c.stockCode"
              :value="c.stockCode"
            >{{ c.stockName }} · {{ c.stockCode }}</option></optgroup>
            <optgroup label="历史报告曾披露的持仓"><option
              v-for="c in pastCompanies"
              :key="c.stockCode"
              :value="c.stockCode"
            >{{ c.stockName }} · {{ c.stockCode }}</option></optgroup>
          </select>
        </label>
        <template v-if="company">
          <p class="materials-note">
            {{ company.latestHeld ? '最新基金报告披露持有该公司，实际持仓可能已变化。' : '该公司出现在历史持仓报告中，最新报告未披露持有，不能当作当前持仓。' }}
          </p>
          <p
            v-if="company.quote?.close != null"
            class="material-stat-line"
          >
            <span>{{ company.quote.date }} 收盘价 <strong>{{ company.quote.close.toFixed(2) }} 元</strong></span>
            <span>当日涨跌 <strong>{{ pct(company.quote.changePct) }}</strong></span>
          </p>
          <div class="section-heading">
            <h3>{{ company.stockName }} · 财务表现</h3><button
              type="button"
              class="material-link"
              @click="navigate('documents', stockCode)"
            >
              查看公司公告 →
            </button>
          </div>
          <p class="materials-note">
            来源：{{ company.sourceName }}。{{ company.notice }}
          </p>
          <div
            v-if="company.history.length"
            class="material-table-wrap"
          >
            <table class="material-table financial-table">
              <caption>最近已取得的财务期间 · 金额换算为亿元显示</caption>
              <thead><tr><th>报告期末</th><th>营业收入</th><th>收入同比</th><th>归母净利润</th><th>利润同比</th><th>经营现金净流量</th><th>总资产</th><th>来源公告日</th></tr></thead>
              <tbody>
                <tr
                  v-for="f in company.history"
                  :key="f.endDate"
                >
                  <td>{{ f.endDate }}</td><td>{{ money(f.revenue) }}</td><td>{{ pct(f.revenueGrowthPct) }}</td><td>{{ money(f.netProfit) }}</td><td>{{ pct(f.netProfitGrowthPct) }}</td><td>{{ money(f.operatingCashflow) }}</td><td>{{ money(f.totalAssets) }}</td><td>{{ f.publishedDate || '暂缺' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p
            v-else
            class="empty-analysis"
          >
            暂缺可按同一期间核对的财务摘要。
          </p>
          <details
            v-if="company.business.length"
            class="business-details"
          >
            <summary>主营业务构成 · {{ company.business[0]?.endDate }}</summary>
            <p class="materials-note">
              按来源逐项列示；产品和地区口径可能重叠，不计算合计。缺失币种不换算。
            </p>
            <ul class="business-list">
              <li
                v-for="(b, i) in company.business"
                :key="i"
              >
                <span>{{ b.name }}</span><span>{{ b.currency === 'CNY' ? `${money(b.sales)}元` : `${b.sales?.toLocaleString('zh-CN') ?? '暂缺'} ${b.currency ?? '币种暂缺'}` }}</span>
              </li>
            </ul>
          </details>
          <details
            v-if="company.disclosures?.length"
            class="business-details"
          >
            <summary>业绩预告、审计及分红动态</summary>
            <ul class="material-document-list">
              <li
                v-for="(d, i) in company.disclosures"
                :key="i"
              >
                <div class="document-meta">
                  <time>{{ d.publishedDate || '日期暂缺' }}</time><span>{{ d.category }}</span><span v-if="d.endDate">对应报告期末 {{ d.endDate }}</span>
                </div>
                <p>{{ d.summary }}</p>
              </li>
            </ul>
          </details>
        </template>
      </template>

      <template v-if="view === 'documents' || view === 'overview'">
        <form
          v-if="view === 'documents'"
          class="material-filters"
          @submit.prevent="searchDocuments"
        >
          <label>资料类别<select
            v-model="kind"
            @change="searchDocuments"
          ><option value="all">全部资料</option><option value="fund">基金公告与文件</option><option value="company">持仓公司公告</option><option value="news">基金公司新闻</option></select></label>
          <label>关联公司<select
            v-model="stockCode"
            @change="searchDocuments"
          ><option value="">全部公司</option><optgroup label="最新披露持仓"><option
            v-for="c in currentCompanies"
            :key="c.stockCode"
            :value="c.stockCode"
          >{{ c.stockName }}</option></optgroup><optgroup label="历史披露持仓"><option
            v-for="c in pastCompanies"
            :key="c.stockCode"
            :value="c.stockCode"
          >{{ c.stockName }}</option></optgroup></select></label>
          <label class="material-search">标题搜索<input
            v-model="keyword"
            maxlength="80"
            placeholder="输入公告关键词"
          ></label><button
            type="submit"
            :disabled="docLoading"
          >
            搜索
          </button>
          <label class="material-checkbox"><input
            v-model="latestOnly"
            type="checkbox"
            @change="searchDocuments"
          >公司公告仅看最新报告持仓</label>
        </form>
        <p
          v-if="view === 'documents'"
          class="materials-note"
        >
          以下为已保存资料的原始标题和来源。基金公司新闻不等于持仓公司的全部新闻；公告尚未形成经核对的事件解读。
        </p>
        <p
          v-if="docLoading"
          role="status"
          class="state-message"
        >
          正在加载公告…
        </p>
        <p
          v-else-if="docError"
          role="alert"
        >
          {{ docError }} <button
            type="button"
            @click="loadDocuments"
          >
            重试
          </button>
        </p>
        <ul
          v-else-if="docs?.items.length"
          class="material-document-list"
        >
          <li
            v-for="d in docs.items"
            :key="d.id"
          >
            <div class="document-meta">
              <time>{{ d.publishedDate || '日期暂缺' }}</time><span>{{ d.stockName || (d.kind === 'news' ? '基金公司新闻' : '基金公告与文件') }}</span><span v-if="d.kind === 'company'">{{ d.latestHeld ? '最新披露持仓关联' : '历史持仓关联' }}</span>
            </div>
            <a
              v-if="d.sourceUrl"
              :href="d.sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
            >{{ d.title }} ↗</a><strong v-else>{{ d.title }}</strong>
            <p class="document-source">
              {{ d.sourceName }} · {{ d.dateNote }}<span v-if="!d.textComplete"> · 部分文字待核对，可查看原文</span>
            </p>
          </li>
        </ul>
        <p
          v-else
          class="empty-analysis"
        >
          当前筛选下暂无已收集的资料。
        </p>
        <button
          v-if="view === 'overview'"
          type="button"
          class="material-link"
          @click="navigate('documents')"
        >
          查看全部公告与动态 →
        </button>
        <div
          v-else-if="docs"
          class="material-pagination"
        >
          <span>共 {{ docs.total.toLocaleString('zh-CN') }} 条 · 第 {{ docs.page }} / {{ Math.max(1, Math.ceil(docs.total / docs.pageSize)) }} 页</span><button
            type="button"
            :disabled="page <= 1 || docLoading"
            @click="turnPage(-1)"
          >
            上一页
          </button><button
            type="button"
            :disabled="page * docs.pageSize >= docs.total || docLoading"
            @click="turnPage(1)"
          >
            下一页
          </button>
        </div>
      </template>
    </template>
  </section>
</template>

<style scoped>
.materials-panel { min-width: 0; }
.materials-note, .document-source { color: var(--text-muted, #526a6b); font-size: .9rem; line-height: 1.7; }
.material-field { display: grid; gap: .5rem; max-width: 44rem; margin: 1rem 0; }
select, input { font: inherit; padding: .65rem .75rem; border: 1px solid #c9d9d6; border-radius: 6px; background: white; color: #173c40; min-width: 0; }
select { max-width: 100%; }
button { font: inherit; cursor: pointer; }
button:disabled { cursor: default; opacity: .45; }
button:focus-visible, a:focus-visible, select:focus-visible, input:focus-visible { outline: 3px solid #70b5aa; outline-offset: 3px; }
.material-link, .material-actions button { border: 0; padding: .35rem 0; background: transparent; color: #087e79; text-align: left; }
.material-stat-line { display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: center; margin: 1.4rem 0; }
.material-stat-line strong { font-size: 1.2rem; margin-left: .4rem; }
.material-table-wrap { overflow-x: auto; margin: 1rem 0 1.6rem; }
.material-table { width: 100%; border-collapse: collapse; text-align: left; font-variant-numeric: tabular-nums; }
.material-table caption { text-align: left; color: #526a6b; font-size: .85rem; padding-bottom: .75rem; }
.material-table th { background: #f0f6f4; font-weight: 600; }
.material-table td, .material-table th { padding: .85rem 1rem; border-bottom: 1px solid #e0eae7; white-space: nowrap; }
.material-table small { display: block; color: #677c7b; margin-top: .2rem; }
.material-actions { display: flex; gap: 1rem; }
.financial-table { font-size: .9rem; }
.allocation-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; }
.allocation-columns h3 small { font-size: .8rem; font-weight: normal; margin-left: .5rem; color: #526a6b; }
.allocation-row, .business-list li { display: flex; justify-content: space-between; gap: 1.5rem; border-bottom: 1px solid #e0eae7; padding: .7rem 0; }
.business-details { margin-top: 1.5rem; }
.business-details summary { cursor: pointer; font-weight: 600; }
.business-list { padding: 0; list-style: none; }
.material-filters { display: flex; flex-wrap: wrap; align-items: end; gap: .8rem; margin: 1rem 0; }
.material-filters label { display: grid; gap: .35rem; font-size: .85rem; }
.material-filters select { max-width: 15rem; }
.material-search { flex: 1; min-width: 10rem; }
.material-filters button, .material-pagination button { padding: .65rem 1rem; border: 1px solid #bcd3ce; border-radius: 6px; background: #f2f8f6; color: #176862; }
.material-filters .material-checkbox { width: 100%; display: flex; align-items: center; padding-top: .4rem; }
.material-document-list { padding: 0; list-style: none; }
.material-document-list li { padding: 1.1rem 0; border-bottom: 1px solid #e0eae7; }
.material-document-list a { color: #174b50; text-decoration: none; line-height: 1.7; font-weight: 600; }
.material-document-list a:hover { text-decoration: underline; }
.document-meta { display: flex; flex-wrap: wrap; gap: .85rem; font-size: .8rem; color: #687c7b; margin-bottom: .4rem; }
.document-source { margin: .4rem 0 0; font-size: .78rem; }
.material-pagination { display: flex; gap: .7rem; align-items: center; justify-content: end; flex-wrap: wrap; margin-top: 1.2rem; font-size: .9rem; }
.material-pagination span { margin-right: auto; }
@media (max-width: 700px) { .allocation-columns { grid-template-columns: 1fr; gap: 1rem; } .material-filters label { width: 100%; } .material-filters select { max-width: none; } .material-table td, .material-table th { padding: .7rem; } }
</style>
