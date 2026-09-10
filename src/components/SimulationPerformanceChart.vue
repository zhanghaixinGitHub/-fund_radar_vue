<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import type { SimDaily } from '@/types/simulation'
const props = defineProps<{ points: SimDaily[] }>()
const target = ref<InstanceType<typeof globalThis.HTMLDivElement> | null>(null)
let chart: echarts.ECharts | null = null
let observer: globalThis.ResizeObserver | null = null
let alive = true
async function draw() {
  await nextTick()
  if (!alive) return
  if (!target.value || !props.points.length) { observer?.disconnect(); chart?.dispose(); chart = null; return }
  chart ??= echarts.init(target.value)
  observer?.observe(target.value)
  chart.setOption({
    animation: false, aria: { enabled: true, description: '模拟累计收益金额曲线，已剔除本金投入，单位为元。' },
    grid: { left: 65, right: 22, top: 24, bottom: 45 },
    tooltip: { trigger: 'axis', valueFormatter: (value: unknown) => `${Number(value).toFixed(2)} 元` },
    xAxis: { type: 'category', data: props.points.map(p => p.date), axisLabel: { hideOverlap: true } },
    yAxis: { type: 'value', name: '收益（元）', scale: true },
    series: [{ name: '累计收益', type: 'line', data: props.points.map(p => Number(p.cumulativeGain)),
      showSymbol: props.points.length < 10, lineStyle: { color: '#0f766e', width: 2 }, itemStyle: { color: '#0f766e' } }],
  }, true)
}
watch(() => props.points, () => void draw(), { deep: true })
onMounted(() => { void draw(); observer = new globalThis.ResizeObserver(() => chart?.resize()); if (target.value) observer.observe(target.value) })
onBeforeUnmount(() => { alive = false; observer?.disconnect(); chart?.dispose() })
</script>
<template>
  <div
    v-if="points.length"
    ref="target"
    class="sim-chart"
    role="img"
    aria-label="模拟累计收益曲线，单位元"
  />
  <p v-else>
    完成首笔交易确认并取得净值后，这里会显示收益曲线。
  </p>
</template>
