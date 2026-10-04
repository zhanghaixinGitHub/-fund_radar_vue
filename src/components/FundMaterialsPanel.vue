<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFundMaterials } from '@/api/fundMaterials'
import type { FundMaterials } from '@/types/fundMaterials'

/** 持仓与公司经营共用结构化资料；公告要点由 FundNewsFacts 展示，不提供原文跳转。 */
const props = defineProps<{ fundCode: string; view: string }>()
const route = useRoute()
const router = useRouter()
const data = ref<FundMaterials | null>(null)
const loading = ref(false)
const error = ref('')
const reportId = ref('')
const stockCode = ref('')
let sequence = 0
const report = computed(() => data.value?.report)
/** latestHeld 只表示最新报告披露持有；历史公司仍留在后台资料中，不作为此处的候选。 */
const currentCompanies = computed(() => data.value?.companies.filter(c => c.latestHeld === true) ?? [])
const company = computed(() => {
  const detail = data.value?.company
  // 名单、当前选择和详情必须同时匹配，防止快照更新或旧响应把历史公司当成最新持仓展示。
  return detail?.latestHeld === true && detail.stockCode === stockCode.value
    && currentCompanies.value.some(c => c.stockCode === detail.stockCode) ? detail : null
})
const money = (n: number | null | undefined) => n == null ? '暂缺' : `${(n / 100_000_000).toLocaleString('zh-CN', { maximumFractionDigits: 2 })} 亿`
const pct = (n: number | null | undefined) => n == null ? '暂缺' : `${n.toFixed(2)}%`
const title = computed(() => ({ holdings: '基金持仓', company: '持仓公司经营' })[props.view] ?? '基金资料')

/**
 * 切换基金或公司时清除旧结果；整个加载过程共用请求序号，较慢的旧响应不能覆盖新选择。
 * 公司页先取最新名单，再校正旧链接/历史代码并读取详情，未知代码不会直接传给详情查询。
 * 每轮至多读取两次；两次读取之间名单变化时只保留有效选择，详情不匹配则显示可重试空态。
 */
async function load() {
  const ticket = ++sequence
  const fundCode = props.fundCode
  const companyView = props.view === 'company'
  const requestedStock = stockCode.value
  loading.value = true
  error.value = ''
  data.value = null
  try {
    const result = await getFundMaterials(fundCode, companyView ? '' : reportId.value)
    if (ticket !== sequence) return
    if (result.fundCode !== fundCode) throw new Error('基金资料归属不一致')
    data.value = result
    if (!companyView) return

    stockCode.value = result.available
      ? currentCompanies.value.find(c => c.stockCode === requestedStock)?.stockCode
        ?? currentCompanies.value[0]?.stockCode ?? ''
      : ''
    if (!stockCode.value) return

    const detail = await getFundMaterials(fundCode, '', stockCode.value)
    if (ticket !== sequence) return
    if (detail.fundCode !== fundCode) throw new Error('基金资料归属不一致')
    data.value = detail
    // 以详情响应携带的最新名单再次校验；不递归重取，也不改写路由触发加载循环。
    if (!detail.available) stockCode.value = ''
    else if (!currentCompanies.value.some(c => c.stockCode === stockCode.value)) {
      stockCode.value = currentCompanies.value[0]?.stockCode ?? ''
    }
  } catch {
    if (ticket === sequence) error.value = '基金补充资料暂时无法加载，请重试。'
  } finally {
    if (ticket === sequence) loading.value = false
  }
}

function navigate(section: string, code = '') {
  void router.push({ path: route.path, query: { ...route.query, section, stock: code || undefined } })
}
watch(() => [props.fundCode, props.view, route.query.stock], () => {
  ++sequence
  reportId.value = ''; stockCode.value = typeof route.query.stock === 'string' ? route.query.stock : ''
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
        <p class="materials-note">
          <template v-if="report">
            最新披露持仓截至 <strong>{{ report.endDate || '日期暂缺' }}</strong>，报告公布于 {{ report.publishedDate || '日期暂缺' }}。{{ report.fullDisclosure ? '本报告披露全部股票持仓。' : '本报告仅披露部分股票持仓。' }}
          </template>
          <template v-else>
            最新披露持仓日期暂缺。
          </template>
          报告披露不代表实时持仓。
        </p>
        <p
          v-if="!currentCompanies.length"
          class="empty-analysis"
        >
          暂无最新披露的持仓公司资料。
        </p>
        <label
          v-else
          class="material-field"
        >选择公司
          <select
            v-model="stockCode"
            @change="load"
          >
            <option
              v-for="c in currentCompanies"
              :key="c.stockCode"
              :value="c.stockCode"
            >{{ c.stockName }} · {{ c.stockCode }}</option>
          </select>
        </label>
        <template v-if="company">
          <p
            v-if="company.quote?.close != null"
            class="material-stat-line"
          >
            <span>行情截至 {{ company.quote.date }}，收盘价 <strong>{{ company.quote.close.toFixed(2) }} 元</strong></span>
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
        <p
          v-else-if="currentCompanies.length"
          class="empty-analysis"
        >
          所选公司的最新持仓资料暂时无法显示，请重试。<button
            type="button"
            @click="load"
          >
            重试
          </button>
        </p>
      </template>
    </template>
  </section>
</template>

<style scoped>
.materials-panel { min-width: 0; }
.materials-note { color: var(--text-muted, #526a6b); font-size: .9rem; line-height: 1.7; }
.material-field { display: grid; gap: .5rem; max-width: 44rem; margin: 1rem 0; }
select { font: inherit; padding: .65rem .75rem; border: 1px solid #c9d9d6; border-radius: 6px; background: white; color: #173c40; min-width: 0; }
select { max-width: 100%; }
button { font: inherit; cursor: pointer; }
button:disabled { cursor: default; opacity: .45; }
button:focus-visible, select:focus-visible { outline: 3px solid #70b5aa; outline-offset: 3px; }
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
.material-document-list { padding: 0; list-style: none; }
.material-document-list li { padding: 1.1rem 0; border-bottom: 1px solid #e0eae7; }
.document-meta { display: flex; flex-wrap: wrap; gap: .85rem; font-size: .8rem; color: #687c7b; margin-bottom: .4rem; }
@media (max-width: 700px) { .allocation-columns { grid-template-columns: 1fr; gap: 1rem; } .material-table td, .material-table th { padding: .7rem; } }
</style>
