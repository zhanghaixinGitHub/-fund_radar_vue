<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { generateDecision, readDecision, readDecisionHistory, readDecisionOutcomes, readStrategyPreference, saveStrategyPreference } from '@/api/multiPrediction'
import type { DecisionOutcome } from '@/api/multiPrediction'
import type { DecisionReport } from '@/types/multiPrediction'
import { useAuthStore } from '@/stores/auth'
const props = defineProps<{ fundCode: string; compact?: boolean; historyOnly?: boolean; initialReport?: DecisionReport | null }>()
const auth = useAuthStore()
const report = ref<DecisionReport | null>(null), history = ref<DecisionReport[]>([])
const error = ref(''), busy = ref(false), preference = ref('BALANCED'), isDefault = ref(true)
const page = ref(1), outcomes = ref<Record<string, DecisionOutcome>>({}), outcomeError = ref('')
const historyVersion = ref('HOLDING_ADVICE_V3_THREE_STATE')
let sequence = 0
const labels: Record<string, string> = { BUY: '建议买入', AVOID: '不建议买入', ADD: '建议加仓', HOLD: '继续持有', REDUCE: '建议减仓', SELL: '建议卖出' }
const time = (value: string) => new Date(value).toLocaleString('zh-CN', { hour12: false })
async function load() {
  const run = ++sequence; error.value = ''
  try {
    const [value, prefs, records, checks] = await Promise.all([props.historyOnly ? Promise.resolve(null) : readDecision(props.fundCode), props.compact || props.historyOnly ? Promise.resolve({preference:'BALANCED',defaultPreference:true}) : readStrategyPreference(),
      props.historyOnly ? readDecisionHistory(props.fundCode, page.value, historyVersion.value) : Promise.resolve([]),
      props.historyOnly ? readDecisionOutcomes(props.fundCode, page.value, historyVersion.value).catch(() => { outcomeError.value='到期核验暂时无法读取，已保存原文仍可查看'; return {} }) : Promise.resolve({})])
    if (run !== sequence) return
    report.value = value; preference.value = prefs.preference; isDefault.value = prefs.defaultPreference; history.value = records; outcomes.value = checks
  } catch (e) { if (run === sequence) error.value = e instanceof Error ? e.message : '建议读取失败' }
}
async function generate() {
  const code = props.fundCode; busy.value = true; error.value = ''
  try { const value = await generateDecision(code); if (code === props.fundCode) { report.value = value; await load() } }
  catch (e) { if (code === props.fundCode) error.value = e instanceof Error ? e.message : '建议生成失败' }
  finally { busy.value = false }
}
async function changePreference() {
  try { await saveStrategyPreference(preference.value); isDefault.value = false }
  catch (e) { error.value = e instanceof Error ? e.message : '策略偏好保存失败' }
}
async function historyPage(value: number) { page.value=value; await load() }
watch(() => [props.fundCode, props.initialReport, props.historyOnly] as const, () => { page.value=1; report.value = props.initialReport ?? null; history.value = []; if (props.fundCode && !props.compact) void load() }, { immediate: true })
onBeforeUnmount(() => { ++sequence })
</script>
<template>
  <section
    class="decision-panel"
    :aria-busy="busy"
    aria-label="持仓综合建议"
  >
    <div class="section-heading">
      <div>
        <p class="eyebrow">
          综合建议 · 实验中
        </p><h2>{{ historyOnly ? '综合建议历史' : report?.generationStatus === 'FAILED' ? '本次建议生成失败' : labels[report?.decision ?? ''] ?? '尚无综合建议' }}</h2>
      </div>
      <button
        v-if="!historyOnly && auth.hasPermission('SIM_PORTFOLIO_SELF_WRITE')"
        class="primary-button"
        :disabled="busy"
        @click="generate"
      >
        {{ busy ? '正在计算并留档…' : '生成当前综合建议' }}
      </button>
    </div>
    <p
      v-if="error"
      class="error-message"
      role="alert"
    >
      {{ error }} <button
        class="secondary-button"
        @click="load"
      >
        重新读取
      </button>
    </p>
    <template v-if="report && !historyOnly">
      <p :class="{ 'error-message': report.generationStatus === 'FAILED' }">
        {{ report.error?.summary ?? report.summary }}
      </p>
      <p v-if="report.error">
        {{ report.error.nextAction }} <small>{{ report.error.code }} · {{ report.error.traceId }}</small>
      </p>
      <ul v-if="!compact">
        <li
          v-for="reason in report.supportingEvidence.slice(0, 2)"
          :key="reason"
        >
          {{ reason }}
        </li><li
          v-for="reason in report.opposingEvidence.slice(0, 2)"
          :key="reason"
        >
          {{ reason }}
        </li>
      </ul>
      <p class="decision-time">
        生成于 {{ time(report.generatedAt) }} · {{ report.defaultPreference ? '默认均衡实验策略' : `个人${{ SHORT: '短线', BALANCED: '均衡', LONG: '长线' }[report.preference]}偏好` }}
      </p>
      <details v-if="!compact">
        <summary>支持、中性、反对因素与本次未覆盖信息</summary>
        <h3>中性因素</h3><p v-if="!report.neutralEvidence?.length">
          本次没有单独记录的中性因子
        </p><ul>
          <li
            v-for="item in report.neutralEvidence"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
        <h3>支持因素</h3><p v-if="!report.supportingEvidence.length">
          本次没有正向因子
        </p><ul>
          <li
            v-for="item in report.supportingEvidence"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
        <h3>反对因素</h3><p v-if="!report.opposingEvidence.length">
          本次没有已计算的负向因子，不代表不存在风险
        </p><ul>
          <li
            v-for="item in report.opposingEvidence"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
        <h3>已接入事实</h3><ul>
          <li
            v-for="item in report.facts"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
        <h3>未覆盖信息</h3><ul>
          <li
            v-for="item in report.missingOptionalFactors"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
        <h3>执行条件</h3><ul>
          <li
            v-for="item in report.executionConstraints"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
        <p>策略：{{ report.strategyVersion }}；报告：{{ report.reportId }}</p>
        <p
          v-for="model in report.modelRefs"
          :key="model.predictionId"
        >
          {{ model.horizonId }} · 实际模型 {{ model.modelId }} · 采用版本 {{ model.activationRevision }} · {{ model.modelHash }}
        </p>
      </details>
    </template>
    <p v-else-if="!error && !historyOnly">
      生成后会保存当时的预测、资料和持仓。持有金额不影响是否给出判断。
    </p>
    <div
      v-if="!compact && !historyOnly && auth.hasPermission('SIM_PORTFOLIO_SELF_WRITE')"
      class="preference"
    >
      <label :for="`preference-${fundCode}`">综合建议偏好</label>
      <select
        :id="`preference-${fundCode}`"
        v-model="preference"
        @change="changePreference"
      >
        <option value="SHORT">
          短线
        </option><option value="BALANCED">
          均衡
        </option><option value="LONG">
          长线
        </option>
      </select>
      <small>{{ isDefault ? '尚未设置，使用默认实验规则' : '已保存个人选择；重新生成建议时生效' }}。不限制关注页的预测周期。</small>
    </div>
    <div v-if="historyOnly">
      <label>建议版本 <select
        v-model="historyVersion"
        @change="historyPage(1)"
      ><option value="HOLDING_ADVICE_V3_THREE_STATE">三分类综合建议</option><option value="HOLDING_ADVICE_V2_EXPERIMENTAL">旧版二分类综合建议</option></select></label>
      <p>保留当时动作、依据和模型版本。下面核验的是所引用预测的方向与区间总回报，不是模拟交易收益；扣费策略对照在历史研究中单独记录。</p>
      <p
        v-if="outcomeError"
        role="alert"
      >
        {{ outcomeError }}
      </p>
      <p v-if="!history.length">
        尚无保存记录
      </p>
      <article
        v-for="item in history"
        :key="item.reportId"
        class="decision-history"
      >
        <strong>{{ labels[item.decision ?? ''] ?? '生成失败' }}</strong> · {{ time(item.generatedAt) }}<p>{{ item.summary }}</p><small>{{ item.strategyVersion }} · {{ item.reportId }}</small>
        <details>
          <summary>当时依据与预测到期结果</summary><p
            v-for="reason in [...item.supportingEvidence,...(item.neutralEvidence ?? []),...item.opposingEvidence]"
            :key="reason"
          >
            {{ reason }}
          </p><div
            v-for="reference in item.modelRefs"
            :key="reference.predictionId"
          >
            <p>{{ reference.horizonId }} · {{ reference.modelId }} · 采用版本 {{ reference.activationRevision }}</p><p v-if="!outcomes[reference.predictionId]?.outcomes?.length">
              {{ outcomes[reference.predictionId]?.check_state?.summary ?? '尚未到期或到期资料待齐，不计为正确或错误' }}
            </p><p
              v-for="check in outcomes[reference.predictionId]?.outcomes"
              :key="check.checkedAt"
            >
              {{ time(check.checkedAt) }}核验：{{ check.correct ? '方向相符' : '方向不符' }}；区间总回报 {{ (Number(check.totalReturn)*100).toFixed(2) }}%
            </p>
          </div>
        </details>
      </article>
      <div class="preference">
        <button
          class="secondary-button"
          :disabled="page===1"
          @click="historyPage(page-1)"
        >
          上一页
        </button><span>第 {{ page }} 页</span><button
          class="secondary-button"
          :disabled="history.length<20"
          @click="historyPage(page+1)"
        >
          下一页
        </button>
      </div>
    </div>
    <RouterLink
      v-if="compact"
      :to="{ name: 'portfolio-advice', query: { fund: fundCode } }"
    >
      查看综合依据与历史 →
    </RouterLink>
  </section>
</template>
<style scoped>
.decision-panel { padding:20px; margin:16px 0; border:1px solid #d6e4dd; border-radius:12px; background:#f7faf8; min-width:0; }
.decision-panel h2 { font-size:23px; margin:6px 0; }.decision-panel p,.decision-panel li { line-height:1.7; }
.decision-panel details { margin-top:16px; overflow-wrap:anywhere; font-size:14px; }.decision-panel summary { cursor:pointer; min-height:36px; }
.decision-time { color:#66766f; font-size:13px; }.preference { display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-top:16px; }
.preference select { padding:9px; border:1px solid #bdcfc5; border-radius:6px; background:white; }.decision-history { border-top:1px solid #d6e4dd; padding:12px 0; }
@media(max-width:600px) { .decision-panel { padding:16px; }.decision-panel button { min-height:44px; } }
</style>
