<script setup lang="ts">
import ListPagination from '@/components/ListPagination.vue'
import PredictionHistoryDrawer from '@/components/PredictionHistoryDrawer.vue'
import { readFixedPage } from '@/utils/pagination'
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
const scope = ref<Scope>('SIMULATED')
const result = ref<Page | null>(null)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const message = ref('')
const historyOpen = ref(false)
const form = ref({ purpose: '', useDate: '', requiredAmount: '', willingLossPct: '', affordableLossAmount: '', reviewIntervalDays: '' })
const canWrite = computed(() => auth.hasPermission('ALERT_RULE_SELF_WRITE'))
let sequence = 0
let pending: { content: string; requestId: string } | null = null

/** 页面切换只读取本人安排；空字段保持未知，不能把“未确认”转换成零或默认风险档位。 */
async function load(copyToForm = true) {
  const ticket = ++sequence
  loading.value = true; error.value = ''
  try {
    let metadata: Page | null = null
    const window = await readFixedPage(async target => {
      const value = await get<Page>(`/api/v1/account/funding?page=${target}`)
      metadata = value
      return { items: value.history, hasMore: value.hasMore }
    }, page.value, pageSize.value)
    const value = { ...metadata!, history: window.items, hasMore: window.hasMore } as Page
    if (ticket !== sequence || value.scope !== scope.value) return
    result.value = value
    if (copyToForm) {
      const input = value.current?.status === 'ACTIVE' ? value.current.input : null
      form.value = { purpose: input?.purpose ?? '', useDate: input?.useDate ?? '', requiredAmount: input?.requiredAmount ?? '',
        willingLossPct: input?.willingLossPct ?? '', affordableLossAmount: input?.affordableLossAmount ?? '', reviewIntervalDays: input?.reviewIntervalDays?.toString() ?? '' }
      pending = null
    }
  } catch { if (ticket === sequence) error.value = '本人资金安排暂时无法读取，请重试。' }
  finally { if (ticket === sequence) loading.value = false }
}
async function submit(revoke = false) {
  if (!canWrite.value || !result.value || saving.value) return
  const selected = scope.value
  const raw = form.value
  const input: Input | null = revoke ? null : { purpose: raw.purpose.trim() || null, useDate: raw.useDate || null,
    requiredAmount: raw.requiredAmount === '' ? null : String(raw.requiredAmount),
    willingLossPct: raw.willingLossPct === '' ? null : String(raw.willingLossPct),
    affordableLossAmount: raw.affordableLossAmount === '' ? null : String(raw.affordableLossAmount),
    reviewIntervalDays: raw.reviewIntervalDays === '' ? null : Number(raw.reviewIntervalDays) }
  const content = JSON.stringify({ scope: selected, revoke, input, revision: result.value.current?.revision ?? 0 })
  if (pending?.content !== content) pending = { content, requestId: createUUID() }
  saving.value = true; error.value = ''; message.value = ''
  try {
    await post<View>(`/api/v1/account/funding/${revoke ? 'revoke' : 'confirm'}`,
      { requestId: pending.requestId, expectedRevision: result.value.current?.revision ?? 0, confirmed: true, input })
    message.value = revoke ? '资金安排已撤销，历史记录保留。' : '资金安排已保存。重新评估后将用于当前持仓建议；基金自身的走势判断保持独立。'
    page.value = 1
    await load()
  } catch (failure) {
    error.value = failure instanceof ApiRequestError && failure.status < 500 ? failure.message : '未能确认保存结果，请重试同一次确认，或刷新查看。'
  } finally { saving.value = false }
}
watch(scope, () => { result.value = null; page.value = 1; message.value = ''; void load() }, { immediate: true })
onBeforeUnmount(() => { sequence++ })
</script>

