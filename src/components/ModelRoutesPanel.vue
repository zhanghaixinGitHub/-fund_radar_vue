<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { get } from '@/api/http'
import { simTime } from '@/utils/simulation'

interface Model {
  model_id: string
  content_hash: string
  /** 后端累计的真实预测记录数，包含候选记录；不能当作基金数或预测正确次数。 */
  live_calls: number
  last_live_call: string | null
  manifest: { recipeVersion: string; labelEndMax: string | null; trainedAt: string | null; evidenceLevel: string }
}
interface Route { route_key: string; model_id: string; revision: number; previous_model_id: string | null; shadow_ids: string[] }
interface ModelEvent { action: string; model_id: string; created_at: string; reason: { reason?: string; result?: { decision: string } } }
interface EvaluatedModel { modelId: string; metrics: { primaryScore: number | null; coverage: number } }
interface Evaluation {
  evaluation_id: string
  experiment_id: string
  created_at: string
  payload: {
    current: EvaluatedModel
    candidates: EvaluatedModel[]
    result: { decision: string; winner: string; decisions: { modelId: string; reason: string }[] }
  }
}
interface ModelStatus { models: Model[]; routes: Route[]; activeRouteKeys: string[]; events: ModelEvent[]; evaluations: Evaluation[]; readAt: string }

const value = ref<ModelStatus | null>(null)
const error = ref('')
const loading = ref(false)
const horizons: Record<string, { label: string; description: string; order: number }> = {
  T5_V1: { label: '五日预测', description: '判断未来五个交易日的整体方向', order: 0 },
  T20_V1: { label: '二十日预测', description: '判断未来二十个交易日的整体方向', order: 1 },
  M6_V1: { label: '半年预测', description: '判断未来六个自然月的整体方向', order: 2 },
}
const recipes: Record<string, { name: string; explanation: string }> = {
  NAV_MOMENTUM_THREE_STATE_V2: { name: '近期走势法（三分类）', explanation: '按近期净值的整体变化，分别判断上涨、持平或下跌；小幅波动归为持平。' },
  TOTAL_RETURN_LOGISTIC_THREE_STATE_V2: { name: '历史学习法（三分类）', explanation: '从历史涨跌、波动和回撤学习三种结果，分别预测上涨、持平或下跌。' },
  NAV_MOMENTUM_BASELINE_V1: { name: '近期走势法', explanation: '按近期净值的整体变化，判断未来这一段时间上涨还是下跌或持平。' },
  TOTAL_RETURN_LOGISTIC_V1: { name: '历史学习法', explanation: '从历史净值的涨跌、波动和回撤中学习规律，再判断未来这一段时间的方向。' },
}
const eventNames: Record<string, string> = { ACTIVATE: '更换采用方法', FALLBACK: '故障后使用备用方法', REGISTER: '登记预测方法', BOOTSTRAP: '启用基础方法' }
const horizonId = (route: Route) => route.route_key.split(':').at(-2) ?? ''
const horizonName = (route: Route) => horizons[horizonId(route)]?.label ?? '其他周期预测'
const model = (id: string) => value.value?.models.find(item => item.model_id === id)
const methodName = (id: string) => recipes[model(id)?.manifest.recipeVersion ?? '']?.name ?? '已登记的预测方法'
const methodExplanation = (id: string) => recipes[model(id)?.manifest.recipeVersion ?? '']?.explanation ?? '该方法的通俗说明尚未登记，可在下方查看模型详情。'
const percent = (number: number | null | undefined) => number == null || !Number.isFinite(number) ? '暂无可比较结果' : `${(number * 100).toFixed(2)}%`
const time = (date: string | null | undefined) => date && !Number.isNaN(Date.parse(date)) ? simTime(date) : '暂无记录'
const count = (id: string) => model(id)?.live_calls == null ? '暂缺统计' : `${model(id)!.live_calls.toLocaleString('zh-CN')} 条`
const comparedIds = (route: Route) => route.shadow_ids.filter(id => id !== route.model_id)
const modelIds = (route: Route) => [...new Set([route.model_id, ...route.shadow_ids])]
const routes = computed(() => [...(value.value?.routes ?? [])].filter(route => value.value?.activeRouteKeys.includes(route.route_key)).sort((a, b) =>
  (horizons[horizonId(a)]?.order ?? 99) - (horizons[horizonId(b)]?.order ?? 99)))
