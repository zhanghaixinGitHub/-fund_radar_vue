<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { get } from '@/api/http'

type Scope = 'CONFIRMED' | 'SIMULATED'
interface Result {
  scope: Scope; holdingsDate: string | null; scopeDescription: string; recordedAmount: string | null
  holdings: { fundCode: string; fundName: string; amount: string; date: string | null; issue: string | null }[]
  industries: { key: string; name: string; weightPct: number }[]
  companies: { key: string; name: string; weightPct: number }[]
  coveredFundWeightPct: number | null; knownLookThroughWeightPct: number | null
  sources: { fundCode: string; reportDate: string; publishedDate: string; sourceUrl: string }[]
  scenarioDeclinePct: number | null; scenarioLoss: string | null; limitations: string[]
}
const scope = ref<Scope>('CONFIRMED')
const scenario = ref('')
const result = ref<Result | null>(null)
const loading = ref(false)
const error = ref('')
const page = ref(1)
const visibleHoldings = computed(() => result.value?.holdings.slice((page.value - 1) * 20, page.value * 20) ?? [])
let sequence = 0
const amount = (value: string | null) => value == null ? '未知' : new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value))
const pct = (value: number | null) => value == null ? '未知' : `${Number(value).toFixed(2)}%`
async function load() {
  const ticket = ++sequence
  loading.value = true; error.value = ''
  try {
    const query = new globalThis.URLSearchParams({ scope: scope.value })
    if (scenario.value !== '') query.set('scenarioDeclinePct', scenario.value)
    const value = await get<Result>(`/api/v1/account/risk?${query}`)
    if (ticket !== sequence || value.scope !== scope.value) return
    result.value = value; page.value = 1
  } catch { if (ticket === sequence) error.value = '账户资料暂时无法核对，请稍后重试。' }
  finally { if (ticket === sequence) loading.value = false }
}
watch(scope, () => { result.value = null; scenario.value = ''; void load() }, { immediate: true })
onBeforeUnmount(() => sequence++)
</script>

<template>
  <section
    aria-labelledby="account-risk-title"
    :aria-busy="loading"
  >
    <h2 id="account-risk-title">
      资料与情景
    </h2>
    <form @submit.prevent="load">
      <label>持仓范围 <select
        v-model="scope"
        :disabled="loading"
      ><option value="CONFIRMED">本人确认持仓</option><option value="SIMULATED">模拟组合</option></select></label>
      <label>假设整体下跌（%）<input
        v-model="scenario"
        type="number"
        min="0"
        max="100"
        step="0.01"
        placeholder="可留空，不代表预测"
      ></label>
      <button
        type="submit"
        :disabled="loading"
      >
        {{ loading ? '核对中…' : '检查与计算情景' }}
      </button>
    </form>
    <p
      v-if="error"
      role="alert"
    >
      {{ error }}
    </p>
    <template v-if="result">
      <p>{{ result.scopeDescription }} · {{ result.holdingsDate ? `持仓日期 ${result.holdingsDate}` : '持仓日期未知或不一致' }}。仅包含已录入范围。</p>
      <p>已录入金额：<strong>{{ amount(result.recordedAmount) }}</strong> 元。</p>
      <template v-if="result.holdings.length">
        <p>可核对披露资料的基金占已录入金额 {{ pct(result.coveredFundWeightPct) }}；已知底层股票占已录入金额 {{ pct(result.knownLookThroughWeightPct) }}。未覆盖部分保持未知。</p>
        <div class="exposures">
          <section>
            <h3>已知行业分布</h3><p v-if="!result.industries.length">
              暂无可比口径的行业资料。
            </p><ul>
              <li
                v-for="item in result.industries"
                :key="item.key"
              >
                {{ item.name }}：{{ pct(item.weightPct) }}
              </li>
            </ul>
          </section>
          <section>
            <h3>已知重叠公司（前十项）</h3><p v-if="!result.companies.length">
              暂无可核对的底层公司资料。
            </p><ul>
              <li
                v-for="item in result.companies.slice(0, 10)"
                :key="item.key"
              >
                {{ item.name }}：{{ pct(item.weightPct) }}
              </li>
            </ul>
          </section>
        </div>
        <p v-if="result.scenarioLoss != null">
          假设已录入持仓整体下跌 {{ pct(result.scenarioDeclinePct) }}，金额变化约为减少 {{ amount(result.scenarioLoss) }} 元。此处忽略费用及资金在途，不代表预计损失。
        </p>
        <details>
          <summary>查看使用的持仓与披露日期</summary>
          <ul>
            <li
              v-for="holding in visibleHoldings"
              :key="holding.fundCode"
            >
              {{ holding.fundName }} · {{ holding.fundCode }}：{{ amount(holding.amount) }} 元，{{ holding.date ?? '日期未知' }}<span v-if="holding.issue">，估值待核对</span>。
            </li>
          </ul>
          <nav
            v-if="result.holdings.length > 20"
            aria-label="账户持仓分页"
          >
            <button
              :disabled="page === 1"
              @click="page--"
            >
              上一页
            </button><span>第 {{ page }} 页</span><button
              :disabled="page * 20 >= result.holdings.length"
              @click="page++"
            >
              下一页
            </button>
          </nav>
          <ul>
            <li
              v-for="source in result.sources"
              :key="source.fundCode"
            >
              {{ source.fundCode }}：报告期 {{ source.reportDate }}，披露日期 {{ source.publishedDate }}，<a
                :href="source.sourceUrl"
                target="_blank"
                rel="noopener noreferrer"
              >查看原文 ↗</a>。
            </li>
          </ul>
        </details>
      </template>
      <ul class="muted">
        <li
          v-for="limit in result.limitations"
          :key="limit"
        >
          {{ limit }}
        </li>
      </ul>
      <RouterLink :to="{ name: 'portfolio-snapshot', query: { section: 'funding' } }">
        查看本人资金安排
      </RouterLink>
    </template>
  </section>
</template>

<style scoped>
h2 { font-size: 1.15rem; } h3 { font-size: 1rem; } p, li { line-height: 1.75; }
form, nav { display: flex; flex-wrap: wrap; align-items: end; gap: .8rem; }
label { display: flex; flex-direction: column; gap: .5rem; }
input, select, button { font: inherit; border: 1px solid #baccc4; border-radius: .4rem; padding: .65rem; max-width: 100%; }
.exposures { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 1rem; }
ul { padding-left: 1.2rem; }.muted { color: var(--workspace-muted, #597069); }
summary { cursor: pointer; } button:disabled { opacity: .5; } @media(max-width:650px) { .exposures { grid-template-columns: 1fr; } }
</style>
