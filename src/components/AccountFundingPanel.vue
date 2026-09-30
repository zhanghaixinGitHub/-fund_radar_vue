<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { get, post, ApiRequestError } from '@/api/http'
import { useAuthStore } from '@/stores/auth'
import { createUUID } from '@/utils/uuid'
import { direction1dTime } from '@/utils/direction1d'

type Scope = 'CONFIRMED' | 'SIMULATED'
type Input = { purpose: string | null; useDate: string | null; requiredAmount: string | null
  willingLossPct: string | null; affordableLossAmount: string | null; reviewIntervalDays: number | null }
type View = { preferenceId: string; scope: Scope; revision: number; status: string; input: Input | null; confirmedAt: string }
type Page = { scope: Scope; current: View | null; history: View[]; hasMore: boolean }
const auth = useAuthStore()
const scope = ref<Scope>('CONFIRMED')
const result = ref<Page | null>(null)
const page = ref(1)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const message = ref('')
const confirmed = ref(false)
const form = ref({ purpose: '', useDate: '', requiredAmount: '', willingLossPct: '', affordableLossAmount: '', reviewIntervalDays: '' })
const scopeName = computed(() => scope.value === 'CONFIRMED' ? '已录入的本人确认持仓' : '模拟组合')
const canWrite = computed(() => auth.hasPermission('ALERT_RULE_SELF_WRITE'))
let sequence = 0
let pending: { content: string; requestId: string } | null = null

/** 页面切换只读取本人安排；空字段保持未知，不能把“未确认”转换成零或默认风险档位。 */
async function load(copyToForm = true) {
  const ticket = ++sequence
  loading.value = true; error.value = ''
  try {
    const value = await get<Page>(`/api/v1/account/funding?scope=${scope.value}&page=${page.value}`)
    if (ticket !== sequence || value.scope !== scope.value) return
    result.value = value
    if (copyToForm) {
      const input = value.current?.status === 'ACTIVE' ? value.current.input : null
      form.value = { purpose: input?.purpose ?? '', useDate: input?.useDate ?? '', requiredAmount: input?.requiredAmount ?? '',
        willingLossPct: input?.willingLossPct ?? '', affordableLossAmount: input?.affordableLossAmount ?? '', reviewIntervalDays: input?.reviewIntervalDays?.toString() ?? '' }
      confirmed.value = false; pending = null
    }
  } catch { if (ticket === sequence) error.value = '本人资金安排暂时无法读取，请重试。' }
  finally { if (ticket === sequence) loading.value = false }
}
async function submit(revoke = false) {
  if (!confirmed.value || !canWrite.value || !result.value || saving.value) return
  const selected = scope.value
  const raw = form.value
  const input: Input | null = revoke ? null : { purpose: raw.purpose.trim() || null, useDate: raw.useDate || null,
    requiredAmount: raw.requiredAmount || null, willingLossPct: raw.willingLossPct || null,
    affordableLossAmount: raw.affordableLossAmount || null, reviewIntervalDays: raw.reviewIntervalDays ? Number(raw.reviewIntervalDays) : null }
  const content = JSON.stringify({ scope: selected, revoke, input, revision: result.value.current?.revision ?? 0 })
  if (pending?.content !== content) pending = { content, requestId: createUUID() }
  saving.value = true; error.value = ''; message.value = ''
  try {
    await post<View>(`/api/v1/account/funding/${revoke ? 'revoke' : 'confirm'}?scope=${selected}`,
      { requestId: pending.requestId, expectedRevision: result.value.current?.revision ?? 0, confirmed: true, input })
    message.value = revoke ? '该范围的资金安排已撤销，历史记录保留。' : '资金安排已保存。它不会改变基金自身的走势判断。'
    page.value = 1
    await load()
  } catch (failure) {
    error.value = failure instanceof ApiRequestError && failure.status < 500 ? failure.message : '未能确认保存结果，请重试同一次确认，或刷新查看。'
  } finally { saving.value = false }
}
watch(scope, () => { result.value = null; page.value = 1; message.value = ''; void load() }, { immediate: true })
watch(form, () => { confirmed.value = false }, { deep: true })
onBeforeUnmount(() => { sequence++ })
</script>

