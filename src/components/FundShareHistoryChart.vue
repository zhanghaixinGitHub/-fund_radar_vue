<script setup lang="ts">
import * as echarts from 'echarts'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { FundNavPoint, FundShareSnapshot } from '@/types/fund'
import { buildFundShareHistoryRows } from '@/utils/fundShareHistory'

const props = defineProps<{
  points: FundShareSnapshot[]
  status: string
  loading: boolean
  errorMessage: string
  navPoints: FundNavPoint[]
  navLoading: boolean
  navUnavailable: boolean
  navStale: boolean
}>()

const chartElement = ref<InstanceType<typeof globalThis.HTMLDivElement> | null>(null)
let chart: echarts.ECharts | null = null

const validPoints = computed(() => buildFundShareHistoryRows(props.points, props.navPoints))
const canRenderChart = computed(() => validPoints.value.length >= 2)
const earliestDate = computed(() => validPoints.value.at(0)?.tradeDate ?? '—')
const latestPoint = computed(() => validPoints.value.at(-1) ?? null)
const recentPoints = computed(() => validPoints.value.slice(-12).toReversed())

/** 份额单位严格沿用来源口径，只格式化数字，不换算为规模或资产金额。 */
function formatShare(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '暂缺'
  }
  const numericValue = Number(value)
  return Number.isFinite(numericValue)
    ? numericValue.toLocaleString('zh-CN', { maximumFractionDigits: 4 })
    : '暂缺'
}

/** 份额变化统一用正负号表达方向，不使用收益涨跌颜色暗示申购或赎回的好坏。 */
function formatShareChange(value: number | null): string {
  if (value === null) return '无上期记录'
  if (value === 0) return '0'
  return `${value > 0 ? '+' : '-'}${formatShare(Math.abs(value))}`
}

/** 同日单位净值固定四位小数；没有精确匹配的记录时不展示邻近日期的价格。 */
function formatNav(value: number | null): string {
  return value === null
    ? props.navLoading ? '加载中…' : '暂缺'
    : value.toLocaleString('zh-CN', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
}

/** 初始化或更新份额趋势图；只绘制已同步的来源原始份额。 */
async function renderChart(): Promise<void> {
  await nextTick()
  if (!chartElement.value || !canRenderChart.value) {
    chart?.dispose()
    chart = null
    return
  }
  chart ??= echarts.init(chartElement.value, undefined, { renderer: 'canvas' })
  chart.setOption({
    animation: false,
    aria: {
      enabled: true,
      description: `基金份额规模历史曲线，共 ${validPoints.value.length} 个数据点，单位为万份。`,
    },
    grid: { left: 60, right: 20, top: 26, bottom: 52 },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: string | number) => formatShare(value),
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: validPoints.value.map((point) => point.tradeDate),
      axisLabel: { color: '#597069', hideOverlap: true },
      axisLine: { lineStyle: { color: '#b9d5c5' } },
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: { color: '#597069', formatter: (value: number) => formatShare(value) },
      splitLine: { lineStyle: { color: 'rgba(20, 68, 57, 0.12)' } },
    },
    series: [{
      name: '基金份额（万份）',
      type: 'line',
      data: validPoints.value.map((point) => Number(point.fundShare)),
      showSymbol: false,
      lineStyle: { color: '#7c3f98', width: 2 },
      itemStyle: { color: '#7c3f98' },
      areaStyle: { color: 'rgba(124, 63, 152, 0.12)' },
    }],
  }, { notMerge: true })
  chart.resize()
}

function resizeChart(): void {
  chart?.resize()
}

onMounted(() => {
  globalThis.addEventListener('resize', resizeChart)
  void renderChart()
})

watch(() => props.points, () => {
  void renderChart()
})

