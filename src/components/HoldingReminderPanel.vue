<script setup lang="ts">
import { computed, defineComponent, h, onBeforeUnmount, ref, useId, watch } from 'vue'
import PredictionHistoryDrawer from '@/components/PredictionHistoryDrawer.vue'
import {
  confirmHoldingRule, fetchHoldingRules, fetchRuleDraft, generateRuleDraft, revokeHoldingRule,
} from '@/api/advice'
import { getSimOverview } from '@/api/simulation'
import type { HoldingRule, HoldingRulesView, RuleDraftTier, RuleDraftView } from '@/types/advice'
import type { SimPosition } from '@/types/simulation'
import { rulePctText, ruleStatsUpdated, ruleStatusLabel, ruleTierLabel, ruleTriggerText } from '@/utils/advice'
import { simTime } from '@/utils/simulation'

const props = defineProps<{ fundCode: string; canWrite: boolean; inlineEditor?: boolean }>()
const emit = defineEmits<{ 'rules-change': [view: HoldingRulesView]; 'busy-change': [busy: boolean] }>()
const InlineReminderEditor = defineComponent({
  props: { title: String },
  setup(editor, { slots }) {
    return () => h('section', { 'aria-label': editor.title }, [
      slots.default?.(),
      h('div', { class: 'inline-reminder-actions' }, slots.footer?.()),
    ])
  },
})
type DownsideBasis = 'HOLDING_LOSS' | 'DRAWDOWN'

const draft = ref<RuleDraftView | null>(null)
const reminderItems = [
  { key: 'PROFIT', label: '止盈提醒', detail: '按持仓收益率计算' },
  { key: 'HOLDING_LOSS', label: '持仓亏损提醒', detail: '按相对持仓成本的亏损计算' },
  { key: 'DRAWDOWN', label: '高点回撤提醒', detail: '按基金净值从统计高点回落的幅度计算' },
] as const
type ReminderItem = typeof reminderItems[number]
const editing = ref<ReminderItem | null>(null)
const formId = useId()
const holdingRules = ref<HoldingRulesView | null>(null)
const position = ref<SimPosition | null>(null)
const profitPercent = ref('')
const downsidePercent = ref('')
const loading = ref(true)
const saving = ref(false)
const refreshing = ref(false)
const revoking = ref(false)
const revokeArmed = ref(false)
const error = ref('')
const formError = ref('')
const message = ref('')
let generation = 0
let alive = true

const activeRule = computed(() => holdingRules.value?.active ?? null)
const draftAvailable = computed(() => draft.value?.status === 'AVAILABLE')
const statsUpdated = computed(() => ruleStatsUpdated(activeRule.value, draft.value))
const blockReason = computed(() => {
  if (!props.canWrite) return '当前账户没有保存持仓提醒的权限。'
  if (!position.value) return '该基金当前没有持仓记录，只能查看系统参考。'
  if (position.value.issue) return `持仓核对尚未通过：${position.value.issue}。核对完成前不能保存提醒。`
  if (Number(position.value.shares) <= 0) return '份额尚未确认或已清仓，只能查看系统参考。'
  return ''
})
const canSave = computed(() => !blockReason.value)
const busy = computed(() => saving.value || refreshing.value || revoking.value)
watch(busy, value => emit('busy-change', value), { flush: 'sync' })
const existingBasis = computed(() => activeRule.value?.reduceDrawdownPct != null ? basisOf(activeRule.value) : null)
const switchingBasis = computed(() => editing.value && editing.value.key !== 'PROFIT'
  && existingBasis.value && existingBasis.value !== editing.value.key)

function currentValue(item: ReminderItem) {
  const rule = activeRule.value
  if (!rule) return null
  if (item.key === 'PROFIT') return rule.takeProfitPct
  return basisOf(rule) === item.key ? rule.reduceDrawdownPct : null
}

function openEditor(item: ReminderItem) {
  fillFromActive()
  editing.value = item
  message.value = ''
  error.value = ''
  if (item.key !== 'PROFIT') {
    if (existingBasis.value !== item.key) downsidePercent.value = ''
  }
}

function closeEditor() {
  if (busy.value) return
  editing.value = null
  revokeArmed.value = false
  error.value = ''
  message.value = ''
}

