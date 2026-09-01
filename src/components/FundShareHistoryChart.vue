<script setup lang="ts">
import * as echarts from 'echarts'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { FundShareSnapshot } from '@/types/fund'
import { dataSourceLabel } from '@/utils/fundPresentation'

const props = defineProps<{
  points: FundShareSnapshot[]
  status: string
  loading: boolean
  errorMessage: string
}>()

const chartElement = ref<InstanceType<typeof globalThis.HTMLDivElement> | null>(null)
let chart: echarts.ECharts | null = null

const validPoints = computed(() => props.points.filter((point) => Number.isFinite(Number(point.fundShare))))
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
      description: `基金份额规模历史曲线，共 ${validPoints.value.length} 个已同步数据点，单位遵循来源口径。`,
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
      name: '基金份额（来源单位）',
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
        {{ earliestDate }} 至 {{ latestPoint?.tradeDate }} · 共 {{ validPoints.length }} 个数据点 · 最新基金份额 {{ formatShare(latestPoint?.fundShare) }}（来源单位）
      </p>
      <details class="share-history-table">
        <summary>查看最近 12 条份额规模数据表</summary>
        <table>
          <thead>
            <tr><th>变动日期</th><th>基金份额（来源单位）</th><th>数据来源</th></tr>
          </thead>
          <tbody>
            <tr
              v-for="point in recentPoints"
              :key="`${point.tradeDate}-${point.dataSource}`"
            >
              <td>{{ point.tradeDate }}</td>
              <td>{{ formatShare(point.fundShare) }}</td>
              <td>{{ dataSourceLabel(point.dataSource) }}</td>
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
