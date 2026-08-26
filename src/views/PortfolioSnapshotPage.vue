<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { usePortfolioSnapshot } from '@/composables/usePortfolioSnapshot'
import type { PortfolioHoldingSnapshot } from '@/types/portfolio'

/** 本机单用户持仓快照页面；只展示 Java 已保存且用户确认的字段。 */
const { errorMessage, load, loading, snapshot } = usePortfolioSnapshot()

const holdings = computed(() => snapshot.value?.holdings ?? [])
const visibleAmount = computed(() => sumBy(holdings.value, 'reportedAmount'))
const visibleWeight = computed(() => sumBy(holdings.value, 'reportedWeightPct'))
const dailyGain = computed(() => sumBy(holdings.value, 'reportedDailyGainAmount'))
const gainCount = computed(() => holdings.value.filter((item) => numeric(item.reportedDailyGainAmount) > 0).length)
const lossCount = computed(() => holdings.value.filter((item) => numeric(item.reportedDailyGainAmount) < 0).length)
const largestAmount = computed(() => Math.max(...holdings.value.map((item) => numeric(item.reportedAmount)), 0))

const currencyFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('zh-CN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** 首次进入时从 Java 核心服务读取已入库快照。 */
onMounted(() => {
  void load()
})

/** 统一将接口中的 NUMERIC JSON 值转换为安全的展示数值。 */
function numeric(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/** 汇总某个持仓快照金额字段；只在页面显示层计算，不回写数据库。 */
function sumBy(
  items: PortfolioHoldingSnapshot[],
  field: keyof Pick<
    PortfolioHoldingSnapshot,
    'reportedAmount' | 'reportedWeightPct' | 'reportedDailyGainAmount'
  >,
): number {
  return items.reduce((total, item) => total + numeric(item[field]), 0)
}

/** 用加减号与颜色共同表达涨跌，不能只依赖颜色传达含义。 */
function signedCurrency(value: number | string): string {
  const normalized = numeric(value)
  return `${normalized > 0 ? '+' : normalized < 0 ? '-' : ''}${currencyFormatter.format(Math.abs(normalized))}`
}

/** 用加减号与颜色共同表达百分比。 */
function signedPercent(value: number | string): string {
  const normalized = numeric(value)
  return `${normalized > 0 ? '+' : normalized < 0 ? '-' : ''}${numberFormatter.format(Math.abs(normalized))}%`
}

/** 返回与符号语义对应的 CSS 类名。 */
function trendClass(value: number | string): string {
  const normalized = numeric(value)
  if (normalized > 0) {
    return 'trend-positive'
  }
  if (normalized < 0) {
    return 'trend-negative'
  }
  return 'trend-neutral'
}

/** 根据当前行和截图最高金额计算相对条宽，仅表示截图已见部分。 */
function amountBarWidth(value: number | string): string {
  if (largestAmount.value === 0) {
    return '0%'
  }
  return `${Math.max(8, (numeric(value) / largestAmount.value) * 100)}%`
}

/** 格式化导入时间；这不是截图数据日期。 */
function formatImportedAt(value: string | null): string {
  if (!value) {
    return '未知'
  }
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Shanghai',
  }).format(new Date(value))
}
</script>