<template>
  <section
    class="account-settings fund-results-panel"
    aria-labelledby="funding-title"
    :aria-busy="loading || saving"
  >
    <header class="settings-heading">
      <h2 id="funding-title">
        本人资金安排
      </h2>
      <p>记录用款计划与可承担的损失。未确定的事项可以留空，保存不会执行买卖。</p>
    </header>
    <p class="settings-muted">
      资金安排直接参与当前“我的持仓”的建议判断。修改后需重新评估，历史填写内容与旧建议保留。
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
    <p
      v-if="loading && !result"
      role="status"
    >
      正在读取资金安排…
    </p>
    <template v-if="result">
      <p class="funding-status">
        {{ result.current?.status === 'ACTIVE' ? `当前已确认 · ${direction1dTime(result.current.confirmedAt)}` : '当前没有已确认生效的资金安排。' }}
      </p>
      <p
        v-if="!canWrite"
        class="settings-muted"
      >
        当前账号可查看确认历史，暂无修改权限。
      </p>
      <form
        v-if="canWrite"
        id="account-funding-form"
        @submit.prevent="submit(false)"
      >
        <fieldset :disabled="saving || loading">
          <legend>用款计划</legend>
          <label>资金用途 <span class="clearable-input"><input
            v-model="form.purpose"
            maxlength="160"
            placeholder="可以留空"
          ><button
            v-if="form.purpose !== ''"
            type="button"
            class="input-clear"
            aria-label="清空资金用途"
            title="清空"
            @click="form.purpose = ''"
          >×</button></span></label>
          <label>预计用款日期 <span class="clearable-input"><input
            v-model="form.useDate"
            type="date"
            min="1900-01-01"
            max="2200-12-31"
          ><button
            v-if="form.useDate !== ''"
            type="button"
            class="input-clear"
            aria-label="清空预计用款日期"
            title="清空"
            @click="form.useDate = ''"
          >×</button></span></label>
          <label>预计需要金额（人民币元）<span class="clearable-input"><input
            v-model="form.requiredAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="未知请留空"
          ><button
            v-if="form.requiredAmount !== ''"
            type="button"
            class="input-clear"
            aria-label="清空预计需要金额"
            title="清空"
            @click="form.requiredAmount = ''"
          >×</button></span><small class="settings-muted">没有预计用款时请填写0；留空表示尚未确定。</small></label>
        </fieldset>
        <fieldset :disabled="saving || loading">
          <legend>损失承受能力</legend>
          <p class="fieldset-help">
            愿意接受的比例与现实能承担的金额，请分别填写。建议会与当前账户持有亏损及剩余成本核对，不等于历史回撤或未来损失保证。
          </p>
          <label>心理上愿意接受的损失比例（%）<span class="clearable-input"><input
            v-model="form.willingLossPct"
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="未知请留空"
          ><button
            v-if="form.willingLossPct !== ''"
            type="button"
            class="input-clear"
            aria-label="清空愿意接受的损失比例"
            title="清空"
            @click="form.willingLossPct = ''"
          >×</button></span></label>
          <label>现实资金可承担的损失金额（人民币元）<span class="clearable-input"><input
            v-model="form.affordableLossAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="未知请留空"
          ><button
            v-if="form.affordableLossAmount !== ''"
            type="button"
            class="input-clear"
            aria-label="清空可承担的损失金额"
            title="清空"
            @click="form.affordableLossAmount = ''"
          >×</button></span></label>
        </fieldset>
        <fieldset :disabled="saving || loading">
          <legend>复查安排</legend>
          <label>定期复查间隔（天）<span class="clearable-input"><input
            v-model="form.reviewIntervalDays"
            type="number"
            min="1"
            max="365"
            step="1"
            placeholder="未确定请留空"
          ><button
            v-if="form.reviewIntervalDays !== ''"
            type="button"
            class="input-clear"
            aria-label="清空定期复查间隔"
            title="清空"
            @click="form.reviewIntervalDays = ''"
          >×</button></span></label>
        </fieldset>
      </form>
      <div class="actions">
        <button
          v-if="canWrite"
          type="submit"
          form="account-funding-form"
          :disabled="saving || loading"
        >
          {{ saving ? '处理中…' : '确认保存' }}
        </button><button
          v-if="canWrite && result.current?.status === 'ACTIVE'"
          type="button"
          :disabled="saving || loading"
          @click="submit(true)"
        >
          撤销当前安排
        </button>
        <button
          type="button"
          class="secondary-button"
          aria-haspopup="dialog"
          @click="historyOpen = true"
        >
          查看确认历史
        </button>
      </div>
      <PredictionHistoryDrawer
        v-if="historyOpen"
        class="funding-history-drawer"
        title="资金安排确认历史"
        close-label="关闭确认历史"
        @close="historyOpen = false"
      >
        <div class="history">
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
          <div class="history-pagination">
            <ListPagination
              v-if="result.current"
              :page="page"
              :page-size="pageSize"
              :total="result.current?.revision ?? 0"
              :loading="loading || saving"
              label="资金安排历史分页"
              @change="(value, size) => { pageSize = size; page = value; load(false) }"
            />
          </div>
        </div>
      </PredictionHistoryDrawer>
    </template>
  </section>
</template>

<style scoped>
.funding-scope { margin-top:24px; }
.funding-scope label { display:flex; align-items:center; gap:12px; flex-wrap:wrap; font-weight:600; }
.funding-scope select { width:auto; max-width:100%; }
.funding-status { padding:12px 0; border-bottom:1px solid var(--ui-line); color:var(--ui-muted); }
fieldset { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px 24px; min-width:0; border:0; padding:0; margin:24px 0; max-width:880px; }
legend { padding:0; margin-bottom:16px; font-size:18px; font-weight:600; }
fieldset label { display:flex; flex-direction:column; gap:8px; line-height:1.6; min-width:0; }
fieldset label input { width:100%; }
.clearable-input { display:flex; align-items:stretch; gap:8px; }
.clearable-input input { flex:1; min-width:0; }
.input-clear { flex:0 0 40px; width:40px; min-height:40px; padding:0; border:1px solid var(--ui-line); border-radius:8px; background:var(--ui-surface); color:var(--ui-primary); font-size:22px; line-height:1; cursor:pointer; }
.input-clear:hover:not(:disabled) { background:var(--ui-canvas); }
.fieldset-help { grid-column:1/-1; color:var(--ui-muted); margin:0; }
.actions { display:flex; flex-wrap:wrap; gap:12px; margin-top:24px; padding-top:20px; border-top:1px solid var(--ui-line); }
.history article { border-bottom:1px solid var(--ui-line); padding:16px 0; overflow-wrap:anywhere; }
.history article:last-of-type { border-bottom:0; }
.history h3 { font-size:14px; margin:0 0 8px; }
.account-settings :deep(.funding-history-drawer) { width:min(800px,100vw); }
.history-pagination { overflow-x:auto; }
.history-pagination :deep(.pagination) { flex-wrap:nowrap; min-width:max-content; gap:12px; }
.history-pagination :deep(.pagination-summary),
.history-pagination :deep(.pagination-controls) { flex-shrink:0; }
.history-pagination :deep(.pagination-controls) { flex-wrap:nowrap; gap:6px; }
.history-pagination :deep(.pagination button) { min-width:0; white-space:nowrap; }
@media(max-width:650px) { fieldset { grid-template-columns:1fr; } }
</style>