const legacyRoutes = computed(() => (value.value?.routes ?? []).filter(route => !value.value?.activeRouteKeys.includes(route.route_key)))

/** 只用与当前主模型、当前候选都匹配的冻结比较证据，避免拿旧候选成绩解释新版本。 */
function latestComparison(route: Route) {
  return [...(value.value?.evaluations ?? [])]
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .find(entry => entry.payload.result.winner === route.model_id
      && route.shadow_ids.every(id => entry.payload.candidates.some(candidate => candidate.modelId === id)))
}
function adoptionReason(route: Route) {
  const evaluation = latestComparison(route)
  if (!evaluation) return '当前路由配置了这套方法；实际预测以保存原文中的模型身份为准，暂时没有可展示的历史比较结果。'
  return evaluation.payload.result.decision === 'KEEP_CURRENT'
    ? '最近一次历史比较中，新方法没有胜出，所以继续使用当前方法。'
    : '历史研究曾提名这套方法。当前配置见路由，真实采用还需核对新预测、综合建议和采用回执。'
}
function trainingExplanation(id: string) {
  const item = model(id)
  // 固定规则本身不需要训练；旧包没有提供日期则明确未知，不再把两种情况混成一句。
  if (['NAV_MOMENTUM_BASELINE_V1', 'NAV_MOMENTUM_THREE_STATE_V2'].includes(item?.manifest.recipeVersion ?? '')) return '固定规则，无须训练；预测时会读取当时可用的净值。'
  if (!item?.manifest.labelEndMax || Number.isNaN(Date.parse(item.manifest.labelEndMax))) return '尚未提供训练样本的结果截止日期。'
  const date = new Date(item.manifest.labelEndMax).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })
  return `学习样本的已知涨跌结果截至 ${date}。新预测仍会读取当时可用的净值。`
}
async function load() {
  if (loading.value) return
  loading.value = true
  error.value = ''
  try { value.value = await get<ModelStatus>('/api/v1/admin/model-routes') }
  catch (reason) { error.value = reason instanceof Error ? reason.message : '暂时无法读取，请重试。' }
  finally { loading.value = false }
}
onMounted(load)
</script>