function basisOf(rule: HoldingRule): DownsideBasis {
  return rule.ruleParams?.downsideBasis === 'HOLDING_LOSS' ? 'HOLDING_LOSS' : 'DRAWDOWN'
}
function percentInput(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return ''
  const number = Math.abs(Number(value) * 100)
  return Number.isFinite(number) ? String(Number(number.toFixed(4))) : ''
}
function fillFromActive() {
  const rule = activeRule.value
  profitPercent.value = percentInput(rule?.takeProfitPct)
  downsidePercent.value = percentInput(rule?.reduceDrawdownPct)
  formError.value = ''
}
function applyReference(tier: RuleDraftTier) {
  if (!canSave.value || busy.value || !editing.value) return
  if (editing.value.key === 'PROFIT') profitPercent.value = percentInput(tier.takeProfitPct)
  if (editing.value.key === 'DRAWDOWN') downsidePercent.value = percentInput(tier.reduceDrawdownPct)
  formError.value = ''
  message.value = '系统参考已填入，尚未保存；请按自己的需要调整后点击“保存提醒”。'
}
async function load() {
  const run = ++generation
  loading.value = true; error.value = ''; message.value = ''; formError.value = ''
  draft.value = null; editing.value = null; holdingRules.value = null; position.value = null; revokeArmed.value = false
  if (!props.fundCode) { loading.value = false; return }
  try {
    const [draftResult, rulesResult, overview] = await Promise.all([
      fetchRuleDraft(props.fundCode), fetchHoldingRules(props.fundCode), getSimOverview(),
    ])
    if (!alive || run !== generation) return
    draft.value = draftResult
    holdingRules.value = rulesResult
    emit('rules-change', rulesResult)
    position.value = overview.positions.find(item => item.fundCode === props.fundCode) ?? null
    fillFromActive()
  } catch (reason) {
    if (alive && run === generation) error.value = reason instanceof Error ? reason.message : '提醒设置暂时无法读取。'
  } finally {
    if (alive && run === generation) loading.value = false
  }
}
async function save() {
  formError.value = ''; message.value = ''
  const item = editing.value
  if (!item || busy.value || !canSave.value) return
  const isProfit = item.key === 'PROFIT'
  const percent = Number(isProfit ? profitPercent.value : downsidePercent.value)
  const max = isProfit ? 1000 : 100
  if (!Number.isFinite(percent) || percent < 0.01 || percent > max) {
    formError.value = `${item.label}需为 0.01% 到 ${max}%。`
    return
  }
  saving.value = true; error.value = ''
  const fund = props.fundCode
  try {
    const result = await confirmHoldingRule(fund, item.key === 'PROFIT'
      ? { tier: 'CUSTOM', takeProfitPct: (percent / 100).toFixed(4) }
      : { tier: 'CUSTOM', reduceDrawdownPct: (-percent / 100).toFixed(4), downsideBasis: item.key })
    if (!alive || fund !== props.fundCode) return
    holdingRules.value = result
    emit('rules-change', result)
    fillFromActive()
    editing.value = null
    revokeArmed.value = false
    message.value = '提醒已保存。达到数值后只提示复核，不会自动交易。'
  } catch (reason) {
    if (alive && fund === props.fundCode) error.value = reason instanceof Error ? reason.message : '提醒保存失败，请稍后重试。'
  } finally { if (alive) saving.value = false }
}
async function revoke() {
  if (!revokeArmed.value) { revokeArmed.value = true; return }
  if (busy.value || !props.canWrite) return
  revoking.value = true; error.value = ''; message.value = ''
  const fund = props.fundCode
  try {
    const result = await revokeHoldingRule(fund)
    if (!alive || fund !== props.fundCode) return
    holdingRules.value = result
    emit('rules-change', result)
    revokeArmed.value = false
    editing.value = null
    message.value = '提醒已关闭，修改记录仍然保留。'
  } catch (reason) {
    if (alive && fund === props.fundCode) error.value = reason instanceof Error ? reason.message : '关闭结果暂时无法确认，请刷新查看。'
  } finally { if (alive) revoking.value = false }
}
async function refreshReference() {
  if (busy.value || !props.canWrite) return
  refreshing.value = true; error.value = ''; message.value = ''
  const fund = props.fundCode
  try {
    const result = await generateRuleDraft(fund)
    if (!alive || fund !== props.fundCode) return
    draft.value = result
    message.value = '系统参考已检查；你已保存的提醒不会自动改变。'
  } catch (reason) {
    if (alive && fund === props.fundCode) error.value = reason instanceof Error ? reason.message : '系统参考更新失败，请稍后重试。'
  } finally { if (alive) refreshing.value = false }
}

