<script setup lang="ts">
import { getDirection1dFundHistory } from '@/api/direction1d'
import { useDirection1dFundHistory } from '@/composables/useDirection1dFundHistory'
import type { Direction1dRecord } from '@/types/direction1d'
import { direction1dConclusion, direction1dDirection, direction1dReason, direction1dTime } from '@/utils/direction1d'
import { formatChangeRate } from '@/utils/fundPresentation'

const props = defineProps<{ fundCode: string }>()
const { history, page, loading, error, canPrevious, canNext, refresh, retry, next, previous } = useDirection1dFundHistory(
  () => props.fundCode, getDirection1dFundHistory,
)
const branches = [{ id: 'FIXED', label: '固定模型' }, { id: 'WEEKLY', label: '每周更新模型' }] as const

/** 百分比只展示已公布的单位净值变化，绝不把模型分数当成预测收益。 */
function actualChange(record: Direction1dRecord): string {
  const outcome = record.outcomes[0]
  return outcome ? formatChangeRate(outcome.navReturn) : '等待官方净值'
}
</script>

<template>
  <section
    class="fund-prediction-history"
    aria-labelledby="fund-prediction-history-title"
    :aria-busy="loading"
  >
    <div class="section-heading">
      <div>
        <p class="eyebrow">
          一日预测 · 实验中
        </p>
        <h2 id="fund-prediction-history-title">
          本基金预测历史
        </h2>
      </div>
      <button
        class="secondary-button"
        type="button"
        :disabled="loading"
        @click="refresh"
      >
        刷新记录
      </button>
    </div>
    <p class="history-note">
      只展示当前基金，按预测目标日期从新到旧排列。官方净值公布后核对，等待结果的记录不计对错。
    </p>
    <p
      v-if="loading"
      class="state-message"
      role="status"
    >
      正在读取本基金预测历史…
    </p>
    <div
      v-else-if="error"
      role="alert"
      class="history-error"
    >
      <p>{{ error }}</p>
      <button
        class="secondary-button"
        type="button"
        @click="retry"
      >
        重新加载
      </button>
    </div>
    <div
      v-else-if="!history?.items.length"
      class="history-empty"
      role="status"
    >
      <h3>{{ page === 1 ? '这只基金暂时没有预测记录' : '这一页暂时没有更多记录' }}</h3>
      <p>已提前保存的预测会显示在这里；不会用历史回算补造预测。</p>
    </div>
    <div
      v-else
      class="history-table-wrap"
      tabindex="0"
      role="region"
      aria-label="本基金预测历史表格，可横向滚动"
    >
      <table>
        <thead>
          <tr>
            <th scope="col">
              预测目标日
            </th><th
              v-for="branch in branches"
              :key="branch.id"
              scope="col"
            >
              {{ branch.label }}
            </th><th scope="col">
              实际涨跌
            </th><th scope="col">
              核对结果
            </th><th scope="col">
              预测保存时间
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="record in history.items"
            :key="record.forecastId"
          >
            <td
              v-if="record.status"
              colspan="6"
              class="history-error"
            >
              {{ direction1dReason(record.status) }}，该条预测停止展示。
            </td>
            <template v-else>
              <th scope="row">
                {{ record.forecast.targetNavDate }}<small>对比 {{ record.forecast.baseNavDate }}</small>
              </th>
              <td
                v-for="branch in branches"
                :key="branch.id"
              >
                {{ direction1dDirection(record.forecast.branches.find(item => item.branchId === branch.id)?.predictedDirection) }}
              </td>
              <td>{{ record.outcomes.length ? direction1dDirection(record.outcomes[0]?.actualDirection) : '等待结果' }}<small>{{ actualChange(record) }}</small></td>
              <td>
                <span
                  v-for="branch in branches"
                  :key="branch.id"
                  class="history-conclusion"
                >{{ branch.label }}：<strong>{{ direction1dConclusion(record, branch.id) }}</strong></span>
              </td>
              <td>{{ direction1dTime(record.receiptVerifiedAt ?? record.storedAt) }}<small>{{ record.receiptStatus === 'VERIFIED' ? '已确认提前保存' : '提前保存状态未确认' }}</small></td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
    <nav
      v-if="page > 1 || (history?.totalCount ?? 0) > 20"
      class="pagination"
      aria-label="本基金预测历史分页"
    >
      <p class="pagination-summary">
        第 {{ page }} 页<span v-if="history"> · 共 {{ history.totalCount }} 条</span>
      </p>
      <div class="pagination-controls">
        <button
          type="button"
          :disabled="!canPrevious"
          @click="previous"
        >
          上一页
        </button>
        <button
          type="button"
          :disabled="!canNext"
          @click="next"
        >
          下一页
        </button>
      </div>
    </nav>
  </section>
</template>

<style scoped>
.fund-prediction-history { margin-top: 24px; padding: 22px; background: #fff; border: 1px solid var(--workspace-border, #dfe8e3); border-radius: 10px; }
.history-note, small { color: var(--workspace-muted, #597069); line-height: 1.7; }
.history-note { margin: 0 0 20px; font-size: 13px; }
.history-table-wrap { overflow-x: auto; }
.history-table-wrap:focus-visible { outline: 2px solid #0f766e; outline-offset: 3px; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th, td { padding: 16px 12px; text-align: left; border-bottom: 1px solid var(--workspace-border, #dfe8e3); vertical-align: top; }
thead th { background: #f2f8f5; font-size: 13px; white-space: nowrap; }
tbody th { font-weight: 600; white-space: nowrap; }
tbody tr:last-child > * { border-bottom: 0; }
small { display: block; margin-top: 5px; font-size: 12px; font-weight: 400; }
.history-conclusion { display: block; white-space: nowrap; line-height: 1.9; }
.history-empty { padding: 24px; background: #f7faf8; border-radius: 6px; }
.history-empty h3 { margin: 0 0 10px; font-size: 16px; }
.history-empty p { margin: 0; color: var(--workspace-muted, #597069); }
.history-error { color: #ac2d36; }
@media (max-width: 760px) { .fund-prediction-history { padding: 16px; } th, td { min-width: 120px; } }
</style>
