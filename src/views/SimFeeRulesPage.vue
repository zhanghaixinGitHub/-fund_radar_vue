<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { usePageNavigation } from '@/composables/usePageNavigation'
import { useAuthStore } from '@/stores/auth'
import { getSimFeeRules, updateSimFeeRule } from '@/api/simulation'
import type { SimFeeRuleRow } from '@/types/simulation'
import { simPercent } from '@/utils/simulation'

const auth = useAuthStore()
const { sectionLabel } = usePageNavigation()
const rules = ref<SimFeeRuleRow[]>([])
const total = ref(0)
const page = ref(0)
const pageSize = 20
const loading = ref(false)
const keyword = ref('')
const appliedFilter = ref('')
const errorMessage = ref('')
const successMessage = ref('')
let successTimer: ReturnType<typeof globalThis.setTimeout> | undefined

/** 清除旧提示及其计时，连续保存时不会被上一次的计时提前关闭。 */
function clearSuccessMessage(): void {
  globalThis.clearTimeout(successTimer)
  successTimer = undefined
  successMessage.value = ''
}

/** 成功提示悬浮于页面顶部，不占表格布局空间；显示 3 秒后自动消失。 */
function showSaveSuccess(): void {
  clearSuccessMessage()
  successMessage.value = '费率保存成功'
  successTimer = globalThis.setTimeout(clearSuccessMessage, 3000)
}

/** 每行独立保存百分数草稿和开始编辑时的版本，取消时不修改列表原值。 */
interface FeeRuleEdit {
  ratePercent: string
  version: number
  saving: boolean
  errorMessage: string
}
const edits = ref<Record<number, FeeRuleEdit>>({})
const hasSaving = computed(() => Object.values(edits.value).some((edit) => edit.saving))

const canMaintain = computed(() => auth.hasPermission('SIM_FEE_RULE_ADMIN'))
const hasPreviousPage = computed(() => page.value > 0)
const hasNextPage = computed(() => (page.value + 1) * pageSize < total.value)