<template>
  <section
    class="analysis-section model-status"
    aria-labelledby="model-status-title"
    :aria-busy="loading"
  >
    <div class="section-heading">
      <div>
        <h2 id="model-status-title">
          现在用什么方法预测
        </h2>
        <p class="section-intro">
          按周期查看正在使用的方法，以及正在参加比较的新方法。
        </p>
      </div>
      <button
        class="secondary-button"
        :disabled="loading"
        @click="load"
      >
        {{ loading ? '正在刷新…' : '刷新状态' }}
      </button>
    </div>
    <p
      v-if="error"
      class="error-message"
      role="alert"
    >
      {{ value ? '刷新失败，下方保留上次读取的结果。' : '预测方法读取失败。' }}{{ error }}
    </p>
    <p
      v-if="loading && !value"
      role="status"
    >
      正在读取各周期的预测方法…
    </p>
    <p
      v-else-if="value && !routes.length"
      class="muted"
    >
      还没有登记可用的预测方法。
    </p>

    <div
      v-if="routes.length"
      class="method-grid"
    >
      <article
        v-for="route in routes"
        :key="route.route_key"
        class="method-card"
      >
        <div class="method-heading">
          <h3>{{ horizonName(route) }}</h3>
          <span class="experiment-label">实验中</span>
        </div>
        <p class="method-caption">
          {{ horizons[horizonId(route)]?.description ?? '周期定义见下方技术详情' }}
        </p>
        <div class="current-method">
          <span class="method-role">当前配置</span>
          <h4>{{ methodName(route.model_id) }}</h4>
          <p>{{ methodExplanation(route.model_id) }}</p>
          <dl class="method-records">
            <div><dt>已保存预测</dt><dd>{{ count(route.model_id) }}</dd></div>
            <div><dt>最近保存</dt><dd>{{ time(model(route.model_id)?.last_live_call) }}</dd></div>
          </dl>
        </div>
        <div class="adoption-reason">
          <strong>为什么用它</strong>
          <p>{{ adoptionReason(route) }}</p>
        </div>
        <div class="candidate-methods">
          <p
            v-if="!comparedIds(route).length"
            class="muted"
          >
            暂时没有同时比较的新方法。
          </p>
          <div
            v-for="(id, index) in comparedIds(route)"
            :key="id"
            class="candidate-method"
          >
            <span class="method-role">正在比较{{ comparedIds(route).length > 1 ? ` · 新方法${index + 1}` : '的新方法' }}</span>
            <h4>{{ methodName(id) }}</h4>
            <p>已保存预测：{{ count(id) }}。同时记录结果供比较，暂不作为主要判断。</p>
          </div>
        </div>

        <details
          v-if="latestComparison(route)"
          class="method-details"
        >
          <summary>查看历史比较结果</summary>
          <p class="muted">
            比较时间：{{ time(latestComparison(route)!.created_at) }}
          </p>
          <p>以下是相同历史资料上的比较得分，不是收益率，也不代表今后的预测准确率。</p>
          <div class="comparison-table">
            <table>
              <caption class="muted">
                可比较比例：计划样本中，成功生成预测且已经知道最终涨跌结果的比例。
              </caption>
              <thead>
                <tr>
                  <th scope="col">
                    方法
                  </th><th scope="col">
                    历史得分
                  </th><th scope="col">
                    可比较比例
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">
                    原方法
                  </th>
                  <td>{{ percent(latestComparison(route)!.payload.current.metrics.primaryScore) }}</td>
                  <td>{{ percent(latestComparison(route)!.payload.current.metrics.coverage) }}</td>
                </tr>
                <tr
                  v-for="(candidate, index) in latestComparison(route)!.payload.candidates"
                  :key="candidate.modelId"
                >
                  <th scope="row">
                    新方法{{ latestComparison(route)!.payload.candidates.length > 1 ? index + 1 : '' }}
                  </th>
                  <td>{{ percent(candidate.metrics.primaryScore) }}</td>
                  <td>{{ percent(candidate.metrics.coverage) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="muted">
            同一天、同一基金的不同份额按统一权重比较；得分更高也不等于已经证明长期有效。
          </p>
        </details>
        <details class="method-details technical-details">
          <summary>模型与训练详情（排查用）</summary>
          <p>当前采用第 {{ route.revision }} 版配置；{{ route.route_key.endsWith(':ALL') ? '这是通用方法，不表示已经覆盖全市场所有基金。' : '这是针对指定基金类别配置的方法。' }}</p>
          <p>周期标识：<code>{{ horizonId(route) }}</code></p>
          <div
            v-for="id in modelIds(route)"
            :key="id"
            class="model-identity"
          >
            <strong>{{ id === route.model_id ? '当前方法' : '比较中的方法' }} · {{ methodName(id) }}</strong>
            <p>{{ trainingExplanation(id) }}</p>
            <p>最近保存预测：{{ time(model(id)?.last_live_call) }}</p>
            <dl>
              <div><dt>模型编号</dt><dd><code>{{ id }}</code></dd></div>
              <div><dt>算法标识</dt><dd><code>{{ model(id)?.manifest.recipeVersion ?? '尚未提供' }}</code></dd></div>
              <div><dt>文件指纹</dt><dd><code>{{ model(id)?.content_hash ?? '尚未提供' }}</code></dd></div>
            </dl>
          </div>
          <p v-if="latestComparison(route)">
            研究编号：<code>{{ latestComparison(route)!.experiment_id }}</code>
          </p>
          <p class="muted">
            编号和指纹用于核对模型版本，不是预测分数。
          </p>
        </details>
      </article>
    </div>
    <details
      v-if="legacyRoutes.length"
      class="event-history"
    >
      <summary>旧目标或其他规则的路由（不用于当前三分类）</summary>
      <p
        v-for="route in legacyRoutes"
        :key="route.route_key"
      >
        {{ horizonName(route) }} · {{ methodName(route.model_id) }} · {{ route.model_id }}<br>{{ route.route_key }}
      </p>
    </details>
    <p
      v-if="routes.length"
      class="record-explanation"
    >
      <strong>“已保存预测”是记录数，不是预测正确次数。</strong>计数包含主预测和影子比较记录。同一批基金可以同时由多种方法预测，不能把各方法的记录数相加当作基金数量。每条预测是否正确，需要等对应周期结束后再核验。
    </p>
    <details
      v-if="value?.events.length"
      class="event-history"
    >
      <summary>查看方法更换与故障记录</summary>
      <ol>
        <li
          v-for="(event, index) in value.events"
          :key="index"
        >
          {{ time(event.created_at) }} · {{ eventNames[event.action] ?? '方法状态更新' }} · {{ methodName(event.model_id) }}
          <details class="event-technical">
            <summary>原始记录</summary><p><code>{{ event.action }} · {{ event.model_id }}</code></p><p>{{ event.reason.reason ?? event.reason.result?.decision ?? '未提供补充说明' }}</p>
          </details>
        </li>
      </ol>
    </details>
    <p
      v-if="value"
      class="read-time"
    >
      读取于 {{ time(value.readAt) }} · 本区域时间均为北京时间
    </p>
  </section>
</template>

<style scoped>
.model-status { min-width: 0; }
.section-heading { justify-content: space-between; }
.section-intro { margin: 8px 0 0; color: var(--workspace-muted, #647b72); }
.method-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 16px; align-items: start; }
.method-card { min-width: 0; padding: 20px; border: 1px solid var(--workspace-border, #dfe8e3); border-radius: 8px; }
.method-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.method-heading h3 { margin: 0; font-size: 20px; }
.experiment-label { flex-shrink: 0; border-radius: 4px; padding: 2px 8px; background: #f5f1e5; color: #755a16; font-size: 12px; }
.method-caption, .muted { color: var(--workspace-muted, #647b72); font-size: 13px; }
.method-caption { margin: 6px 0 20px; }
.current-method { padding: 16px; background: #f0f7f4; border-radius: 6px; }
.method-role { color: var(--workspace-accent, #0f766e); font-size: 13px; font-weight: 600; }
.method-card h4 { margin: 4px 0 8px; font-size: 18px; }
.method-card p { line-height: 1.7; }
.current-method > p { margin: 0; }
.method-records { display: grid; gap: 8px; margin: 16px 0 0; }
.method-records > div { display: grid; grid-template-columns: 6em minmax(0, 1fr); gap: 8px; }
.method-records dt { color: var(--workspace-muted, #647b72); }
.method-records dd { margin: 0; overflow-wrap: anywhere; }
.adoption-reason { margin-top: 18px; }
.adoption-reason p { margin: 4px 0 0; }
.candidate-methods { margin: 18px 0 10px; }
.candidate-method + .candidate-method { margin-top: 14px; }
.candidate-method h4 { font-size: 16px; }
.candidate-method p { margin: 0; }
.method-details { border-top: 1px solid var(--workspace-border, #dfe8e3); }
summary { min-height: 44px; padding: 10px 0; cursor: pointer; line-height: 24px; }
summary:focus-visible { outline: 2px solid var(--workspace-accent, #0f766e); outline-offset: 3px; border-radius: 3px; }
.comparison-table { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
caption { text-align: left; caption-side: bottom; padding-top: 10px; }
th, td { padding: 10px 4px; text-align: left; border-bottom: 1px solid var(--workspace-border, #dfe8e3); }
.technical-details, .event-history { overflow-wrap: anywhere; }
.technical-details dl { margin: 12px 0; }
.technical-details dt { color: var(--workspace-muted, #647b72); }
.technical-details dd { margin: 2px 0 10px; }
.model-identity { padding-top: 14px; }
code { font-size: 12px; overflow-wrap: anywhere; }
.record-explanation { padding: 14px 16px; margin: 18px 0 6px; background: #f5f7f6; border-radius: 6px; color: #496157; line-height: 1.8; }
.event-history ol { padding-left: 20px; }
.event-history li { margin-bottom: 12px; }
.event-technical { margin-top: 4px; }
.read-time { margin: 8px 0 0; color: var(--workspace-muted, #647b72); font-size: 12px; }
@media (max-width: 600px) {
  .method-card { padding: 16px; }
  .method-records > div { grid-template-columns: 1fr; gap: 2px; }
  .method-heading h3 { font-size: 19px; }
}
</style>
