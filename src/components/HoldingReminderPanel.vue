<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import PredictionHistoryDrawer from '@/components/PredictionHistoryDrawer.vue'
import {
  confirmHoldingRule, fetchHoldingRules, fetchRuleDraft, generateRuleDraft, revokeHoldingRule,
} from '@/api/advice'
import { getSimOverview } from '@/api/simulation'
import type { HoldingRule, HoldingRulesView, RuleDraftTier, RuleDraftView } from '@/types/advice'
import type { SimPosition } from '@/types/simulation'
import { rulePctText, ruleStatsUpdated, ruleStatusLabel, ruleTierLabel, ruleTriggerText } from '@/utils/advice'
import { simTime } from '@/utils/simulation'

const props = defineProps<{ fundCode: string; canWrite: boolean }>()
type DownsideBasis = 'HOLDING_LOSS' | 'DRAWDOWN'

const draft = ref<RuleDraftView | null>(null)
const reasonTier = ref<RuleDraftTier | null>(null)
const holdingRules = ref<HoldingRulesView | null>(null)
const position = ref<SimPosition | null>(null)
const profitPercent = ref('')
const downsidePercent = ref('')
const downsideBasis = ref<DownsideBasis>('HOLDING_LOSS')
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
const downsideText = computed(() => downsideBasis.value === 'HOLDING_LOSS'
  ? '按持仓收益率计算，相对买入成本；与基金从高点回撤不同。'
  : '按基金净值从统计高点回落的幅度计算；不等于你的持仓亏损。')

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
  downsideBasis.value = rule ? basisOf(rule) : 'HOLDING_LOSS'
  formError.value = ''
}
function applyReference(tier: RuleDraftTier) {
  if (!canSave.value) return
  profitPercent.value = percentInput(tier.takeProfitPct)
  downsidePercent.value = percentInput(tier.reduceDrawdownPct)
  downsideBasis.value = 'DRAWDOWN'
  formError.value = ''
  message.value = '系统参考已填入，尚未保存；请按自己的需要调整后点击“保存提醒”。'
}
async function load() {
  const run = ++generation
  loading.value = true; error.value = ''; message.value = ''; formError.value = ''
  draft.value = null; reasonTier.value = null; holdingRules.value = null; position.value = null; revokeArmed.value = false
  if (!props.fundCode) { loading.value = false; return }
  try {
    const [draftResult, rulesResult, overview] = await Promise.all([
      fetchRuleDraft(props.fundCode), fetchHoldingRules(props.fundCode), getSimOverview(),
    ])
    if (!alive || run !== generation) return
    draft.value = draftResult
    holdingRules.value = rulesResult
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
  const profit = Number(profitPercent.value)
  const downside = Number(downsidePercent.value)
  if (!Number.isFinite(profit) || profit <= 0 || profit > 1000) {
    formError.value = '止盈提醒需大于 0%，且不超过 1000%。'; return
  }
  if (!Number.isFinite(downside) || downside <= 0 || downside > 100) {
    formError.value = '下跌提醒需大于 0%，且不超过 100%。'; return
  }
  if (saving.value || !canSave.value) return
  saving.value = true; error.value = ''
  const fund = props.fundCode
  try {
    const result = await confirmHoldingRule(fund, {
      tier: 'CUSTOM',
      takeProfitPct: (profit / 100).toFixed(4),
      reduceDrawdownPct: (-downside / 100).toFixed(4),
      downsideBasis: downsideBasis.value,
    })
    if (!alive || fund !== props.fundCode) return
    holdingRules.value = result
    fillFromActive()
    message.value = '提醒已保存。达到数值后只提示复核，不会自动交易。'
  } catch (reason) {
    if (alive && fund === props.fundCode) error.value = reason instanceof Error ? reason.message : '提醒保存失败，请稍后重试。'
  } finally { if (alive) saving.value = false }
}
async function revoke() {
  if (!revokeArmed.value) { revokeArmed.value = true; return }
  if (revoking.value) return
  revoking.value = true; error.value = ''; message.value = ''
  const fund = props.fundCode
  try {
    const result = await revokeHoldingRule(fund)
    if (!alive || fund !== props.fundCode) return
    holdingRules.value = result
    revokeArmed.value = false
    message.value = '提醒已关闭，修改记录仍然保留。'
  } catch (reason) {
    if (alive && fund === props.fundCode) error.value = reason instanceof Error ? reason.message : '关闭结果暂时无法确认，请刷新查看。'
  } finally { if (alive) revoking.value = false }
}
async function refreshReference() {
  if (refreshing.value) return
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
      v-if="error"
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
      v-if="message"
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
    <template v-else-if="draft && holdingRules">
      <section
        class="sim-detail-panel reminder-settings"
        aria-labelledby="reminder-settings-title"
      >
        <h2 id="reminder-settings-title">
          我的提醒
        </h2>
        <p class="sim-muted">
          数值由你填写并保存。达到后只提示复核，不会自动卖出或下单。
        </p>
        <p
          v-if="activeRule"
          class="current-reminder"
        >
          当前生效：止盈 {{ rulePctText(activeRule.takeProfitPct) }}；
          {{ basisOf(activeRule) === 'HOLDING_LOSS' ? '持仓亏损' : '高点回撤' }} {{ rulePctText(activeRule.reduceDrawdownPct) }}。
          <span v-if="statsUpdated">系统参考已有更新，但不会替换你的设置。</span>
        </p>
        <p
          v-if="blockReason"
          class="notice-banner"
          role="status"
        >
          {{ blockReason }}
        </p>
        <form @submit.prevent="save">
          <div class="reminder-form-grid">
            <label for="holding-profit-reminder">
              止盈提醒（持仓收益率）
              <span class="reminder-input"><input
                id="holding-profit-reminder"
                v-model="profitPercent"
                type="number"
                inputmode="decimal"
                min="0.01"
                max="1000"
                step="0.01"
                required
                :disabled="!canSave || saving"
                placeholder="例如 15"
              ><span>%</span></span>
            </label>
            <label for="holding-downside-basis">
              下跌提醒口径
              <select
                id="holding-downside-basis"
                v-model="downsideBasis"
                :disabled="!canSave || saving"
              >
                <option value="HOLDING_LOSS">按持仓亏损（相对成本）</option>
                <option value="DRAWDOWN">按高点回撤（基金净值）</option>
              </select>
            </label>
            <label for="holding-downside-reminder">
              下跌提醒点
              <span class="reminder-input"><input
                id="holding-downside-reminder"
                v-model="downsidePercent"
                type="number"
                inputmode="decimal"
                min="0.01"
                max="100"
                step="0.01"
                required
                :disabled="!canSave || saving"
                placeholder="例如 8"
              ><span>%</span></span>
            </label>
          </div>
          <p class="sim-muted">
            {{ downsideText }}
          </p>
          <p
            v-if="formError"
            class="error-message"
            role="alert"
          >
            {{ formError }}
          </p>
          <div
            v-if="canWrite"
            class="sim-actions"
          >
            <button
              class="primary-button"
              type="submit"
              :disabled="!canSave || saving"
            >
              {{ saving ? '正在保存…' : '保存提醒' }}
            </button>
            <button
              v-if="activeRule"
              class="secondary-button"
              type="button"
              :disabled="revoking"
              @click="revoke"
            >
              {{ revokeArmed ? '确认关闭当前提醒？' : '关闭提醒' }}
            </button>
            <button
              v-if="revokeArmed"
              class="secondary-button"
              type="button"
              :disabled="revoking"
              @click="revokeArmed = false"
            >
              取消
            </button>
          </div>
        </form>
      </section>

      <section
        class="sim-detail-panel reminder-reference"
        aria-labelledby="reminder-reference-title"
      >
        <h2 id="reminder-reference-title">
          系统参考
        </h2>
        <p class="sim-muted">
          参考值根据历史净值统计得出，只供你调整设置时使用，不会自动生效。
        </p>
        <template v-if="draftAvailable">
          <p class="sim-muted">
            依据 {{ draft.historyDays ?? '—' }} 个交易日、{{ draft.windowCount ?? '—' }} 个滚动窗口；统计截至 {{ draft.statsCutoffDate ?? '未知' }}。
          </p>
          <p
            v-if="draft.assumption"
            class="sim-muted"
          >
            {{ draft.assumption }}
          </p>
          <div class="rule-tier-grid">
            <article
              v-for="tier in draft.tiers"
              :key="tier.tier"
              class="rule-tier-card"
            >
              <h3>{{ ruleTierLabel(tier.tier) }}参考</h3>
              <dl>
                <div><dt>止盈</dt><dd>{{ rulePctText(tier.takeProfitPct) }}</dd></div>
                <div><dt>高点回撤</dt><dd>{{ rulePctText(tier.reduceDrawdownPct) }}</dd></div>
              </dl>
              <button
                class="reason-link"
                type="button"
                aria-haspopup="dialog"
                @click="reasonTier = tier"
              >
                查看建议原因
              </button>
              <button
                class="secondary-button"
                type="button"
                :disabled="!canSave"
                @click="applyReference(tier)"
              >
                填入我的设置
              </button>
            </article>
          </div>
        </template>
        <template v-else>
          <p class="notice-banner">
            {{ draft.status === 'NOT_APPLICABLE' ? '该类别暂不适用此类参考。' : '历史数据不足，暂不提供参考值。' }}{{ draft.reason || '未提供具体原因。' }}
          </p>
          <p class="sim-muted">
            没有系统参考时，仍可在上方填写并保存自己的提醒。
          </p>
        </template>
        <div
          v-if="canWrite"
          class="sim-actions"
        >
          <button
            class="secondary-button"
            type="button"
            :disabled="refreshing"
            @click="refreshReference"
          >
            {{ refreshing ? '正在检查统计…' : '更新系统参考' }}
          </button>
        </div>
      </section>

      <details
        v-if="holdingRules.history.length"
        class="reminder-history"
      >
        <summary>修改记录（{{ holdingRules.history.length }}）</summary>
        <div class="advice-table-wrap">
          <table
            class="advice-table"
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
    <PredictionHistoryDrawer
      v-if="reasonTier"
      :title="`${ruleTierLabel(reasonTier.tier)}参考 · 建议原因`"
      @close="reasonTier = null"
    >
      <p>这些历史统计只解释参考值的由来，不代表未来一定按同样方式表现。</p>
      <section aria-labelledby="reminder-drawdown-reason">
        <h3 id="reminder-drawdown-reason">
          高点回撤参考：{{ rulePctText(reasonTier.reduceDrawdownPct) }}
        </h3>
        <p>{{ ruleTriggerText(reasonTier.reduceTrigger) }}</p>
      </section>
      <section aria-labelledby="reminder-profit-reason">
        <h3 id="reminder-profit-reason">
          止盈参考：{{ rulePctText(reasonTier.takeProfitPct) }}
        </h3>
        <p>{{ ruleTriggerText(reasonTier.takeProfitTrigger) }}</p>
      </section>
      <p>统计截至 {{ draft?.statsCutoffDate ?? '未知' }}。系统参考不会自动生效，最终数值由你填写并保存。</p>
    </PredictionHistoryDrawer>
  </div>
</template>

<style scoped>
.reminder-settings, .reminder-reference { margin-bottom: 24px; }
.current-reminder { line-height: 1.7; }
.reminder-form-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; margin: 20px 0 12px; }
.reminder-form-grid label { display: grid; gap: 8px; color: var(--ui-ink); font-weight: 500; }
.reminder-form-grid :is(input,select) { width: 100%; min-height: 40px; box-sizing: border-box; }
.reminder-input { display: flex; align-items: center; gap: 8px; }
.reminder-input input { min-width: 0; }
.reminder-input > span { flex: none; }
.rule-tier-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; margin: 16px 0; }
.rule-tier-card { padding: 16px; background: var(--ui-surface); border: 1px solid var(--ui-line); border-radius: var(--ui-radius); display: flex; flex-direction: column; gap: 12px; }
.rule-tier-card h3 { margin: 0; }
.rule-tier-card dl { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; margin: 0; }
.rule-tier-card dt { color: var(--ui-muted); font-size: 13px; }
.rule-tier-card dd { margin: 6px 0 0; font-size: 18px; font-variant-numeric: tabular-nums; }
.reason-link { min-height: 36px; padding: 0; border: 0; background: transparent; color: var(--ui-primary); cursor: pointer; font: inherit; text-align: left; }
.reminder-history summary { cursor: pointer; min-height: 36px; }
.rule-tier-card .secondary-button { margin-top: auto; }
.reminder-history { margin-top: 16px; }
.reminder-history > summary { margin-bottom: 16px; }
@media(max-width: 800px) { .reminder-form-grid, .rule-tier-grid { grid-template-columns: 1fr; } }
@media(max-width: 580px) { .reminder-form-grid :is(input,select) { min-height: 44px; font-size: 16px; } }
</style>