onBeforeUnmount(() => {
  globalThis.removeEventListener('resize', resizeChart)
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div class="share-history-card">
    <p
      v-if="loading"
      class="share-history-state"
      role="status"
    >
      正在加载已同步的基金份额规模历史…
    </p>
    <p
      v-else-if="errorMessage"
      class="share-history-state share-history-error"
      role="status"
    >
      {{ errorMessage }}
    </p>
    <p
      v-else-if="status !== 'SYNCED'"
      class="share-history-state"
      role="status"
    >
      基金份额规模尚未同步，暂不展示趋势。
    </p>
    <p
      v-else-if="!canRenderChart"
      class="share-history-state"
      role="status"
    >
      当前仅有不足两条已同步份额记录，暂不绘制趋势。
    </p>
    <template v-else>
      <div
        ref="chartElement"
        class="share-history-chart"
        role="img"
        :aria-label="`从 ${earliestDate} 到 ${latestPoint?.tradeDate ?? '—'} 的基金份额规模历史曲线`"
      />
      <p class="share-history-caption">
        {{ earliestDate }} 至 {{ latestPoint?.tradeDate }} · 共 {{ validPoints.length }} 个数据点 · 最新基金份额 {{ formatShare(latestPoint?.fundShare) }} 万份
      </p>
      <details
        class="share-history-table"
        open
      >
        <summary>最近 12 条份额规模数据表</summary>
        <p class="share-history-note">
          “较上期”指上一条已有记录，不一定相隔一个季度；净值对应同一日期。份额变化不等于资金净流入。
        </p>
        <p
          v-if="navUnavailable"
          class="share-history-note"
          role="status"
        >
          同日净值暂时无法获取，份额数据仍可查看。
        </p>
        <p
          v-else-if="navStale"
          class="share-history-note"
          role="status"
        >
          同日净值暂时无法更新，当前展示已保存的数据。
        </p>
        <table>
          <thead>
            <tr>
              <th scope="col">
                日期
              </th>
              <th scope="col">
                基金份额（万份）
              </th>
              <th scope="col">
                较上期份额变化（万份）
              </th>
              <th scope="col">
                同日单位净值（元）
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="point in recentPoints"
              :key="`${point.tradeDate}-${point.dataSource}`"
            >
              <td>{{ point.tradeDate }}</td>
              <td>{{ formatShare(point.fundShare) }}</td>
              <td>
                {{ formatShareChange(point.shareChange) }}
              </td>
              <td>{{ formatNav(point.unitNav) }}</td>
            </tr>
          </tbody>
        </table>
      </details>
    </template>
  </div>
</template>

<style scoped>
.share-history-card {
  padding: 18px;
  margin-top: 18px;
  background: rgb(255 255 255 / 72%);
  border: 1px solid rgb(20 68 57 / 12%);
  border-radius: 14px;
}

.share-history-chart {
  width: 100%;
  min-height: 300px;
}

.share-history-caption,
.share-history-state {
  margin: 12px 0 0;
  color: #597069;
  line-height: 1.7;
}

.share-history-error {
  color: #a34232;
}

.share-history-table {
  margin-top: 16px;
  color: #49635c;
}

.share-history-table summary {
  min-height: 44px;
  cursor: pointer;
  font-weight: 700;
  line-height: 44px;
}

.share-history-table table {
  width: 100%;
  min-width: 640px;
  margin-top: 8px;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

.share-history-table th,
.share-history-table td {
  padding: 9px 6px;
  text-align: left;
  border-top: 1px solid rgb(20 68 57 / 12%);
}

.share-history-table {
  overflow-x: auto;
}

.share-history-table th:not(:first-child),
.share-history-table td:not(:first-child) {
  text-align: right;
}

.share-history-table td {
  white-space: nowrap;
}

.share-history-note {
  color: #597069;
  font-size: 13px;
  line-height: 1.6;
}

.share-history-note {
  margin: 4px 0 8px;
}

@media (max-width: 680px) {
  .share-history-card {
    padding: 14px;
  }

  .share-history-chart {
    min-height: 260px;
  }

  .share-history-table {
    overflow-x: auto;
  }
}
</style>
