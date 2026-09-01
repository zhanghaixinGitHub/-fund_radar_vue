<script setup lang="ts">
import { computed } from 'vue'

import type { FundSameTypeComparison } from '@/types/fund'
import { changeRateTone, dataSourceLabel, formatChangeRate } from '@/utils/fundPresentation'

const props = defineProps<{
  comparison: FundSameTypeComparison | null
  currentFundCode: string
  loading: boolean
  errorMessage: string
}>()

const visibleItems = computed(() => props.comparison?.items.slice(0, 5) ?? [])
const remainingItems = computed(() => props.comparison?.items.slice(5) ?? [])

function scopeLabel(scope: string | undefined): string {
  return scope === 'CURRENT_MARKET_ACTIVE_TUSHARE_PRO_FUND'
    ? '仅与当前基金市场中 ACTIVE 且 Tushare 基金数据源的同类型基金比较，不代表全市场排名。'
    : '比较范围信息暂不可用。'
}

function statusMessage(status: string | undefined): string {
  if (status === 'OUT_OF_SCOPE') {
    return '当前基金不在此受控市场样本范围内，暂不比较。'
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
      <p class="same-type-scope">
        {{ scopeLabel(comparison.scope) }}
      </p>
      <p
        v-if="comparison.status !== 'SYNCED'"
        class="same-type-state"
        role="status"
      >
        {{ statusMessage(comparison.status) }}
      </p>
      <template v-else>
        <dl class="same-type-summary">
          <div><dt>当前基金位置</dt><dd>{{ comparison.targetRank }} / {{ comparison.comparableCount }}</dd></div>
          <div><dt>比较净值日期</dt><dd>{{ comparison.asOfDate || '暂缺' }}</dd></div>
          <div><dt>比较指标</dt><dd>近一月涨跌</dd></div>
        </dl>
        <ol class="same-type-list">
          <li
            v-for="item in visibleItems"
            :key="item.fundCode"
            :class="{ 'is-current': item.fundCode === currentFundCode }"
          >
            <span class="same-type-rank">第 {{ item.rank }} 位</span>
            <strong>{{ item.fundName }}</strong>
            <span>{{ item.fundCode }} · {{ item.asOfDate }}</span>
            <span :class="['change-rate', changeRateTone(item.monthChangeRate)]">{{ formatChangeRate(item.monthChangeRate) }}</span>
            <span>{{ dataSourceLabel(item.dataSource) }}</span>
          </li>
        </ol>
        <details
          v-if="remainingItems.length > 0"
          class="same-type-details"
        >
          <summary>查看其余 {{ remainingItems.length }} 只同类样本</summary>
          <ol class="same-type-list">
            <li
              v-for="item in remainingItems"
              :key="item.fundCode"
              :class="{ 'is-current': item.fundCode === currentFundCode }"
            >
              <span class="same-type-rank">第 {{ item.rank }} 位</span>
              <strong>{{ item.fundName }}</strong>
              <span>{{ item.fundCode }} · {{ item.asOfDate }}</span>
              <span :class="['change-rate', changeRateTone(item.monthChangeRate)]">{{ formatChangeRate(item.monthChangeRate) }}</span>
              <span>{{ dataSourceLabel(item.dataSource) }}</span>
            </li>
          </ol>
        </details>
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
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 16px 0 0;
}

.same-type-summary div {
  min-width: 0;
  padding: 11px;
  background: #f4faf7;
  border: 1px solid #d7e9df;
  border-radius: 9px;
}

.same-type-summary dt {
  margin-bottom: 4px;
  color: #71847e;
  font-size: 12px;
}

.same-type-summary dd {
  margin: 0;
  color: #17332e;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
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
  grid-template-columns: auto minmax(150px, 1.3fr) minmax(130px, 1fr) auto minmax(120px, 1fr);
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
  color: #17332e;
}

.same-type-rank {
  color: #49635c;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.same-type-details {
  margin-top: 14px;
}

.same-type-details summary {
  min-height: 44px;
  cursor: pointer;
  color: #0d5e57;
  font-weight: 700;
  line-height: 44px;
}

@media (max-width: 760px) {
  .same-type-summary {
    grid-template-columns: 1fr;
  }

  .same-type-list li {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .same-type-list li > :first-child,
  .same-type-list li > strong {
    grid-column: span 1;
  }
}
</style>
