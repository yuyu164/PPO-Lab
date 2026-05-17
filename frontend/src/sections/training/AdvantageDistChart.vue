<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useECharts } from '@/composables/useECharts'

const props = defineProps<{
  advantages: number[]
}>()

const chartRef = ref<HTMLElement | null>(null)
const { setOption } = useECharts(chartRef)

function updateChart() {
  if (props.advantages.length === 0) return
  const xData = props.advantages.map((_, i) => `Token ${i}`)
  const seriesData = props.advantages.map(v => ({
    value: v,
    itemStyle: {
      color: v >= 0 ? '#22C55E' : '#EF4444',
      borderRadius: v >= 0 ? [4, 4, 0, 0] : [0, 0, 4, 4],
    },
  }))

  setOption({
    title: {
      text: '优势函数分布',
      textStyle: { color: '#F1F5F9', fontSize: 14, fontWeight: 600 },
      left: 8,
      top: 8,
    },
    grid: { left: 50, right: 16, top: 40, bottom: 30 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(17,24,39,0.95)',
      textStyle: { color: '#F1F5F9' },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params
        const val = p.value as number
        const color = val >= 0 ? '#22C55E' : '#EF4444'
        return `${p.axisValue}<br/><span style="color:${color}">●</span> Advantage: ${val.toFixed(4)}`
      },
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: { color: '#94A3B8', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(148,163,184,0.2)' } },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)', type: 'dashed' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94A3B8', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(148,163,184,0.2)' } },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)', type: 'dashed' } },
    },
    animationDuration: 600,
    animationEasing: 'elasticOut',
    series: [
      {
        type: 'bar',
        data: seriesData,
        barWidth: '60%',
      },
    ],
  })
}

onMounted(updateChart)
watch(() => props.advantages, updateChart, { deep: true })
</script>

<template>
  <div ref="chartRef" style="height: 240px" />
</template>