watch(() => props.fundCode, () => void load(), { immediate: true })
onBeforeUnmount(() => { alive = false; generation++ })
</script>

<template>
  <div
    class="reminder-panel"
    :aria-busy="loading || saving || refreshing"
  >
    <p
      v-if="error && !editing"
      class="error-message"
      role="alert"
    >
      {{ error }}
      <button
        v-if="!draft || !holdingRules"
        type="button"
        class="secondary-button"
        @click="load"
      >
        重新读取
      </button>
    </p>
    <p
      v-if="message && !editing"
      class="sim-success"
      role="status"
    >
      {{ message }}
    </p>
    <p
      v-if="loading"
      class="sim-muted"
      role="status"
    >
      正在读取提醒设置…
    </p>
    <template v-else-if="draft && holdingRules && !(inlineEditor && editing)">
      <section aria-label="提醒设置">
        <ul class="reminder-list">
          <li v-for="item in reminderItems" :key="item.key">
            <div>
              <strong>{{ item.label }}</strong>
              <small>{{ item.detail }}</small>
            </div>
            <span>{{ currentValue(item) == null ? '未设置' : rulePctText(currentValue(item)) }}</span>
            <button
              class="secondary-button"
              type="button"
              aria-haspopup="dialog"
              :aria-label="`${canSave ? (currentValue(item) == null ? '设置' : '修改') : '查看'}${item.label}`"
              @click="openEditor(item)"
            >
              {{ canSave ? (currentValue(item) == null ? '设置' : '修改') : '查看' }}
            </button>
          </li>
        </ul>
      </section>

      <details
        v-if="holdingRules.history.length"
        class="reminder-history"
      >
        <summary>修改记录（{{ holdingRules.history.length }}）</summary>
        <div class="advice-table-wrap">
          <table
            class="advice-table market-table market-table--compact"
            data-table-align
          >
            <thead>
              <tr>
                <th scope="col">
                  保存时间
                </th><th scope="col">
                  提醒数值
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
                  止盈 {{ rulePctText(item.takeProfitPct) }}；
                  {{ basisOf(item) === 'HOLDING_LOSS' ? '持仓亏损' : '高点回撤' }} {{ rulePctText(item.reduceDrawdownPct) }}
                </td>
                <td>{{ ruleStatusLabel(item) }}<small v-if="item.supersededAt">{{ simTime(item.supersededAt) }}</small></td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
    </template>
    <component
      v-if="editing && draft"
      :is="inlineEditor ? InlineReminderEditor : PredictionHistoryDrawer"
      :title="editing.label"
      close-label="关闭提醒设置"
      @close="closeEditor"
    >
      <form :id="formId" class="reminder-editor" novalidate @submit.prevent="save">
        <p class="sim-muted">基金 {{ fundCode }} · {{ editing.detail }}</p>
        <p v-if="blockReason" class="notice-banner" role="status">{{ blockReason }}</p>
        <p v-if="switchingBasis" class="notice-banner">
          保存后，下跌提醒将改为按{{ editing.key === 'DRAWDOWN' ? '高点回撤' : '持仓亏损' }}计算。
        </p>
        <label v-if="editing.key === 'PROFIT'" for="holding-profit-reminder">
          止盈提醒
          <span class="reminder-input">
            <input id="holding-profit-reminder" v-model="profitPercent" type="number" inputmode="decimal" min="0.01" max="1000" step="0.01" required :disabled="!canSave || busy" placeholder="例如 15">
            <span>%</span>
          </span>
        </label>
        <label v-else for="holding-downside-reminder">
          {{ editing.label }}
          <span class="reminder-input">
            <input id="holding-downside-reminder" v-model="downsidePercent" type="number" inputmode="decimal" min="0.01" max="100" step="0.01" required :disabled="!canSave || busy" placeholder="例如 8">
            <span>%</span>
          </span>
        </label>
        <p v-if="formError || error" class="error-message" role="alert">{{ formError || error }}</p>
        <p v-if="message" class="sim-success" role="status">{{ message }}</p>
      </form>
      <section class="editor-reference" aria-label="系统参考">
        <h3>系统参考</h3>
        <p v-if="editing.key === 'HOLDING_LOSS'" class="sim-muted">
          系统参考按基金净值的高点回撤计算。持仓亏损请根据自己的持仓成本设定。
        </p>
        <template v-else-if="draftAvailable">
          <p class="sim-muted">
            统计截至 {{ draft.statsCutoffDate ?? '未知' }}，基于 {{ draft.historyDays ?? '—' }} 个交易日、{{ draft.windowCount ?? '—' }} 个统计区间。
            {{ statsUpdated ? '参考值已更新。' : '' }}填入后由你确认保存。
          </p>
          <p v-if="draft.assumption" class="sim-muted">
            参考值按历史净值计算，未把分红加回净值。因此，分红前后的净值变化可能与实际收益不同。
          </p>
          <div v-for="tier in draft.tiers" :key="tier.tier" class="reference-row">
            <details open>
              <summary>{{ ruleTierLabel(tier.tier) }} {{ rulePctText(editing.key === 'PROFIT' ? tier.takeProfitPct : tier.reduceDrawdownPct) }}</summary>
              <p>{{ ruleTriggerText(editing.key === 'PROFIT' ? tier.takeProfitTrigger : tier.reduceTrigger) }}</p>
            </details>
            <button v-if="canSave" class="secondary-button" type="button" :disabled="busy" @click="applyReference(tier)">填入参考值</button>
          </div>
        </template>
        <p v-else class="sim-muted">{{ draft.reason || (draft.status === 'NOT_APPLICABLE' ? '该基金暂不适用系统参考。' : '历史数据不足，暂不提供参考值。') }}</p>
        <button
          v-if="canWrite && editing.key !== 'HOLDING_LOSS'"
          class="secondary-button"
          type="button"
          :disabled="busy"
          @click="refreshReference"
        >
          {{ refreshing ? '正在检查…' : '更新系统参考' }}
        </button>
      </section>
      <div v-if="canWrite && activeRule" class="editor-reference">
        <p v-if="revokeArmed">确认关闭这只基金的止盈和下跌提醒？</p>
        <button class="secondary-button" type="button" :disabled="busy" @click="revoke">
          {{ revokeArmed ? '确认关闭全部提醒' : '关闭全部提醒' }}
        </button>
        <button v-if="revokeArmed" class="text-button" type="button" :disabled="busy" @click="revokeArmed = false">取消关闭</button>
      </div>
      <template #footer>
        <button class="secondary-button" type="button" :disabled="busy" @click="closeEditor">取消</button>
        <button v-if="canSave" class="primary-button" type="submit" :form="formId" :disabled="busy">
          {{ saving ? '正在保存…' : '保存提醒' }}
        </button>
      </template>
    </component>
  </div>
