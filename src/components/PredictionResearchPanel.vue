<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { get, post } from '@/api/http'
import { shanghaiDate, simMoney } from '@/utils/simulation'
import { sortPredictionHorizons } from '@/utils/predictionHorizon'

interface Metric {
  /** 来自研究账本的本金和期末资产，不能把收益率当金额，也不能再重复扣手续费。 */
  initialCash: number | string
  finalEquity: number | string
  netReturn: number
  maxDrawdown: number
  tradeCount: number
  fees: number | string
  cashOnlySessions: number
  assumption: string
}
interface Scope { fundCode: string; startDate: string; endDate: string }
interface ComparisonModel {
  label: string
  role: 'CURRENT' | 'CANDIDATE' | 'BENCHMARK'
  modelRefs?: { horizonId: string; modelId: string; modelHash: string; labelEndMax: string | null }[]
}
interface Replay {
  runId: string
  status: string
  comparisons?: Record<string, Metric>
  comparisonModels?: Record<string, ComparisonModel>
  excludedModels?: { label: string; reason: string }[]
  errorMessage?: string
  inputSnapshot?: Partial<Scope> & { inputHash: string; failures: unknown[] }
}
interface Research {
  run_id: string
  status: string
  result?: { horizons?: Record<string, {
    selection: { decision: string }
    models: { modelId: string; metrics: { primaryScore: number | null; coverage: number } }[]
  }> }
}
// 日期选择以北京时间为准：默认查看今年以来，原生日期框的“今天”始终允许选择。
const latestDate = ref(shanghaiDate())
const code = ref('006730'), start = ref(`${latestDate.value.slice(0, 4)}-01-01`), end = ref(latestDate.value)
const latestCompleteDate = computed(() => new Date(Date.parse(latestDate.value) - 86400000).toISOString().slice(0, 10))
const usingToday = computed(() => end.value === latestDate.value)
const codeInput = ref<{ focus: () => void } | null>(null), startInput = ref<{ focus: () => void } | null>(null), endInput = ref<{ focus: () => void } | null>(null)
const fieldErrors = ref({ code: '', start: '', end: '' })
const result = ref<Replay | null>(null), submitted = ref<Scope | null>(null), replayError = ref(''), replayBusy = ref(false)
const calculationScope = ref<Scope | null>(null)
const research = ref<Research | null>(null), researchId = ref(''), researchEnd = ref('2025-12-31'), researchError = ref(''), researchBusy = ref(false)
const busy = computed(() => replayBusy.value || researchBusy.value)
const researchHorizons = computed(() => sortPredictionHorizons(Object.entries(research.value?.result?.horizons ?? {}), ([horizon]) => horizon))
const horizons: Record<string, string> = { T5_V1: '五日预测', T20_V1: '二十日预测', M6_V1: '半年预测' }
const researchStates: Record<string, string> = { PENDING: '等待开始', QUEUED: '等待开始', RUNNING: '正在比较', SUCCEEDED: '比较完成', FAILED: '比较失败', CANCELLED: '已取消', CANCEL_REQUESTED: '正在取消', PARTIAL: '部分完成' }
const selectionLabels: Record<string, string> = { KEEP_CURRENT: '保留原方法', ACTIVATE: '新方法胜出', NO_ELIGIBLE_MODEL: '没有完成比较的可用方法' }
const percent = (value: number | null | undefined) => value == null || !Number.isFinite(value) ? '暂无数据' : `${(value * 100).toFixed(2)}%`
const money = (value: number | string | undefined) => value == null || !Number.isFinite(Number(value)) ? '暂无数据' : `${simMoney(value)} 元`
const dateLabel = (value: string | undefined) => value?.replaceAll('-', '/') ?? '未提供'
const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
// 优先使用服务端保存的范围；发请求前的副本用于失败提示，绝不把随后编辑的输入套到旧结果上。
const resultScope = computed(() => ({ ...calculationScope.value, ...result.value?.inputSnapshot }))
const inputChanged = computed(() => submitted.value && (code.value.trim() !== submitted.value.fundCode || start.value !== submitted.value.startDate || end.value !== submitted.value.endDate))
// 旧回执仍可读，但旧动作规则和去公告对照不再作为用户要比较的模型展示。
const comparisons = computed(() => {
  if (result.value?.status !== 'SUCCEEDED' || !result.value.comparisons) return undefined
  return Object.fromEntries(Object.entries(result.value.comparisons).filter(([id]) => id === 'BUY_HOLD'
    || (id.startsWith('MODEL_') && ['CURRENT', 'CANDIDATE'].includes(result.value?.comparisonModels?.[id]?.role ?? ''))
    || (id === 'V2' && !result.value.comparisonModels)))
})
const labelFor = (id: string) => id === 'BUY_HOLD' ? '买入后一直持有'
  : result.value?.comparisonModels?.[id]?.label ?? (id === 'V2' ? '净值趋势基础模型（旧回放）' : '模型名称未提供')
