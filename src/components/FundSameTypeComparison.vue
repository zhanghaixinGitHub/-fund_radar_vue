<script setup lang="ts">
import { computed } from 'vue'

import type { FundSameTypeComparison } from '@/types/fund'
import { changeRateTone, formatChangeRate, fundTypeLabel } from '@/utils/fundPresentation'

const props = defineProps<{
  comparison: FundSameTypeComparison | null
  currentFundCode: string
  loading: boolean
  errorMessage: string
}>()

/** 优先展示后端已核实的细类；旧响应仍说明按大类划分，不能由名称猜测投资方向。 */
const sameTypeLabel = computed(() => {
  const comparison = props.comparison
  if (comparison?.scope === 'VERIFIED_CURRENT_MARKET_PEER_GROUP') {
    return comparison.comparisonGroup?.basis === 'VERIFIED_DISCLOSURE'
      ? `本次同类：${comparison.comparisonGroup.name}`
      : '本次同类：暂未确定'
  }
  if (comparison?.scope !== 'CURRENT_MARKET_ACTIVE_TUSHARE_PRO_FUND') {
    return '本次同类：比较范围暂不可用'
  }
  const typeLabel = fundTypeLabel(comparison.fundType)
  if (typeLabel === '其他类型' && comparison.fundType !== 'OTHER') {
    return '本次同类：基金分类暂缺'
  }
  return `本次同类：${typeLabel}（按基金大类划分）`
})

/** 仅对已收录样本按近一月净值变化降序展示；同值时按代码升序，不代表全市场同类排名。 */
const orderedItems = computed(() => [...(props.comparison?.items ?? [])]
  .sort((left, right) => sortableMonthChange(right.monthChangeRate) - sortableMonthChange(left.monthChangeRate)
    || left.fundCode.localeCompare(right.fundCode)))

/** 涨跌幅兼容接口返回的小数和数字字符串；缺失或无效值排在末尾，不能当作零涨跌。 */
function sortableMonthChange(value: number | string | null | undefined): number {
  if (value === null || value === undefined || String(value).trim() === '') {
    return Number.NEGATIVE_INFINITY
  }
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : Number.NEGATIVE_INFINITY
}

function scopeLabel(scope: string | undefined): string {
  if (scope === 'VERIFIED_CURRENT_MARKET_PEER_GROUP') {
    const description = props.comparison?.comparisonGroup?.description
    return description
      ? `${description}仅比较已收录基金的单位净值变化，不含分红和买卖费用。`
      : ''
  }
  return scope === 'CURRENT_MARKET_ACTIVE_TUSHARE_PRO_FUND'
    ? '仅比较已收录且截至同一天的基金，按近一月单位净值变化从高到低排列，不含分红和买卖费用。'
    : '比较范围信息暂不可用。'
}

function statusMessage(status: string | undefined): string {
  if (['CLASSIFICATION_INSUFFICIENT', 'DATA_INSUFFICIENT', 'NO_PEERS', 'OUT_OF_SCOPE'].includes(status ?? '')
    && props.comparison?.reason) {
    return props.comparison.reason
  }
  if (status === 'OUT_OF_SCOPE') {
    return '当前基金不在已收录的可比基金范围内，暂不比较。'
  }
  if (status === 'DATA_INSUFFICIENT') {
    return '当前基金或同类样本缺少同净值日期的一月涨跌基准，暂不比较。'
  }
  return '同类型比较数据暂时不可用。'
}
</script>

<template>
  <div class="same-type-card">
    <p
      v-if="loading"
      class="same-type-state"
      role="status"
    >
      正在加载同类型比较…
    </p>
    <p
      v-else-if="errorMessage"
      class="same-type-state same-type-error"
      role="status"
    >
      {{ errorMessage }}
    </p>
    <template v-else-if="comparison">
      <p class="same-type-category">
        {{ sameTypeLabel }}
      </p>
      <p
        v-if="scopeLabel(comparison.scope)"
        class="same-type-scope"
      >
        {{ scopeLabel(comparison.scope) }}
      </p>
      <p
        v-if="!['SYNCED', 'NO_PEERS'].includes(comparison.status)"
        class="same-type-state"
        role="status"
      >
        {{ statusMessage(comparison.status) }}
      </p>
      <template v-else>
        <p
          v-if="comparison.status === 'NO_PEERS'"
          class="same-type-state"
          role="status"
        >
          {{ statusMessage(comparison.status) }}
        </p>
        <!-- 所有可比基金共用同一统计截止日，仅在列表顶部展示，避免逐行重复。 -->
        <div class="same-type-summary">
          <p>
            近一月单位净值变化 ·
            <template v-if="comparison.comparisonStartDate && comparison.asOfDate">
              {{ comparison.comparisonStartDate }} 至 {{ comparison.asOfDate }}
            </template>
            <template v-else-if="comparison.asOfDate">
              截至 {{ comparison.asOfDate }}
            </template>
            <template v-else>
              截止日期暂缺
            </template>
          </p>
          <span>本次比较 {{ comparison.comparableCount }} 只基金</span>
        </div>
        <ol class="same-type-list">
          <li
            v-for="item in orderedItems"
            :key="item.fundCode"
            :class="{ 'is-current': item.fundCode === currentFundCode }"
          >
            <strong>{{ item.fundName }} ({{ item.fundCode }})</strong>
            <span :class="['change-rate', changeRateTone(item.monthChangeRate)]">{{ formatChangeRate(item.monthChangeRate) }}</span>
          </li>
        </ol>
      </template>
    </template>
  </div>
</template>

<style scoped>
.same-type-card {
  padding: 18px;
  margin-top: 18px;
  background: rgb(255 255 255 / 72%);
  border: 1px solid rgb(20 68 57 / 12%);
  border-radius: 14px;
}

.same-type-category {
  margin: 0 0 6px;
  color: #17332e;
  font-weight: 700;
  line-height: 1.7;
}

.same-type-scope,
.same-type-state {
  margin: 0;
  color: #597069;
  line-height: 1.7;
}

.same-type-error {
  color: #a34232;
}

.same-type-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: baseline;
  justify-content: space-between;
  margin: 16px 0 0;
}

.same-type-summary p {
  margin: 0;
  color: #17332e;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.same-type-summary > span {
  color: #71847e;
  font-size: 13px;
}

.same-type-list {
  display: grid;
  gap: 10px;
  padding: 0;
  margin: 16px 0 0;
  list-style: none;
}

.same-type-list li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 12px;
  color: #597069;
  background: #fff;
  border: 1px solid rgb(20 68 57 / 12%);
  border-radius: 10px;
  font-size: 14px;
}

.same-type-list li.is-current {
  border-color: #0f766e;
  box-shadow: inset 3px 0 #0f766e;
}

.same-type-list strong {
  min-width: 0;
  color: #17332e;
  overflow-wrap: anywhere;
}

.same-type-list .change-rate {
  white-space: nowrap;
}
</style>
