<script setup lang="ts">
import * as echarts from 'echarts'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { FundNavPoint } from '@/types/fund'

const props = defineProps<{
  points: FundNavPoint[]
  loading: boolean
  errorMessage: string
  stale: boolean
  cachedAt: string | null
}>()

const chartElement = ref<InstanceType<typeof globalThis.HTMLDivElement> | null>(null)
let chart: echarts.ECharts | null = null

const validPoints = computed(() => props.points.filter((point) => Number.isFinite(Number(point.unitNav))))
const canRenderChart = computed(() => validPoints.value.length >= 2)
const earliestDate = computed(() => validPoints.value.at(0)?.navDate ?? '—')
const latestPoint = computed(() => validPoints.value.at(-1) ?? null)
const recentPoints = computed(() => validPoints.value.slice(-12).toReversed())

/** 保留四位小数展示历史净值；非法值不伪造为零。 */
function formatNetValue(value: number | string | null): string {
  if (value === null || value === '') {
    return '暂缺'
  }
  const numericValue = Number(value)
  return Number.isFinite(numericValue)
    ? numericValue.toLocaleString('zh-CN', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
    : '暂缺'
}

/** 初始化或更新 ECharts 实例；图表只绘制已同步单位净值。 */
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
      description: `基金已同步单位净值历史曲线，共 ${validPoints.value.length} 个数据点。`,
    },
    grid: { left: 54, right: 20, top: 26, bottom: 52 },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: string | number) => formatNetValue(value),
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: validPoints.value.map((point) => point.navDate),
      axisLabel: { color: '#597069', hideOverlap: true },
      axisLine: { lineStyle: { color: '#b9d5c5' } },
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: { color: '#597069', formatter: (value: number) => value.toFixed(2) },
      splitLine: { lineStyle: { color: 'rgba(20, 68, 57, 0.12)' } },
    },
    series: [{
      name: '单位净值（已同步）',
      type: 'line',
      data: validPoints.value.map((point) => Number(point.unitNav)),
      showSymbol: false,
      lineStyle: { color: '#0f766e', width: 2 },
      itemStyle: { color: '#0f766e' },
      areaStyle: { color: 'rgba(15, 118, 110, 0.12)' },
    }],
  }, { notMerge: true })
  chart.resize()
}

/** 响应容器变化，避免窄屏或横竖屏切换后图表被裁切。 */
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
  <div class="nav-history-card">
    <p
      v-if="loading"
      class="nav-history-state"
      role="status"
    >
      正在加载已同步的历史净值…
    </p>
    <p
      v-else-if="errorMessage"
      class="nav-history-state nav-history-error"
      role="status"
    >
      {{ errorMessage }}
    </p>
    <p
      v-else-if="!canRenderChart"
      class="nav-history-state"
      role="status"
    >
      当前日期范围内不足两条已同步净值，暂不绘制走势。
    </p>
    <template v-else>
      <p
        v-if="stale"
        class="nav-history-stale"
        role="status"
      >
        历史净值服务暂不可用，当前展示缓存数据（缓存时间：{{ cachedAt || '未知' }}）。
      </p>
      <div
        ref="chartElement"
        class="nav-history-chart"
        role="img"
        :aria-label="`从 ${earliestDate} 到 ${latestPoint?.navDate ?? '—'} 的已同步单位净值曲线`"
      />
      <p class="nav-history-caption">
        {{ earliestDate }} 至 {{ latestPoint?.navDate }} · 共 {{ validPoints.length }} 个交易日数据点 · 最新单位净值 {{ formatNetValue(latestPoint?.unitNav ?? null) }}
      </p>
      <details class="nav-history-table">
        <summary>查看最近 12 条净值数据表</summary>
        <table>
          <thead>
            <tr><th>净值日期</th><th>单位净值</th><th>累计净值</th></tr>
          </thead>
          <tbody>
            <tr
              v-for="point in recentPoints"
              :key="point.navDate"
            >
              <td>{{ point.navDate }}</td>
              <td>{{ formatNetValue(point.unitNav) }}</td>
              <td>{{ formatNetValue(point.accumulatedNav) }}</td>
            </tr>
          </tbody>
        </table>
      </details>
    </template>
  </div>
</template>

<style scoped>
.nav-history-card {
  padding: 18px;
  margin-top: 18px;
  background: rgb(255 255 255 / 72%);
  border: 1px solid rgb(20 68 57 / 12%);
  border-radius: 14px;
}

.nav-history-chart {
  width: 100%;
  min-height: 300px;
}

.nav-history-caption,
.nav-history-state {
  margin: 12px 0 0;
  color: #597069;
  line-height: 1.7;
}

.nav-history-error {
  color: #a34232;
}

.nav-history-stale {
  padding: 10px 12px;
  margin: 0 0 12px;
  color: #694f19;
  background: #fff4d8;
  border-left: 3px solid #d39e42;
  line-height: 1.6;
}

.nav-history-table {
  margin-top: 16px;
  color: #49635c;
}

.nav-history-table summary {
  min-height: 44px;
  cursor: pointer;
  font-weight: 700;
  line-height: 44px;
}

.nav-history-table table {
  width: 100%;
  margin-top: 8px;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

.nav-history-table th,
.nav-history-table td {
  padding: 9px 6px;
  text-align: left;
  border-top: 1px solid rgb(20 68 57 / 12%);
}

@media (max-width: 680px) {
  .nav-history-card {
    padding: 14px;
  }

  .nav-history-chart {
    min-height: 260px;
  }

  .nav-history-table {
    overflow-x: auto;
  }
}
</style>