const modelEntries = computed(() => Object.entries(comparisons.value ?? {}).filter(([id]) => id !== 'BUY_HOLD'))
// 这里只描述本区间的结果，不据此切换正在使用的模型，也不把局部最高称为全局最优。
const leadingModel = computed(() => [...modelEntries.value].sort((a, b) => Number(b[1].finalEquity) - Number(a[1].finalEquity))[0])
const strategy = computed(() => leadingModel.value?.[1])
const holding = computed(() => comparisons.value?.BUY_HOLD)
const difference = computed(() => strategy.value && holding.value ? Number(strategy.value.finalEquity) - Number(holding.value.finalEquity) : NaN)
const headline = computed(() => {
  if (!leadingModel.value || !Number.isFinite(difference.value)) return '本次只有一直持有的结果，模型未完成比较'
  const label = labelFor(leadingModel.value[0])
  if (Math.abs(difference.value) < 0.005) return `这次模拟，${label}与一直持有最后的钱一样多`
  return `这次模拟，${label}比一直持有${difference.value > 0 ? '多' : '少'}了 ${money(Math.abs(difference.value))}`
})
const drawdownConclusion = computed(() => {
  if (!strategy.value || !holding.value) return ''
  const difference = strategy.value.maxDrawdown - holding.value.maxDrawdown
  if (Math.abs(difference) < 0.00005) return '该模型与一直持有的最大回撤相同。'
  return `该模型的最大回撤${difference > 0 ? '更大' : '更小'}：${percent(strategy.value.maxDrawdown)}，一直持有为 ${percent(holding.value.maxDrawdown)}。`
})
function gainText(metric: Metric) {
  const gain = Number(metric.finalEquity) - Number(metric.initialCash)
  if (!Number.isFinite(gain)) return '盈亏金额暂缺'
  return Math.abs(gain) < 0.005 ? '与起始本金相同' : `${gain > 0 ? '赚了' : '亏了'} ${money(Math.abs(gain))}`
}

function refreshDateLimit() {
  // 页面跨午夜停留后，重新打开日历也能点击新一天的“今天”。
  latestDate.value = shanghaiDate()
}

