<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useECharts } from '@/composables/useECharts'

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
      text: 'KL散度',
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
        const zone = val >= 0.1 && val <= 0.3 ? '✓ 安全区' : '✗ 异常区'
        return `Epoch ${p.axisValue}<br/><span style="color:#F59E0B">●</span> KL: ${val.toFixed(4)}<br/>${zone}`
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
        lineStyle: { color: '#F59E0B', width: 2 },
        itemStyle: { color: '#F59E0B' },
        markLine: {
          silent: true,
          symbol: 'none',
          data: [
            {
              yAxis: 0.1,
              lineStyle: { color: '#22C55E', type: 'dashed', width: 1 },
              label: { formatter: '下限 0.1', color: '#22C55E', fontSize: 10 },
            },
            {
              yAxis: 0.3,
              lineStyle: { color: '#EF4444', type: 'dashed', width: 1 },
              label: { formatter: '上限 0.3', color: '#EF4444', fontSize: 10 },
            },
          ],
        },
        markArea: {
          silent: true,
          data: [
            [
              {
                yAxis: 0.1,
                itemStyle: { color: 'rgba(34,197,94,0.05)' },
              },
              {
                yAxis: 0.3,
                itemStyle: { color: 'rgba(34,197,94,0.05)' },
              },
            ],
          ],
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