async function load(resetEdits = true): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  try {
    const data = await getSimFeeRules(page.value + 1, appliedFilter.value || undefined)
    rules.value = data.items
    total.value = data.totalCount
    // 查询或翻页成功后丢弃上一列表的草稿；冲突刷新保留其他行尚未提交的内容。
    if (resetEdits) edits.value = {}
  } catch (cause) {
    errorMessage.value = cause instanceof Error ? cause.message : '费率列表加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}
function previousPage(): void { if (!loading.value && !hasSaving.value && hasPreviousPage.value) { page.value -= 1; load() } }
function nextPage(): void { if (!loading.value && !hasSaving.value && hasNextPage.value) { page.value += 1; load() } }
/** 提交后固定本次关键词，翻页沿用它；清空后提交恢复全部规则。 */
function search(): void {
  if (loading.value || hasSaving.value) return
  page.value = 0
  appliedFilter.value = keyword.value.trim()
  load()
}

/** 编辑费率按百分数输入（0.15 表示 0.15%），提交时换算为比例小数并携带乐观锁版本。 */
async function startEdit(rule: SimFeeRuleRow): Promise<void> {
  if (!canMaintain.value || loading.value || rule.effectiveTo !== null || edits.value[rule.ruleId]) return
  edits.value[rule.ruleId] = {
    ratePercent: (Number(rule.rate) * 100).toFixed(2),
    version: rule.version,
    saving: false,
    errorMessage: '',
  }
  clearSuccessMessage()
  await nextTick()
  globalThis.document.getElementById(`fee-rate-${rule.ruleId}`)?.focus({ preventScroll: true })
}
async function cancelEdit(ruleId: number): Promise<void> {
  if (edits.value[ruleId]?.saving) return
  delete edits.value[ruleId]
  await nextTick()
  globalThis.document.getElementById(`fee-edit-${ruleId}`)?.focus({ preventScroll: true })
}
async function saveEdit(rule: SimFeeRuleRow): Promise<void> {
  const edit = edits.value[rule.ruleId]
  if (!edit || !canMaintain.value || loading.value || hasSaving.value || rule.effectiveTo !== null) return
  const percent = Number(edit.ratePercent)
  // 空白输入不能按 Number('') 的结果当成零费率提交。
  if (!edit.ratePercent.trim() || !Number.isFinite(percent) || percent < 0 || percent > 100) {
    edit.errorMessage = '请输入 0 到 100 之间的费率。'
    return
  }
  edit.saving = true
  edit.errorMessage = ''
  errorMessage.value = ''
  clearSuccessMessage()
  try {
    const updated = await updateSimFeeRule(rule.ruleId, String(percent / 100), edit.version)
    // 使用接口返回的费率、版本与更新时间替换当前行，避免整表刷新清掉其他行草稿。
    rules.value = rules.value.map((item) => item.ruleId === rule.ruleId ? updated : item)
    showSaveSuccess()
    edit.saving = false
    await cancelEdit(rule.ruleId)
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : '费率更新失败，请稍后重试。'
    edit.errorMessage = message
    // 版本冲突（他人已修改）时刷新列表拿到最新版本，供管理员重新编辑。
    if (cause instanceof Error && cause.message.includes('已被他人修改')) {
      delete edits.value[rule.ruleId]
      await load(false)
      errorMessage.value = errorMessage.value ? `${message}；${errorMessage.value}` : message
    }
  } finally {
    edit.saving = false
  }
}

function feeTypeLabel(rule: SimFeeRuleRow): string {
  return rule.feeType === 'PURCHASE' ? '申购' : '赎回'
}
function bandLabel(rule: SimFeeRuleRow): string {
  if (rule.feeType === 'PURCHASE') return '不分档'
  return rule.maxDays === null ? `持有 ≥ ${rule.minDays} 天` : `持有 ${rule.minDays}~${rule.maxDays} 天`
}
const formatTime = (value: string | null) => value
  ? new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
  : '—'

onMounted(() => load())
onBeforeUnmount(clearSuccessMessage)
</script>

<template>
  <section
    class="admin-page admin-fee-rules-page"
    aria-labelledby="sim-fee-rules-title"
  >
    <p class="eyebrow">
      SIMULATION FEES
    </p>
    <h1 id="sim-fee-rules-title">
      {{ sectionLabel }}
    </h1>
    <p class="lead">
      查看和维护模拟组合申赎费率；抓取与初始化请前往数据同步中的“模拟费率同步”。生效中的费率用于后续订单结算与历史重算。
    </p>

    <form
      class="search-panel"
      @submit.prevent="search"
    >
      <label for="fee-fund-keyword">基金代码或名称</label>
      <div class="search-row">
        <input
          id="fee-fund-keyword"
          v-model="keyword"
          maxlength="50"
          placeholder="例如：000001"
          type="search"
        >
        <button
          class="primary-button"
          :disabled="loading || hasSaving"
          type="submit"
        >
          {{ loading ? '查询中…' : '查询基金' }}
        </button>
      </div>
    </form>

    <p
      v-if="errorMessage"
      class="form-error"
      role="alert"
    >
      {{ errorMessage }}
    </p>
    <Teleport to="body">
      <div
        class="fee-toast-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <p
          v-if="successMessage"
          class="fee-success-toast"
        >
          {{ successMessage }}
        </p>
      </div>
    </Teleport>

    <section
      class="admin-table-card"
      aria-labelledby="sim-fee-list-title"
    >
      <div class="admin-table-head">
        <h2 id="sim-fee-list-title">
          费率规则
        </h2>
      </div>
      <div
        class="admin-table-wrap"
        :aria-busy="loading"
      >
        <table>
          <thead>
            <tr>
              <th>基金</th>
              <th>类型</th>
              <th>适用区间</th>
              <th class="fee-rate-cell">
                费率
              </th>
              <th>折扣说明</th>
              <th>来源</th>
              <th>生效期</th>
              <th>版本</th>
              <th>更新时间</th>
              <th class="fee-actions-cell">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="rule in rules"
              :key="rule.ruleId"
              :class="{ 'is-inactive': rule.effectiveTo !== null }"
            >
              <td>{{ rule.fundCode }}<small>{{ rule.fundName }}</small></td>
              <td>{{ feeTypeLabel(rule) }}</td>
              <td>{{ bandLabel(rule) }}</td>
              <td class="fee-rate-cell">
                <template v-if="edits[rule.ruleId]">
                  <div class="fee-rate-editor">
                    <input
                      :id="`fee-rate-${rule.ruleId}`"
                      v-model="edits[rule.ruleId]!.ratePercent"
                      :aria-label="`${rule.fundCode} ${feeTypeLabel(rule)} ${bandLabel(rule)}费率（%）`"
                      :aria-invalid="Boolean(edits[rule.ruleId]!.errorMessage)"
                      :aria-describedby="edits[rule.ruleId]!.errorMessage ? `fee-error-${rule.ruleId}` : undefined"
                      :disabled="!canMaintain || loading || edits[rule.ruleId]!.saving"
                      inputmode="decimal"
                      type="text"
                      @keydown.enter.prevent="saveEdit(rule)"
                      @keydown.esc.prevent="cancelEdit(rule.ruleId)"
                    >
                    <span aria-hidden="true">%</span>
                  </div>
                  <p
                    v-if="edits[rule.ruleId]!.errorMessage"
                    :id="`fee-error-${rule.ruleId}`"
                    class="form-error fee-rate-error"
                    role="alert"
                  >
                    {{ edits[rule.ruleId]!.errorMessage }}
                  </p>
                </template>
                <template v-else>
                  {{ simPercent(rule.rate) }}
                </template>
              </td>
              <td>{{ rule.discountInfo ?? '—' }}</td>
              <td>{{ rule.dataSource === 'EASTMONEY_F10' ? '天天基金抓取' : '人工维护' }}</td>
              <td>{{ rule.effectiveFrom }}{{ rule.effectiveTo ? ` 至 ${rule.effectiveTo}` : ' 起' }}</td>
              <td>{{ rule.version }}</td>
              <td>{{ formatTime(rule.updatedAt) }}</td>
              <td class="fee-actions-cell">
                <div
                  v-if="edits[rule.ruleId]"
                  class="fee-row-actions"
                  :aria-busy="edits[rule.ruleId]!.saving"
                >
                  <button
                    class="text-button"
                    :disabled="!canMaintain || loading || hasSaving"
                    type="button"
                    @click="saveEdit(rule)"
                  >
                    {{ edits[rule.ruleId]!.saving ? '保存中…' : '保存' }}
                  </button>
                  <button
                    class="text-button fee-cancel-button"
                    :disabled="edits[rule.ruleId]!.saving"
                    type="button"
                    @click="cancelEdit(rule.ruleId)"
                  >
                    取消
                  </button>
                </div>
                <button
                  v-else
                  :id="`fee-edit-${rule.ruleId}`"
                  class="text-button"
                  :disabled="!canMaintain || loading || rule.effectiveTo !== null"
                  type="button"
                  @click="startEdit(rule)"
                >
                  编辑
                </button>
              </td>
            </tr>
            <tr v-if="!loading && rules.length === 0">
              <td
                colspan="10"
                class="empty"
              >
                {{ appliedFilter ? '未找到匹配的费率规则，请更换关键词或清空后查询。' : '暂无费率规则，请前往数据同步中的“模拟费率同步”执行抓取。' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="admin-pagination">
        <button
          class="text-button"
          :disabled="loading || hasSaving || !hasPreviousPage"
          type="button"
          @click="previousPage"
        >
          上一页
        </button>
        <span>第 {{ page + 1 }} 页 · 共 {{ total }} 条</span>
        <button
          class="text-button"
          :disabled="loading || hasSaving || !hasNextPage"
          type="button"
          @click="nextPage"
        >
          下一页
        </button>
      </div>
    </section>
  </section>
</template>

<style scoped>
/* 传送到 body 并固定定位，出现和消失均不改变查询区、表格及滚动位置。 */
.fee-toast-region {
  position: fixed;
  top: 24px;
  left: 50%;
  z-index: 2000;
  max-width: calc(100vw - 32px);
  transform: translateX(-50%);
  pointer-events: none;
}
.fee-success-toast {
  margin: 0;
  padding: 10px 20px;
  border: 1px solid #b8e2ce;
  border-radius: 8px;
  background: #eaf8f0;
  color: #0d5e57;
  box-shadow: 0 4px 16px rgb(15 76 65 / 12%);
  font-size: 14px;
  line-height: 1.5;
}
.admin-fee-rules-page .admin-table-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.admin-fee-rules-page td small {
  display: block;
  color: #6b7a72;
  font-size: 12px;
}
.admin-fee-rules-page tr.is-inactive td {
  color: #9aa8a0;
}
.admin-fee-rules-page .empty {
  text-align: center;
  color: #6b7a72;
  padding: 24px 0;
}
.admin-fee-rules-page .fee-rate-cell {
  min-width: 124px;
}
.admin-fee-rules-page .fee-rate-editor {
  display: flex;
  align-items: center;
  gap: 6px;
}
.admin-fee-rules-page .fee-rate-editor input {
  box-sizing: border-box;
  width: 90px;
  min-height: 36px;
  padding: 6px 8px;
  border: 1px solid var(--workspace-border, #c8d8cd);
  border-radius: 6px;
  background: #fff;
  color: inherit;
  font: inherit;
}
.admin-fee-rules-page .fee-rate-editor input:focus-visible {
  outline: 2px solid var(--workspace-accent, #0f766e);
  outline-offset: 2px;
}
.admin-fee-rules-page .fee-rate-error {
  max-width: 180px;
  margin: 6px 0 0;
  white-space: normal;
}
.admin-fee-rules-page .fee-actions-cell {
  min-width: 140px;
}
.admin-fee-rules-page .fee-row-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.admin-fee-rules-page .fee-cancel-button {
  color: var(--workspace-muted, #6b7a72);
}
</style>
