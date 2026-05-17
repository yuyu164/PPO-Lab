<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import * as echarts from 'echarts/core'
import { useECharts } from '@/composables/useECharts'

const { LinearGradient } = echarts.graphic

const props = defineProps<{
  data: Array<{ epoch: number; value: number }>
}>()

const chartRef = ref<HTMLElement | null>(null)
const { setOption } = useECharts(chartRef)

function updateChart() {
  if (props.data.length === 0) return
  const sliced = props.data.slice(-100)
  const xData = sliced.map(d => d.epoch)
  const yData = sliced.map(d => d.value)

  setOption({
    title: {
      text: 'Critic Loss',
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
        return `Epoch ${p.axisValue}<br/><span style="color:#A78BFA">●</span> Value: ${p.value.toFixed(4)}`
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
    animationDuration: 500,
    animationDurationUpdate: 200,
    series: [
      {
        type: 'line',
        data: yData,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#A78BFA', width: 2 },
        itemStyle: { color: '#A78BFA' },
        areaStyle: {
          color: new LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(167,139,250,0.35)' },
            { offset: 1, color: 'rgba(167,139,250,0.02)' },
          ]),
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
