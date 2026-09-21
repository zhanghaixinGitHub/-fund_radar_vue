<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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

const editingRule = ref<SimFeeRuleRow | null>(null)
const editRatePercent = ref('')
const editSaving = ref(false)

const canMaintain = computed(() => auth.hasPermission('SIM_FEE_RULE_ADMIN'))
const hasPreviousPage = computed(() => page.value > 0)
const hasNextPage = computed(() => (page.value + 1) * pageSize < total.value)

async function load(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  try {
    const data = await getSimFeeRules(page.value + 1, appliedFilter.value || undefined)
    rules.value = data.items
    total.value = data.totalCount
  } catch (cause) {
    errorMessage.value = cause instanceof Error ? cause.message : '费率列表加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}
function previousPage(): void { if (hasPreviousPage.value) { page.value -= 1; load() } }
function nextPage(): void { if (hasNextPage.value) { page.value += 1; load() } }
/** 提交后固定本次关键词，翻页沿用它；清空后提交恢复全部规则。 */
function search(): void {
  if (loading.value) return
  page.value = 0
  appliedFilter.value = keyword.value.trim()
  load()
}

/** 编辑费率按百分数输入（0.15 表示 0.15%），提交时换算为比例小数并携带乐观锁版本。 */
function startEdit(rule: SimFeeRuleRow): void {
  editingRule.value = rule
  editRatePercent.value = (Number(rule.rate) * 100).toFixed(2)
}
function cancelEdit(): void { editingRule.value = null }
async function saveEdit(): Promise<void> {
  if (!editingRule.value) return
  const percent = Number(editRatePercent.value)
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    errorMessage.value = '费率必须是 0 到 100 之间的百分数。'
    return
  }
  editSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await updateSimFeeRule(editingRule.value.ruleId, String(percent / 100), editingRule.value.version)
    successMessage.value = '费率已更新，新值立即用于后续订单结算。'
    editingRule.value = null
    await load()
  } catch (cause) {
    errorMessage.value = cause instanceof Error ? cause.message : '费率更新失败，请稍后重试。'
    // 版本冲突（他人已修改）时刷新列表拿到最新版本，供管理员重新编辑。
    if (cause instanceof Error && cause.message.includes('已被他人修改')) {
      editingRule.value = null
      await load()
    }
  } finally {
    editSaving.value = false
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

onMounted(load)
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
          :disabled="loading"
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
    <p
      v-else-if="successMessage"
      class="form-success"
      aria-live="polite"
    >
      {{ successMessage }}
    </p>

    <section
      v-if="editingRule"
      class="admin-operation-card edit-card"
      aria-labelledby="sim-fee-edit-title"
    >
      <h2 id="sim-fee-edit-title">
        编辑费率
      </h2>
      <p>{{ editingRule.fundCode }} {{ editingRule.fundName }} · {{ feeTypeLabel(editingRule) }} · {{ bandLabel(editingRule) }}</p>
      <div class="admin-inline-form">
        <label for="edit-rate-percent">费率（%）</label>
        <input
          id="edit-rate-percent"
          v-model="editRatePercent"
          inputmode="decimal"
        >
        <button
          class="primary-button"
          :disabled="!canMaintain || editSaving"
          type="button"
          @click="saveEdit"
        >
          {{ editSaving ? '保存中…' : '保存' }}
        </button>
        <button
          class="text-button"
          :disabled="editSaving"
          type="button"
          @click="cancelEdit"
        >
          取消
        </button>
      </div>
      <p class="hint">
        乐观锁版本 {{ editingRule.version }}：若已被他人修改，保存会被拒绝并刷新列表。
      </p>
    </section>

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
              <th>费率</th>
              <th>折扣说明</th>
              <th>来源</th>
              <th>生效期</th>
              <th>版本</th>
              <th>更新时间</th>
              <th>操作</th>
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
              <td>{{ simPercent(rule.rate) }}</td>
              <td>{{ rule.discountInfo ?? '—' }}</td>
              <td>{{ rule.dataSource === 'EASTMONEY_F10' ? '天天基金抓取' : '人工维护' }}</td>
              <td>{{ rule.effectiveFrom }}{{ rule.effectiveTo ? ` 至 ${rule.effectiveTo}` : ' 起' }}</td>
              <td>{{ rule.version }}</td>
              <td>{{ formatTime(rule.updatedAt) }}</td>
              <td>
                <button
                  class="text-button"
                  :disabled="!canMaintain || rule.effectiveTo !== null"
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
          :disabled="loading || !hasPreviousPage"
          type="button"
          @click="previousPage"
        >
          上一页
        </button>
        <span>第 {{ page + 1 }} 页 · 共 {{ total }} 条</span>
        <button
          class="text-button"
          :disabled="loading || !hasNextPage"
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
.admin-fee-rules-page .hint {
  margin-top: 8px;
  font-size: 13px;
  color: #6b7a72;
}
</style>