</template>

<style scoped>
.reminder-list { list-style: none; padding: 0; margin: 0; }
.reminder-list li { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) auto; align-items: center; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--ui-line); }
.reminder-list small { display: block; color: var(--ui-muted); margin-top: 4px; }
.reminder-list li > span { font-variant-numeric: tabular-nums; }
.reminder-editor { display: grid; gap: 12px; padding-top: 16px; }
.reminder-panel :deep(.inline-reminder-actions) { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.reminder-editor p { margin: 0; }
.reminder-editor label { display: grid; justify-items: start; gap: 6px; }
.reminder-input { display: flex; align-items: center; gap: 8px; }
.reminder-input input, .reminder-editor select { box-sizing: border-box; min-height: 44px; padding: 8px 12px; border: 1px solid var(--ui-line); border-radius: 7px; color: var(--ui-ink); background: var(--ui-surface); font: inherit; }
.reminder-input input { width: 128px; }
.editor-reference { margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--ui-line); }
.editor-reference h3 { margin-top: 0; }
.reference-row { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding: 8px 0; }
.reference-row details, .reminder-history summary { cursor: pointer; }
.reminder-history { margin-top: 16px; }
.reminder-history > summary { margin-bottom: 16px; }
@media (max-width: 540px) {
  .reminder-list li { grid-template-columns: minmax(0, 1fr) auto; gap: 4px 12px; }
  .reminder-list li > button { grid-column: 2; grid-row: 1 / span 2; min-height: 44px; }
  .reminder-input input, .reminder-editor select { font-size: 16px; }
}
</style>