<template>
  <section
    class="portfolio-page"
    aria-labelledby="portfolio-title"
  >
    <div class="portfolio-hero">
      <div>
        <p class="eyebrow portfolio-eyebrow">
          LOCAL PORTFOLIO SNAPSHOT
        </p>
        <h1 id="portfolio-title">
          持仓快照，
          <span>不把未知说成实时。</span>
        </h1>
        <p class="portfolio-lead">
          展示当前本机用户确认入库的基金截图字段。基金目录已核验；截图未显示日期、份额与成本，
          所以页面不会推算实时总资产、持仓成本或投资建议。
        </p>
      </div>
      <aside
        class="portfolio-source-card"
        aria-label="数据边界"
      >
        <span class="source-card-kicker">DATA BOUNDARY</span>
        <strong>本机确认快照</strong>
        <p>不上传原图，不读取支付宝账户，不提供买卖操作。</p>
      </aside>
    </div>

    <div
      v-if="loading"
      class="portfolio-state"
      role="status"
    >
      正在从 Java 核心服务读取已入库快照…
    </div>
    <div
      v-else-if="errorMessage"
      class="portfolio-state portfolio-error"
      role="alert"
    >
      <p>{{ errorMessage }}</p>
      <button
        class="portfolio-retry-button"
        type="button"
        @click="load"
      >
        重新读取
      </button>
    </div>
    <div
      v-else-if="!snapshot?.available"
      class="portfolio-state"
    >
      当前本机用户尚未导入确认快照，因此没有可展示的持仓数据。
    </div>
    <template v-else>
      <div
        class="portfolio-notice"
        role="status"
      >
        <span
          class="notice-dot"
          aria-hidden="true"
        />
        <p>
          <strong>数据日期未知。</strong>
          当前只包含截图中完整可见的 {{ holdings.length }} 条；金额、收益与占比均为用户确认的截图展示值，
          不是实时净值或完整持仓。
        </p>
      </div>

      <div
        class="portfolio-metrics"
        aria-label="截图可见部分汇总"
      >
        <article>
          <span>截图可见基金</span>
          <strong>
            {{ holdings.length }} <small>只</small>
          </strong>
          <p>仅完整可见行</p>
        </article>
        <article>
          <span>截图可见金额</span>
          <strong>{{ currencyFormatter.format(visibleAmount) }}</strong>
          <p>不代表完整总资产</p>
        </article>
        <article>
          <span>已见占总额</span>
          <strong>
            {{ numberFormatter.format(visibleWeight) }}<small>%</small>
          </strong>
          <p>按截图逐条相加</p>
        </article>
        <article>
          <span>截图行日收益合计</span>
          <strong :class="trendClass(dailyGain)">
            {{ signedCurrency(dailyGain) }}
          </strong>
          <p>{{ gainCount }} 只上涨 · {{ lossCount }} 只下跌</p>
        </article>
      </div>

      <section
        class="portfolio-table-card"
        aria-labelledby="holdings-heading"
      >
        <header class="portfolio-section-heading">
          <div>
            <p class="section-kicker">
              CONFIRMED HOLDINGS
            </p>
            <h2 id="holdings-heading">
              截图中完整可见的基金
            </h2>
          </div>
          <p>按截图金额降序 · 导入于 {{ formatImportedAt(snapshot.importedAt) }}</p>
        </header>

        <div
          class="portfolio-table"
          role="table"
          aria-label="基金持仓快照"
        >
          <div
            class="portfolio-table-header"
            role="row"
          >
            <span role="columnheader">基金 / 代码</span>
            <span role="columnheader">截图金额 / 占比</span>
            <span role="columnheader">日收益</span>
            <span role="columnheader">持有收益</span>
            <span role="columnheader">累计收益</span>
          </div>
          <article
            v-for="holding in holdings"
            :key="holding.fundCode"
            class="portfolio-row"
            role="row"
          >
            <div
              class="portfolio-fund"
              role="cell"
            >
              <strong>{{ holding.fundName }}</strong>
              <span>{{ holding.fundCode }} · 已核验目录</span>
            </div>
            <div
              class="portfolio-amount"
              role="cell"
            >
              <strong>{{ currencyFormatter.format(numeric(holding.reportedAmount)) }}</strong>
              <span>占总额 {{ numberFormatter.format(numeric(holding.reportedWeightPct)) }}%</span>
              <i
                aria-hidden="true"
                :style="{ width: amountBarWidth(holding.reportedAmount) }"
              />
            </div>
            <div
              :class="trendClass(holding.reportedDailyGainAmount)"
              class="portfolio-value"
              role="cell"
            >
              {{ signedCurrency(holding.reportedDailyGainAmount) }}
            </div>
            <div
              :class="trendClass(holding.reportedHoldingGainAmount)"
              class="portfolio-value portfolio-holding-gain"
              role="cell"
            >
              <strong>{{ signedCurrency(holding.reportedHoldingGainAmount) }}</strong>
              <span>{{ signedPercent(holding.reportedHoldingGainPct) }}</span>
            </div>
            <div
              :class="trendClass(holding.reportedCumulativeGainAmount)"
              class="portfolio-value"
              role="cell"
            >
              {{ signedCurrency(holding.reportedCumulativeGainAmount) }}
            </div>
          </article>
        </div>
      </section>

      <section
        class="portfolio-readout"
        aria-labelledby="readout-heading"
      >
        <div>
          <p class="section-kicker">
            HOW TO READ
          </p>
          <h2 id="readout-heading">
            这版页面已经区分了三类数据
          </h2>
        </div>
        <div class="portfolio-readout-grid">
          <article>
            <span>01</span>
            <h3>真实基金目录</h3>
            <p>名称、代码和份额类别已进入基金目录表，可被市场页与持仓页共同引用。</p>
          </article>
          <article>
            <span>02</span>
            <h3>确认持仓快照</h3>
            <p>金额、收益和占比已作为本机私有快照入库；没有份额和日期就不做成本、收益率推算。</p>
          </article>
          <article>
            <span>03</span>
            <h3>待授权市场数据</h3>
            <p>日净值、资讯、评分和回测仍为空，等合规数据源与历史净值到位后再生成。</p>
          </article>
        </div>
      </section>
    </template>
  </section>
</template>
