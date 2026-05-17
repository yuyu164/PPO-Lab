<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import type { GAEStep } from '@/types'
import { useECharts } from '@/composables/useECharts'

const props = defineProps<{
  steps: GAEStep[]
  currentTraceIndex: number
}>()

const chartRef = ref<HTMLElement | null>(null)
const { setOption } = useECharts(chartRef)

const barData = computed(() =>
  props.steps.map((step, index) => {
    const isGrayed = index > props.currentTraceIndex
    const isCurrent = index === props.currentTraceIndex
    const color = isGrayed
      ? 'rgba(100,116,139,0.2)'
      : step.is_positive
        ? '#22C55E'
        : '#EF4444'
    return {
      value: step.A_t,
      itemStyle: {
        color,
        borderColor: isCurrent ? '#FFFFFF' : 'transparent',
        borderWidth: isCurrent ? 2 : 0,
      },
    }
  })
)

function updateChart() {
  if (props.steps.length === 0) return

  setOption({
    animation: false,
    animationDuration: 0,
    title: {
      text: '优势函数 A_t',
      left: 'center',
      textStyle: { color: '#F1F5F9', fontSize: 14, fontWeight: 600 },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      borderColor: 'rgba(148, 163, 184, 0.15)',
      borderWidth: 1,
      textStyle: { color: '#F1F5F9', fontSize: 12 },
    },
    grid: {
      left: 50,
      right: 20,
      top: 50,
      bottom: 30,
    },
    xAxis: {
      type: 'category',
      data: props.steps.map(s => s.token),
      axisLabel: { color: '#94A3B8', fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(148,163,184,0.2)' } },
      axisTick: { lineStyle: { color: 'rgba(148,163,184,0.2)' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94A3B8', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)' } },
      axisLine: { lineStyle: { color: 'rgba(148,163,184,0.2)' } },
      axisTick: { lineStyle: { color: 'rgba(148,163,184,0.2)' } },
    },
    series: [
      {
        name: 'A_t',
        type: 'bar',
        data: barData.value,
        barWidth: '60%',
      },
    ],
  }, true)
}

onMounted(updateChart)
watch([() => props.steps, () => props.currentTraceIndex], updateChart, { deep: true })
</script>

<template>
  <div ref="chartRef" class="w-full h-64" />
</template>