<template>
  <section
    aria-labelledby="funding-title"
    :aria-busy="loading || saving"
  >
    <h2 id="funding-title">
      本人资金安排
    </h2>
    <p>只用于本人的资金条件复查。空白表示尚未确定；不会替你设置损失阈值，也不会执行买卖。</p>
    <label>适用范围 <select
      v-model="scope"
      :disabled="saving || loading"
    ><option value="CONFIRMED">已录入的本人确认持仓</option><option value="SIMULATED">模拟组合</option></select></label>
    <p class="muted">
      {{ scopeName }}；不代表你的全部资产。两个范围的设置分别保存。
    </p>
    <p
      v-if="error"
      role="alert"
    >
      {{ error }} <button
        type="button"
        :disabled="saving"
        @click="load()"
      >
        重新读取
      </button>
    </p>
    <p
      v-if="message"
      role="status"
    >
      {{ message }}
    </p>
    <template v-if="result">
      <p>{{ result.current?.status === 'ACTIVE' ? `当前已确认 · ${direction1dTime(result.current.confirmedAt)}` : '当前没有已确认生效的资金安排。' }}</p>
      <form
        v-if="canWrite"
        @submit.prevent="submit(false)"
      >
        <fieldset :disabled="saving || loading">
          <legend>填写已确定的事项</legend>
          <label>资金用途 <input
            v-model="form.purpose"
            maxlength="160"
            placeholder="可以留空"
          ></label>
          <label>预计用款日期 <input
            v-model="form.useDate"
            type="date"
            min="1900-01-01"
            max="2200-12-31"
          ></label>
          <label>预计需要金额（人民币元）<input
            v-model="form.requiredAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="未知请留空"
          ></label>
          <label>心理上愿意接受的损失比例（%）<input
            v-model="form.willingLossPct"
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="未知请留空"
          ></label>
          <label>现实资金可承担的损失金额（人民币元）<input
            v-model="form.affordableLossAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="未知请留空"
          ></label>
          <label>定期复查间隔（天）<input
            v-model="form.reviewIntervalDays"
            type="number"
            min="1"
            max="365"
            step="1"
            placeholder="未确定请留空"
          ></label>
        </fieldset>
        <label class="confirmation"><input
          v-model="confirmed"
          type="checkbox"
          :disabled="saving || loading"
        >我已核对适用范围与填写内容，确认保存本次设置或撤销当前安排。</label>
        <div class="actions">
          <button
            type="submit"
            :disabled="!confirmed || saving || loading"
          >
            确认保存
          </button><button
            v-if="result.current?.status === 'ACTIVE'"
            type="button"
            :disabled="!confirmed || saving || loading"
            @click="submit(true)"
          >
            撤销当前安排
          </button>
        </div>
      </form>
      <details class="history">
        <summary>查看确认历史</summary>
        <p v-if="!result.history.length">
          尚无确认记录。
        </p>
        <article
          v-for="item in result.history"
          :key="item.preferenceId"
        >
          <h3>{{ direction1dTime(item.confirmedAt) }} · {{ item.status === 'ACTIVE' ? '本人确认' : '本人撤销' }}</h3>
          <template v-if="item.input">
            <p>用途：{{ item.input.purpose ?? '未知' }}；用款日期：{{ item.input.useDate ?? '未知' }}；需要金额：{{ item.input.requiredAmount == null ? '未知' : `${item.input.requiredAmount} 元` }}。</p>
            <p>愿意接受损失：{{ item.input.willingLossPct == null ? '未知' : `${item.input.willingLossPct}%` }}；现实可承担损失：{{ item.input.affordableLossAmount == null ? '未知' : `${item.input.affordableLossAmount} 元` }}；复查间隔：{{ item.input.reviewIntervalDays == null ? '未知' : `${item.input.reviewIntervalDays} 天` }}。</p>
          </template>
        </article>
        <nav
          v-if="page > 1 || result.hasMore"
          aria-label="资金安排历史分页"
        >
          <button
            :disabled="page === 1 || loading || saving"
            @click="page--; load(false)"
          >
            上一页
          </button><span>第 {{ page }} 页</span><button
            :disabled="!result.hasMore || loading || saving"
            @click="page++; load(false)"
          >
            下一页
          </button>
        </nav>
      </details>
    </template>
  </section>
</template>

<style scoped>
h2 { font-size: 1.15rem; } h3 { font-size: 1rem; } p { line-height: 1.75; }
.muted { color: var(--workspace-muted, #597069); }
fieldset { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 1rem; border: 1px solid #dfe8e3; padding: 1rem; }
fieldset label { display: flex; flex-direction: column; gap: .5rem; line-height: 1.6; }
input, select, button { font: inherit; padding: .65rem; border: 1px solid #baccc4; border-radius: .4rem; }
input { min-width: 0; } input[type=checkbox] { width: auto; }
.confirmation { display: flex; align-items: flex-start; gap: .5rem; margin: 1rem 0; line-height: 1.7; }
.actions, nav { display: flex; gap: .75rem; align-items: center; } button { cursor: pointer; } button:disabled { opacity: .5; cursor: default; }
.history { margin-top: 1.5rem; } article { border-bottom: 1px solid #dfe8e3; padding: .7rem 0; }
summary { cursor: pointer; }
@media(max-width: 650px) { fieldset { grid-template-columns: 1fr; } select { max-width: 100%; } }
</style>
