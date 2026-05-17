<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useECharts } from '@/composables/useECharts'

const props = defineProps<{
  data: number[][]
}>()

const chartRef = ref<HTMLElement | null>(null)
const { setOption } = useECharts(chartRef)

const xLabels = ['Helpfulness', 'Honesty', 'Safety', 'Coherence', 'Fluency']

function updateChart() {
  if (props.data.length === 0 || props.data[0].length === 0) return

  const yLabels = props.data.map((_, i) => `Batch ${i + 1}`)
  const heatmapData: [number, number, number][] = []
  let minVal = Infinity
  let maxVal = -Infinity

  props.data.forEach((row, yIdx) => {
    row.forEach((val, xIdx) => {
      heatmapData.push([xIdx, yIdx, val])
      if (val < minVal) minVal = val
      if (val > maxVal) maxVal = val
    })
  })

  if (!isFinite(minVal)) minVal = 0
  if (!isFinite(maxVal)) maxVal = 1

  const showLabels = props.data.length <= 10

  setOption({
    title: {
      text: 'AI回答质量热力图',
      textStyle: { color: '#F1F5F9', fontSize: 14, fontWeight: 600 },
      left: 8,
      top: 8,
    },
    grid: { left: 50, right: 16, top: 40, bottom: 30 },
    tooltip: {
      backgroundColor: 'rgba(17,24,39,0.95)',
      textStyle: { color: '#F1F5F9' },
      formatter: (params: any) => {
        const d = params.data as [number, number, number]
        return `${yLabels[d[1]]} · ${xLabels[d[0]]}<br/>Score: ${d[2].toFixed(2)}`
      },
    },
    xAxis: {
      type: 'category',
      data: xLabels,
      axisLabel: { color: '#94A3B8', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(148,163,184,0.2)' } },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)', type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: yLabels,
      axisLabel: { color: '#94A3B8', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(148,163,184,0.2)' } },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)', type: 'dashed' } },
    },
    visualMap: {
      min: minVal,
      max: maxVal,
      calculable: true,
      orient: 'vertical',
      right: 0,
      top: 'center',
      inRange: {
        color: ['#1E3A5F', '#2563EB', '#F59E0B', '#EF4444'],
      },
      textStyle: { color: '#94A3B8', fontSize: 10 },
    },
    animationDuration: 500,
    animationDurationUpdate: 200,
    series: [
      {
        type: 'heatmap',
        data: heatmapData,
        label: {
          show: showLabels,
          color: '#F1F5F9',
          fontSize: 10,
        },
        itemStyle: {
          borderColor: '#0B0F1A',
          borderWidth: 2,
          borderRadius: 4,
        },
        emphasis: {
          itemStyle: {
            borderColor: '#F1F5F9',
            borderWidth: 1,
          },
        },
      },
    ],
  })
}

onMounted(updateChart)
watch(() => props.data, updateChart, { deep: true })
</script>

<template>
  <div ref="chartRef" style="height: 240px" />
</template>