async function replay() {
  if (busy.value) return
  // 包括前端校验失败在内，每次重新尝试都清除旧结果，避免把上一次成功误认为本次成功。
  result.value = null
  submitted.value = null
  calculationScope.value = null
  replayError.value = ''
  refreshDateLimit()
  fieldErrors.value = { code: '', start: '', end: '' }
  const request = { fundCode: code.value.trim(), startDate: start.value, endDate: end.value }
  if (!/^\d{6}$/.test(request.fundCode)) fieldErrors.value.code = '请输入一只基金的6位代码，例如006730。'
  if (!validDate(request.startDate)) fieldErrors.value.start = '请选择有效的开始日期。'
  if (!validDate(request.endDate)) fieldErrors.value.end = '请选择有效的结束日期。'
  else if (request.endDate > latestDate.value) fieldErrors.value.end = `结束日期不能晚于今天，请选 ${dateLabel(latestDate.value)} 或更早。`
  // “到今天”为界面选择，后台只接收已经结束的历史区间；保留原选择用于识别后续编辑。
  const replayEnd = request.endDate === latestDate.value ? latestCompleteDate.value : request.endDate
  if (!fieldErrors.value.start && !fieldErrors.value.end) {
    if (request.startDate >= request.endDate) fieldErrors.value.start = '开始日期必须早于结束日期。'
    else if (request.startDate >= replayEnd) fieldErrors.value.start = '选择今天作为结束日时，实际回放截至昨天；请将开始日期选在昨天之前。'
    else if ((Date.parse(request.endDate) - Date.parse(request.startDate)) / 86400000 > 732) fieldErrors.value.start = '本次跨度超过两年（732天），请缩短日期范围。'
  }
  if (Object.values(fieldErrors.value).some(Boolean)) {
    await nextTick()
    const target = fieldErrors.value.code ? codeInput : fieldErrors.value.start ? startInput : endInput
    target.value?.focus()
    return
  }
  submitted.value = request
  calculationScope.value = { ...request, endDate: replayEnd }
  replayBusy.value = true
  try {
    const answer = await post<Replay>('/api/v1/admin/prediction-research/strategy', calculationScope.value)
    result.value = answer
    if (answer.status !== 'SUCCEEDED') replayError.value = answer.errorMessage || '这次模拟未完成，请稍后重试。'
  } catch (error) { replayError.value = error instanceof Error ? error.message : '模拟失败，请稍后重试。' }
  finally { replayBusy.value = false }
}
async function train() {
  if (busy.value) return
  research.value = null
  researchError.value = ''
  refreshDateLimit()
  if (!/^\d{6}$/.test(code.value.trim())) { researchError.value = '请先在上方填写一只基金的6位代码。'; return }
  if (!validDate(researchEnd.value) || researchEnd.value <= '2024-06-28' || researchEnd.value > latestCompleteDate.value) {
    researchError.value = `比较结束日期应晚于 2024/6/28，且不晚于 ${dateLabel(latestCompleteDate.value)}。`
    return
  }
  researchBusy.value = true
  try {
    research.value = await post<Research>('/api/v1/admin/prediction-research', { fundCodes: [code.value.trim()], horizonIds: ['T5_V1', 'T20_V1', 'M6_V1'], trainStart: '2022-01-04', trainEnd: '2023-12-29', validationEnd: '2024-06-28', selectionEnd: researchEnd.value, stride: 5, evidenceLevel: 'DEVELOPMENT_ONLY' })
    researchId.value = research.value.run_id
  } catch (error) { researchError.value = error instanceof Error ? error.message : '比较任务未启动。' }
  finally { researchBusy.value = false }
}
async function readResearch(action?: 'cancel' | 'resume') {
  if (busy.value || !researchId.value.trim()) return
  researchError.value = ''
  research.value = null
  researchBusy.value = true
  try {
    const path = `/api/v1/admin/prediction-research/${encodeURIComponent(researchId.value.trim())}`
    research.value = action ? await post<Research>(`${path}/${action}`) : await get<Research>(path)
  } catch (error) { researchError.value = error instanceof Error ? error.message : '任务状态读取失败。' }
  finally { researchBusy.value = false }
}
</script>

