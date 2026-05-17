<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { CurvePoint } from '@/types'
import { useECharts } from '@/composables/useECharts'

const props = defineProps<{
  refCurve: CurvePoint[]
  actorCurve: CurvePoint[]
  klDivergence: number
  overlapArea: number
}>()

const chartRef = ref<HTMLElement | null>(null)
const { setOption } = useECharts(chartRef)

function updateChart() {
  if (props.refCurve.length === 0) return

  const xData = props.refCurve.map(p => p.x)
  const refY = props.refCurve.map(p => p.y)
  const actorY = props.actorCurve.map(p => p.y)

  setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['Reference', 'Actor'], top: 0, textStyle: { color: '#94A3B8' } },
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: xData.map(x => x.toFixed(1)),
      axisLabel: { color: '#94A3B8', fontSize: 10, interval: 19 },
      axisLine: { lineStyle: { color: 'rgba(148,163,184,0.2)' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94A3B8', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)' } },
    },
    series: [
      {
        name: 'Reference',
        type: 'line',
        data: refY,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#94A3B8', width: 2 },
        areaStyle: { color: 'rgba(148,163,184,0.1)' },
      },
      {
        name: 'Actor',
        type: 'line',
        data: actorY,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#3B82F6', width: 2 },
        areaStyle: { color: 'rgba(59,130,246,0.15)' },
      },
    ],
  })
}

onMounted(updateChart)
watch(() => [props.refCurve, props.actorCurve], updateChart, { deep: true })
</script>

<template>
  <div class="relative">
    <div ref="chartRef" class="w-full h-64" />
    <div class="flex justify-center gap-6 mt-2 text-xs text-text-weak">
      <span>KL散度: <span class="text-actor font-mono">{{ klDivergence.toFixed(4) }}</span></span>
      <span>重叠面积: <span class="text-positive font-mono">{{ (overlapArea * 100).toFixed(1) }}%</span></span>
    </div>
  </div>
</template>
