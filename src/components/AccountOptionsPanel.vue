<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { get } from '@/api/http'

type Scope = 'CONFIRMED' | 'SIMULATED'
interface Holding { fundCode: string; fundName: string }
interface Candidate {
  title: string; status: string; conditions: string[]; supportingReasons: string[]; opposingReasons: string[]
  costs: string[]; reviewConditions: string[]; reentryConditions: string[]; missing: string[]
  earliestExecutionDate: string | null; executableShares: string | null; estimatedFee: string | null
}
interface Result {
  scope: Scope; fundCode: string; fundName: string; holdingsDate: string | null; checkedOn: string
  conclusion: string; advice: string | null; facts: string[]; personalChecks: string[]
  paths: Candidate[]; invalidationConditions: string[]; limitations: string[]
}
const scope = ref<Scope>('CONFIRMED')
const code = ref('')
const scenario = ref('')
const holdings = ref<Holding[]>([])
const result = ref<Result | null>(null)
const busy = ref(false)
const error = ref('')
let sequence = 0
async function loadHoldings() {
  const ticket = ++sequence
  busy.value = true; result.value = null; code.value = ''; scenario.value = ''; holdings.value = []; error.value = ''
  try {
    const value = await get<{ scope: Scope; holdings: Holding[] }>(`/api/v1/account/risk?scope=${scope.value}`)
    if (ticket === sequence && value.scope === scope.value) holdings.value = value.holdings
  } catch { if (ticket === sequence) error.value = '已录入持仓暂时无法读取，请稍后重试。' }
  finally { if (ticket === sequence) busy.value = false }
}
async function load() {
  if (!code.value || busy.value) return
  const ticket = ++sequence
  busy.value = true; error.value = ''; result.value = null
  try {
    const query = new globalThis.URLSearchParams({ scope: scope.value, fundCode: code.value })
    if (scenario.value !== '') query.set('hypotheticalDeclinePct', scenario.value)
    const value = await get<Result>(`/api/v1/account/options?${query}`)
    if (ticket === sequence && value.scope === scope.value && value.fundCode === code.value) result.value = value
  } catch { if (ticket === sequence) error.value = '当前条件暂时无法核对，请刷新后重试。' }
  finally { if (ticket === sequence) busy.value = false }
}
watch(scope, loadHoldings, { immediate: true })
// 选择新对象后立即移除旧结果，避免把甲基金的约束或情景显示在乙基金下。
watch([code, scenario], () => { result.value = null })
onBeforeUnmount(() => sequence++)
</script>

<template>
  <section
    class="account-options"
    aria-labelledby="account-options-title"
  >
    <h2 id="account-options-title">
      先核对本人条件
    </h2>
    <form @submit.prevent="load">
      <label>持仓范围<select
        v-model="scope"
        :disabled="busy"
      ><option value="CONFIRMED">本人确认持仓</option><option value="SIMULATED">模拟组合</option></select></label>
      <label>已录入基金<select
        v-model="code"
        :disabled="busy"
      ><option value="">请选择</option><option
        v-for="holding in holdings"
        :key="holding.fundCode"
        :value="holding.fundCode"
      >{{ holding.fundName }} · {{ holding.fundCode }}</option></select></label>
      <label>假设整体下跌（%）<input
        v-model="scenario"
        type="number"
        min="0"
        max="100"
        step="0.01"
        :disabled="busy"
        placeholder="可留空，不代表预测"
      ></label>
      <button
        class="secondary-button"
        type="submit"
        :disabled="busy || !code"
      >
        {{ busy ? '核对中…' : '比较条件与代价' }}
      </button>
    </form>
    <p v-if="!busy && !holdings.length && !error">
      该范围没有已录入的本人持仓；关注基金不能代替持有记录。
    </p>
    <p
      v-if="error"
      role="alert"
    >
      {{ error }}
    </p>
    <template v-if="result">
      <h3>{{ result.fundName }} · {{ result.fundCode }}</h3>
      <p>核对日 {{ result.checkedOn }} · 持仓日 {{ result.holdingsDate || '未知' }}</p>
      <p class="conclusion">
        {{ result.conclusion }}
      </p>
      <ul>
        <li
          v-for="fact in result.facts"
          :key="fact"
        >
          {{ fact }}
        </li>
      </ul>
      <h3>本人资金条件</h3>
      <ul>
        <li
          v-for="check in result.personalChecks"
          :key="check"
        >
          {{ check }}
        </li>
      </ul>
      <RouterLink to="/portfolio?section=funding">
        核对资金安排
      </RouterLink>
      <h3>各条路径的条件与代价</h3>
      <details
        v-for="path in result.paths"
        :key="path.title"
      >
        <summary>{{ path.title }} · {{ path.status }}</summary>
        <h4>需要满足</h4><ul>
          <li
            v-for="value in path.conditions"
            :key="value"
          >
            {{ value }}
          </li>
        </ul>
        <h4>考虑理由</h4><ul>
          <li
            v-for="value in path.supportingReasons"
            :key="value"
          >
            {{ value }}
          </li>
        </ul>
        <h4>相反因素</h4><ul>
          <li
            v-for="value in path.opposingReasons"
            :key="value"
          >
            {{ value }}
          </li>
        </ul>
        <h4>费用与时间代价</h4><ul>
          <li
            v-for="value in path.costs"
            :key="value"
          >
            {{ value }}
          </li>
        </ul>
        <p>最早成交日 {{ path.earliestExecutionDate || '待核对' }} · 可操作份额 {{ path.executableShares ?? '待核对' }} · 费用 {{ path.estimatedFee ?? '待核对' }}</p>
        <h4>复查条件</h4><ul>
          <li
            v-for="value in path.reviewConditions"
            :key="value"
          >
            {{ value }}
          </li>
        </ul>
        <template v-if="path.reentryConditions.length">
          <h4>重新进入前</h4><ul>
            <li
              v-for="value in path.reentryConditions"
              :key="value"
            >
              {{ value }}
            </li>
          </ul>
        </template>
        <h4>尚缺的依据</h4><ul>
          <li
            v-for="value in path.missing"
            :key="value"
          >
            {{ value }}
          </li>
        </ul>
      </details>
      <ul>
        <li
          v-for="value in result.invalidationConditions"
          :key="value"
        >
          {{ value }}
        </li>
      </ul>
      <ul>
        <li
          v-for="value in result.limitations"
          :key="value"
        >
          {{ value }}
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
form { display: flex; align-items: end; flex-wrap: wrap; gap: 1rem; }
label { display: grid; gap: .4rem; max-width: 100%; }
input, select { width: 100%; max-width: 24rem; min-width: 0; padding: .6rem; }
details { padding: 1rem; border: 1px solid var(--color-border, #dbe4e2); margin-block: .7rem; border-radius: 8px; }
summary { cursor: pointer; font-weight: 600; }
p, li { line-height: 1.7; overflow-wrap: anywhere; }
.conclusion { font-weight: 600; }
</style>