<template>
  <section
    class="analysis-section replay-panel"
    aria-labelledby="replay-title"
  >
    <h2 id="replay-title">
      过去按建议买卖，结果会怎样？
    </h2>
    <p class="intro">
      比较“买入后一直持有”和“按模型建议买卖”。当前采用模型及已登记候选使用同一段行情、相同买卖规则和费用，看看最后谁的钱更多。
    </p>
    <form
      novalidate
      :aria-busy="replayBusy"
      @submit.prevent="replay"
    >
      <div class="research-form">
        <div class="field">
          <label for="replay-fund">基金代码</label>
          <input
            id="replay-fund"
            ref="codeInput"
            v-model="code"
            maxlength="6"
            inputmode="numeric"
            :disabled="busy"
            :aria-invalid="!!fieldErrors.code"
            aria-describedby="replay-fund-error"
          >
          <p
            v-if="fieldErrors.code"
            id="replay-fund-error"
            class="error-message"
            role="alert"
          >
            {{ fieldErrors.code }}
          </p>
        </div>
        <div class="field">
          <label for="replay-start">从哪天开始</label>
          <input
            id="replay-start"
            ref="startInput"
            v-model="start"
            type="date"
            :max="latestDate"
            :disabled="busy"
            :aria-invalid="!!fieldErrors.start"
            aria-describedby="replay-start-error replay-range-help"
            @focus="refreshDateLimit"
          >
          <p
            v-if="fieldErrors.start"
            id="replay-start-error"
            class="error-message"
            role="alert"
          >
            {{ fieldErrors.start }}
          </p>
        </div>
        <div class="field">
          <label for="replay-end">到哪天结束</label>
          <input
            id="replay-end"
            ref="endInput"
            v-model="end"
            type="date"
            :max="latestDate"
            :disabled="busy"
            :aria-invalid="!!fieldErrors.end"
            aria-describedby="replay-end-error replay-range-help"
            @focus="refreshDateLimit"
          >
          <p
            v-if="fieldErrors.end"
            id="replay-end-error"
            class="error-message"
            role="alert"
          >
            {{ fieldErrors.end }}
          </p>
        </div>
      </div>
      <p
        id="replay-range-help"
        class="muted"
      >
        每次比较一只基金，跨度最多两年。日期可以选今天；结束日期选今天时，按截至昨天的历史行情计算。
        <span v-if="usingToday">本次实际回放截至 {{ dateLabel(latestCompleteDate) }}（北京时间）。</span>
      </p>
      <button
        class="primary-button"
        type="submit"
        :disabled="busy"
      >
        {{ replayBusy ? '正在模拟，请稍候…' : result ? '重新比较这段时间' : '看看哪种方式更好' }}
      </button>
    </form>
    <p
      v-if="replayBusy"
      class="status-note"
      role="status"
    >
      正在计算历史买卖、手续费和账户价值，完成后会显示本次结果。
    </p>
    <div
      v-if="replayError"
      class="error-message replay-error"
      role="alert"
    >
      <strong>这次没有生成可用的模拟结果</strong>
      <p>{{ replayError }}</p>
      <p
        v-if="submitted"
        class="scope-label"
      >
        基金 {{ submitted.fundCode }} · {{ dateLabel(submitted.startDate) }} 至 {{ dateLabel(submitted.endDate) }}
      </p>
    </div>
    <p
      v-if="!submitted && !replayError"
      class="muted empty-note"
    >
      选择好基金和日期后开始比较，结果会显示在这里。
    </p>

    <div
      v-if="comparisons"
      class="replay-result"
      aria-live="polite"
    >
      <p class="scope-label">
        本次结果 · 基金 {{ resultScope.fundCode }} · {{ dateLabel(resultScope.startDate) }} 至 {{ dateLabel(resultScope.endDate) }}
      </p>
      <p
        v-if="submitted && submitted.endDate !== resultScope.endDate"
        class="muted"
      >
        你选择的结束日期是 {{ dateLabel(submitted.endDate) }}；实际回放截至 {{ dateLabel(resultScope.endDate) }}，今天尚未结束的行情未计入。
      </p>
      <p
        v-if="inputChanged"
        class="changed-note"
      >
        上方条件已修改。下方仍是上述基金和日期的结果，点击“重新比较这段时间”后才会更新。
      </p>
      <div class="result-conclusion">
        <span class="muted">{{ modelEntries.length > 1 ? '先看本区间收益最高的模型表现' : '先看结论' }}</span>
        <h3>{{ headline }}</h3>
        <p>{{ drawdownConclusion }}</p>
      </div>
      <div class="outcome-grid">
        <article
          v-for="mode in Object.keys(comparisons)"
          :key="mode"
          class="outcome-card"
        >
          <template v-if="comparisons[mode]">
            <h4>{{ labelFor(mode) }}</h4>
            <p class="muted">
              起始本金 {{ money(comparisons[mode]!.initialCash) }}
            </p>
            <span class="muted">最后账户价值</span>
            <p class="final-money">
              {{ money(comparisons[mode]!.finalEquity) }}
            </p>
            <p class="gain-line">
              {{ gainText(comparisons[mode]!) }} · 累计收益 {{ percent(comparisons[mode]!.netReturn) }}
            </p>
            <p class="muted">
              已计入买卖手续费 {{ money(comparisons[mode]!.fees) }}，不用再扣一次。
            </p>
          </template>
          <p v-else>
            {{ labelFor(mode) }}的结果暂缺。
          </p>
        </article>
      </div>
      <p class="muted">
        每组模型都综合五日、二十日和半年预测。这里是用当前模型回看历史，本区间收益较高不代表以后最好，也不会因此自动更换正在使用的模型。
      </p>
      <p
        v-if="!result?.comparisonModels"
        class="changed-note"
      >
        这是旧版固定基础模型的回放，尚未比较已训练候选；更新后台服务后重新比较，可查看当前模型组合。
      </p>
      <div
        v-if="result?.excludedModels?.length"
        class="changed-note"
      >
        <strong>以下模型未参加本次比较</strong>
        <ul>
          <li
            v-for="(excluded, index) in result.excludedModels"
            :key="index"
          >
            {{ excluded.label }}：{{ excluded.reason }}
          </li>
        </ul>
      </div>
      <details class="result-details">
        <summary>查看详细对照与指标解释</summary>
        <div
          class="research-table"
          tabindex="0"
          role="region"
          aria-label="一直持有与模型买卖的历史模拟对照"
        >
          <table>
            <caption>相同基金、时间范围和模拟本金；收益已扣模拟交易费用。</caption>
            <thead>
              <tr>
                <th scope="col">
                  买卖方式
                </th><th scope="col">
                  最后账户价值
                </th><th scope="col">
                  扣费后累计收益
                </th><th scope="col">
                  最大回撤
                </th><th scope="col">
                  买卖笔数
                </th><th scope="col">
                  累计手续费
                </th><th scope="col">
                  没持有基金的天数
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(metric, mode) in comparisons"
                :key="mode"
              >
                <th scope="row">
                  {{ labelFor(mode) }}
                </th><td>{{ money(metric.finalEquity) }}</td><td>{{ percent(metric.netReturn) }}</td><td>{{ percent(metric.maxDrawdown) }}</td><td>{{ metric.tradeCount }} 笔</td><td>{{ money(metric.fees) }}</td><td>{{ metric.cashOnlySessions }} 个估值日</td>
              </tr>
            </tbody>
          </table>
        </div>
        <dl class="metric-guide">
          <div><dt>最后账户价值</dt><dd>剩余现金、持有基金市值和卖出后待到账的钱合计；尚未卖出的基金按期末净值计价。</dd></div>
          <div><dt>扣费后累计收益</dt><dd>这一整段时间赚或亏的比例，不是每年的收益率。</dd></div>
          <div><dt>最大回撤</dt><dd>账户从此前最高点往下跌，最严重的一次跌幅；不是最终亏损比例。</dd></div>
          <div><dt>买卖笔数与手续费</dt><dd>每笔买入、加仓、减仓或卖出分别计数，手续费受金额和持有时间影响，并非笔数越少就一定越便宜。</dd></div>
          <div><dt>没持有基金的天数</dt><dd>按有净值、能计算账户价值的日期统计，不一定连续，也不是所有自然日。</dd></div>
        </dl>
      </details>
    </div>
    <details
      v-if="result"
      class="result-details technical-details"
    >
      <summary>查看模拟假设与任务记录</summary>
      <p>{{ holding?.assumption ?? '本次未返回完整的费用假设。' }}</p>
      <p>过去的基金经理、规模及申赎开放状态未完整恢复。所有模型使用相同已接入资料，缺失的信息不假装已经参与判断。</p>
      <p v-if="result.inputSnapshot">
        未能生成预测的周期项：{{ result.inputSnapshot.failures?.length ?? '未提供' }}。
      </p>
      <p>任务编号：<code>{{ result.runId }}</code> · {{ result.status === 'SUCCEEDED' ? '计算完成' : '未完成' }}</p>
      <p v-if="result.inputSnapshot">
        输入记录编号：<code>{{ result.inputSnapshot.inputHash }}</code>
      </p>
      <div
        v-for="(model, id) in result.comparisonModels"
        :key="id"
      >
        <template v-if="model.modelRefs?.length">
          <h4>{{ model.label }}</h4>
          <p
            v-for="modelRef in sortPredictionHorizons(model.modelRefs, modelRef => modelRef.horizonId)"
            :key="modelRef.horizonId"
          >
            {{ horizons[modelRef.horizonId] ?? modelRef.horizonId }} · 模型 <code>{{ modelRef.modelId }}</code> · 指纹 <code>{{ modelRef.modelHash }}</code>
            · 训练答案截至 {{ modelRef.labelEndMax ? dateLabel(modelRef.labelEndMax.slice(0, 10)) : '基础方法无需训练' }}
          </p>
        </template>
      </div>
    </details>
    <p class="experiment-note">
      只做历史模拟，不会下单，也不会改变你的持仓。费用和到账时间按实验规则计算，不是实际账户收益。
    </p>

    <details class="model-research">
      <summary>比较五日、二十日、半年预测方法（进阶实验）</summary>
      <p>这里比较哪种方法更会判断涨跌。使用上方的基金代码，分别比较三个周期；与上面的买卖收益模拟是两个任务。</p>
      <p class="muted">
        固定用 2022—2023 年资料学习、2024 年上半年检查，之后到下方所选日期进行比较。上面的“从哪天开始”不会改变这项固定安排。
      </p>
      <div class="research-actions">
        <label
          class="field"
          for="research-end"
        >方法比较到哪天<input
          id="research-end"
          v-model="researchEnd"
          type="date"
          min="2024-06-29"
          :max="latestCompleteDate"
          :disabled="busy"
          @focus="refreshDateLimit"
        ></label>
        <button
          class="secondary-button"
          :disabled="busy"
          @click="train"
        >
          {{ researchBusy ? '正在处理…' : '开始比较三个周期的方法' }}
        </button>
      </div>
      <p
        v-if="researchError"
        class="error-message"
        role="alert"
      >
        {{ researchError }}
      </p>
      <div
        v-if="research"
        class="research-status"
        aria-live="polite"
      >
        <p><strong>方法比较：{{ researchStates[research.status] ?? '状态待核对' }}</strong></p>
        <p
          v-if="research.status === 'RUNNING'"
          class="muted"
        >
          计算需要一些时间，可点击“刷新比较进度”查看最新结果。
        </p>
        <article
          v-for="[horizon, item] in researchHorizons"
          :key="horizon"
          class="horizon-result"
        >
          <h4>{{ horizons[horizon] ?? '其他周期' }} · {{ selectionLabels[item.selection.decision] ?? '比较结论见记录' }}</h4>
          <p
            v-for="(model, index) in item.models"
            :key="model.modelId"
          >
            方法 {{ index + 1 }}：历史比较得分 {{ percent(model.metrics.primaryScore) }}；完成比较的样本比例 {{ percent(model.metrics.coverage) }}。
          </p>
          <details>
            <summary>查看模型编号</summary><p
              v-for="(model, index) in item.models"
              :key="model.modelId"
            >
              方法 {{ index + 1 }}：<code>{{ model.modelId }}</code>
            </p><p>原始比较结论：{{ item.selection.decision }}</p>
          </details>
        </article>
        <p class="muted">
          历史得分不是收益率，也不是今后的预测准确率。完成训练或比较，不代表已用于每天的预测；实际采用状态见上方“现在用什么方法预测”。
        </p>
        <button
          class="secondary-button"
          :disabled="busy || !researchId"
          @click="readResearch()"
        >
          刷新比较进度
        </button>
      </div>
      <details class="technical-details">
        <summary>读取以前的任务，或恢复未完成的比较</summary>
        <label
          class="field"
          for="research-id"
        >任务编号<input
          id="research-id"
          v-model="researchId"
          placeholder="粘贴以前保存的任务编号"
          :disabled="busy"
        ></label>
        <div class="research-actions">
          <button
            class="secondary-button"
            :disabled="busy || !researchId.trim()"
            @click="readResearch()"
          >
            读取这个任务
          </button>
          <button
            class="secondary-button"
            :disabled="busy || !researchId.trim()"
            @click="readResearch('cancel')"
          >
            取消这个任务
          </button>
          <button
            class="secondary-button"
            :disabled="busy || !researchId.trim()"
            @click="readResearch('resume')"
          >
            继续未完成的比较
          </button>
        </div>
        <p v-if="research">
          当前任务：<code>{{ research.run_id }}</code> · {{ research.status }}
        </p>
      </details>
    </details>
  </section>
