<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getSimPreview, placeSimOrder, previewSimPlan, saveSimPlan } from '@/api/simulation'
import type { SimPlan, SimPlanRequest, SimPreview } from '@/types/simulation'
import { fractionShares, shanghaiDate, simMoney, simShares } from '@/utils/simulation'

const props = defineProps<{ fundCode: string; mode: 'BUY' | 'SELL' | 'PLAN'; plan?: SimPlan }>()
const emit = defineEmits<{ close: []; saved: [message: string] }>()
const dialog = ref<InstanceType<typeof globalThis.HTMLDialogElement> | null>(null)
const preview = ref<SimPreview | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const amount = ref(props.plan ? String(props.plan.amount) : '')
const shares = ref('')
const pausePlan = ref(true)
const frequency = ref<SimPlan['frequency']>(props.plan?.frequency ?? 'WEEKLY')
const dayValue = ref(props.plan?.dayValue ?? 3)
const startDate = ref(props.plan?.startDate ?? shanghaiDate(1))
const endDate = ref(props.plan?.endDate ?? '')
const maxPeriods = ref(props.plan?.maxPeriods ? String(props.plan.maxPeriods) : '')
const firstExecution = ref('')
const planPreviewError = ref('')
const previewing = ref(false)
const heading = computed(() => props.mode === 'PLAN' ? props.plan ? '修改定投计划' : '设置定投' : props.mode === 'SELL' ? '模拟卖出' : '模拟买入 / 加仓')
let requestKey = globalThis.crypto.randomUUID()
let submittedPayload = ''
let timer: ReturnType<typeof globalThis.setTimeout> | undefined
let generation = 0
let alive = true
const planRequest = (): SimPlanRequest => ({
  requestKey, fundCode: props.fundCode, amount: amount.value, frequency: frequency.value,
  dayValue: frequency.value === 'DAILY' ? 1 : Number(dayValue.value), startDate: startDate.value,
  endDate: endDate.value || null, maxPeriods: maxPeriods.value ? Number(maxPeriods.value) : null,
  version: props.plan?.version ?? 0,
})
function close() { if (!saving.value) emit('close') }
async function load() {
  loading.value = true; error.value = ''
  try { const data = await getSimPreview(props.fundCode); if (alive) preview.value = data }
  catch (reason) { if (alive) error.value = reason instanceof Error ? reason.message : '无法加载交易资料。' }
  finally { if (alive) loading.value = false }
}
async function updatePlanPreview() {
  const current = ++generation
  firstExecution.value = ''; planPreviewError.value = ''
  if (props.mode !== 'PLAN' || !amount.value || Number(amount.value) <= 0 || !startDate.value) return
  previewing.value = true
  try {
    const result = await previewSimPlan(planRequest())
    if (alive && current === generation) firstExecution.value = result.executionDate
  } catch (reason) {
    if (alive && current === generation) planPreviewError.value = reason instanceof Error ? reason.message : '无法确定下一期日期。'
  } finally { if (alive && current === generation) previewing.value = false }
}
watch([amount, frequency, dayValue, startDate, endDate, maxPeriods], () => {
  firstExecution.value = ''; generation++
  if (frequency.value === 'WEEKLY' && dayValue.value > 7) dayValue.value = 3
  globalThis.clearTimeout(timer); timer = globalThis.setTimeout(() => void updatePlanPreview(), 350)
})
async function submit() {
  if (saving.value || loading.value || !preview.value?.supported) return
  error.value = ''
  const payload = props.mode === 'PLAN' ? planRequest() : {
    requestKey, fundCode: props.fundCode, side: props.mode,
    amount: props.mode === 'BUY' ? amount.value : null, shares: props.mode === 'SELL' ? shares.value : null,
    pausePlan: props.mode === 'SELL' && pausePlan.value,
  }
  // 网络结果不明时沿用原请求键；用户改变委托内容后才换键。
  const comparable = JSON.stringify({ ...payload, requestKey: '' })
  if (submittedPayload && submittedPayload !== comparable) requestKey = globalThis.crypto.randomUUID()
  payload.requestKey = requestKey; submittedPayload = comparable
  saving.value = true
  try {
    if (props.mode === 'PLAN') {
      const result = await saveSimPlan(payload as SimPlanRequest, props.plan?.planId)
      emit('saved', `定投计划已保存，下一期 ${result.executionDate} 执行。`)
    } else {
      const result = await placeSimOrder(payload as Parameters<typeof placeSimOrder>[0])
      emit('saved', `模拟${props.mode === 'BUY' ? '买入' : '卖出'}已提交，采用 ${result.tradeDate} 净值，最早 ${result.eligibleDate} 确认。`)
    }
  } catch (reason) { if (alive) error.value = reason instanceof Error ? reason.message : '提交失败，可重试。' }
  finally { if (alive) saving.value = false }
}
onMounted(() => { dialog.value?.showModal(); void load(); if (props.plan) void updatePlanPreview() })
onBeforeUnmount(() => { alive = false; generation++; globalThis.clearTimeout(timer); dialog.value?.close() })
</script>