</template>

<style scoped>
.replay-panel { min-width: 0; }
.replay-panel p { line-height: 1.75; }
.intro { margin-bottom: 22px; }
.muted { color: var(--workspace-muted, #647b72); font-size: 13px; }
.research-form { display: grid; grid-template-columns: repeat(3, minmax(0, 230px)); align-items: start; gap: 16px; margin: 16px 0 8px; }
.field { display: grid; gap: 8px; min-width: 0; }
.field input { width: 100%; min-width: 0; min-height: 44px; padding: 10px 12px; border: 1px solid var(--workspace-border, #bdcdc3); border-radius: 6px; background: white; font: inherit; }
.field input[aria-invalid="true"] { border-color: #b42318; }
.field .error-message { margin: 0; font-size: 13px; }
input:focus-visible, summary:focus-visible, .research-table:focus-visible { outline: 2px solid var(--workspace-accent, #0f766e); outline-offset: 3px; }
button:disabled { opacity: .6; cursor: not-allowed; }
#replay-range-help { margin: 12px 0 18px; max-width: 860px; }
.research-actions { display: flex; flex-wrap: wrap; align-items: end; gap: 12px; margin: 16px 0; }
.replay-result { margin-top: 28px; padding-top: 22px; border-top: 1px solid var(--workspace-border, #dce5df); }
.scope-label { font-size: 14px; font-weight: 600; }
.changed-note { padding: 10px 14px; color: #755a16; background: #faf5e8; border-radius: 6px; }
.result-conclusion { margin: 16px 0; padding: 20px; border-radius: 8px; background: #edf5f2; }
.result-conclusion h3 { margin: 6px 0 10px; font-size: 21px; line-height: 1.6; }
.result-conclusion p { margin: 0; }
.outcome-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 16px; }
.outcome-card { padding: 20px; border: 1px solid var(--workspace-border, #dce5df); border-radius: 8px; min-width: 0; }
.outcome-card h4 { margin: 0; font-size: 17px; }
.outcome-card .final-money { margin: 4px 0; font-size: clamp(24px, 3vw, 32px); line-height: 1.4; font-weight: 700; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.gain-line { margin: 10px 0; }
.replay-error { margin-top: 18px; padding: 14px 16px; background: #fff5f3; border-radius: 6px; }
.replay-error p { margin: 6px 0 0; }
.result-details, .model-research { margin-top: 18px; border-top: 1px solid var(--workspace-border, #dce5df); }
summary { min-height: 44px; padding: 12px 0; cursor: pointer; line-height: 1.6; }
.research-table { overflow: auto; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
caption { text-align: left; padding: 8px 0 14px; color: var(--workspace-muted, #647b72); }
th, td { padding: 12px; text-align: left; border-bottom: 1px solid var(--workspace-border, #dce5df); white-space: nowrap; font-variant-numeric: tabular-nums; }
.metric-guide { display: grid; gap: 14px; margin-top: 20px; font-size: 14px; }
.metric-guide dt { font-weight: 600; }
.metric-guide dd { margin: 4px 0 0; line-height: 1.7; color: var(--workspace-muted, #647b72); }
.technical-details { overflow-wrap: anywhere; }
code { font-size: 12px; overflow-wrap: anywhere; }
.experiment-note { margin: 18px 0 0; font-size: 13px; color: var(--workspace-muted, #647b72); }
.horizon-result { padding: 14px 0; border-bottom: 1px solid var(--workspace-border, #dce5df); }
.horizon-result h4 { margin: 0; }
@media (max-width: 700px) {
  .research-form, .outcome-grid { grid-template-columns: 1fr; }
  .result-conclusion, .outcome-card { padding: 16px; }
  .result-conclusion h3 { font-size: 19px; }
}
</style>