<template>
  <dialog
    ref="dialog"
    class="sim-dialog"
    aria-labelledby="sim-trade-title"
    @cancel.prevent="close"
  >
    <header class="sim-dialog-header">
      <div>
        <p class="eyebrow">
          模拟交易
        </p><h2 id="sim-trade-title">
          {{ heading }}
        </h2>
      </div>
      <button
        class="secondary-button"
        type="button"
        :disabled="saving"
        aria-label="关闭交易窗口"
        @click="close"
      >
        关闭
      </button>
    </header>
    <p
      v-if="loading"
      role="status"
    >
      正在读取交易资料…
    </p>
    <p
      v-if="error"
      class="error-message"
      role="alert"
    >
      {{ error }}
    </p>
    <button
      v-if="!loading && !preview"
      class="secondary-button"
      type="button"
      @click="load"
    >
      重新加载
    </button>
    <form
      v-if="preview"
      class="sim-form"
      @submit.prevent="submit"
    >
      <p class="sim-fund-title">
        <strong>{{ preview.fundName }}</strong><span>{{ fundCode }}</span>
      </p>
      <p>参考净值 {{ preview.referenceNav ?? '—' }} · {{ preview.referenceDate ?? '待更新' }}</p>
      <p
        v-if="!preview.supported"
        class="notice-banner"
        role="status"
      >
        {{ preview.reason }}
      </p>
      <template v-if="mode !== 'SELL'">
        <label for="sim-amount">{{ mode === 'PLAN' ? '每期投入金额（元）' : '买入金额（元）' }}</label>
        <input
          id="sim-amount"
          v-model="amount"
          required
          type="text"
          pattern="[0-9]{1,9}(\.[0-9]{1,2})?"
          maxlength="12"
          inputmode="decimal"
          :disabled="saving"
          placeholder="例如 1000"
        >
      </template>
      <template v-else>
        <label for="sim-shares">卖出份额</label>
        <input
          id="sim-shares"
          v-model="shares"
          required
          type="text"
          pattern="[0-9]{1,12}(\.[0-9]{1,8})?"
          maxlength="21"
          inputmode="decimal"
          :disabled="saving"
        >
        <p>可卖 {{ simShares(preview.availableShares) }} 份 · 预计金额 {{ shares && preview.referenceNav ? simMoney(Number(shares) * Number(preview.referenceNav)) : '—' }} 元</p>
        <div class="sim-actions">
          <button
            v-for="part in [4, 2, 1] as const"
            :key="part"
            class="secondary-button"
            type="button"
            :disabled="saving"
            @click="shares = fractionShares(preview.availableShares, part)"
          >
            {{ part === 1 ? '全部' : part === 2 ? '一半' : '四分之一' }}
          </button>
        </div>
        <label class="sim-check"><input
          v-model="pausePlan"
          type="checkbox"
          :disabled="saving"
        >同时暂停该基金定投</label>
        <p
          v-if="preview.pendingBuys"
          class="notice-banner"
        >
          还有 {{ preview.pendingBuys }} 笔买入待确认，确认后持仓可能增加。暂停定投不会撤销已有买单。
        </p>
      </template>
      <template v-if="mode === 'PLAN'">
        <label for="sim-frequency">定投周期</label>
        <select
          id="sim-frequency"
          v-model="frequency"
          :disabled="saving"
        >
          <option value="DAILY">
            每个交易日
          </option><option value="WEEKLY">
            每周
          </option><option value="MONTHLY">
            每月
          </option>
        </select>
        <template v-if="frequency !== 'DAILY'">
          <label for="sim-day">{{ frequency === 'WEEKLY' ? '星期' : '每月日期' }}</label>
          <select
            id="sim-day"
            v-model="dayValue"
            :disabled="saving"
          >
            <option
              v-for="day in frequency === 'WEEKLY' ? 7 : 31"
              :key="day"
              :value="day"
            >
              {{ frequency === 'WEEKLY' ? `星期${['一','二','三','四','五','六','日'][day - 1]}` : `${day} 日` }}
            </option>
          </select>
        </template>
        <div class="sim-form-grid">
          <label>开始日期<input
            v-model="startDate"
            required
            type="date"
            :disabled="saving"
          ></label>
          <label>结束日期（可选）<input
            v-model="endDate"
            type="date"
            :min="startDate"
            :disabled="saving"
          ></label>
        </div>
        <label for="sim-periods">总期数（可选；留空持续执行）</label>
        <input
          id="sim-periods"
          v-model="maxPeriods"
          type="number"
          min="1"
          max="10000"
          step="1"
          :disabled="saving"
        >
        <p role="status">
          {{ previewing ? '正在确认第一期日期…' : firstExecution ? `下一期：${firstExecution} 上午 10:00` : '填写金额和周期后显示下一期日期。' }}
        </p>
        <p
          v-if="planPreviewError"
          class="error-message"
          role="alert"
        >
          {{ planPreviewError }}
        </p>
        <p class="sim-muted">
          非交易日顺延；每日定投不补周末期次。修改从下一期生效，已生成买单保留原金额。
        </p>
      </template>
      <p
        v-else
        class="notice-banner"
      >
        采用 {{ preview.tradeDate }} 当日正式净值，最早 {{ preview.eligibleDate }} 确认；净值未到则继续等待。
      </p>
      <p class="sim-muted">
        本次仅记录模拟金额，不涉及真实资金。未计申赎手续费；现金分红。{{ mode === 'PLAN' ? '定投增加投入，收益随净值涨跌。' : '参考净值和预计金额不代表最终成交结果。' }}
      </p>
      <details class="sim-muted">
        <summary>查看模拟规则</summary>
        <p>{{ preview.rules }}</p>
        <p>买入份额保留八位小数并向下取整；卖出金额四舍五入到分。全部卖出释放该批次剩余成本。</p>
      </details>
      <footer class="sim-dialog-footer">
        <button
          class="secondary-button"
          type="button"
          :disabled="saving"
          @click="close"
        >
          取消
        </button>
        <button
          class="primary-button"
          type="submit"
          :disabled="saving || !preview.supported || (mode === 'PLAN' && (!firstExecution || previewing)) || (mode === 'SELL' && Number(preview.availableShares) <= 0)"
        >
          {{ saving ? '正在提交…' : mode === 'PLAN' ? '保存定投计划' : '确认模拟交易' }}
        </button>
      </footer>
    </form>
  </dialog>
</template>
