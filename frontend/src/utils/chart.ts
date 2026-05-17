import * as echarts from 'echarts/core'

const { LinearGradient } = echarts.graphic

const PPO_LAB_THEME = {
  color: ['#3B82F6', '#A78BFA', '#34D399', '#F59E0B', '#06B6D4', '#22C55E', '#EF4444'],
  backgroundColor: '#0B0F1A',
  textStyle: {
    color: '#F1F5F9',
    fontFamily: "'Inter', 'JetBrains Mono', system-ui, sans-serif",
    fontSize: 12,
  },
  title: {
    textStyle: { color: '#F1F5F9', fontSize: 14, fontWeight: 600 },
    subtextStyle: { color: '#94A3B8', fontSize: 11 },
  },
  legend: {
    textStyle: { color: '#94A3B8', fontSize: 11 },
  },
  tooltip: {
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderColor: 'rgba(148, 163, 184, 0.15)',
    borderWidth: 1,
    textStyle: { color: '#F1F5F9', fontSize: 12 },
    extraCssText: 'backdrop-filter: blur(8px); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);',
  },
}

export function registerChartTheme() {
  echarts.registerTheme('ppo-lab', PPO_LAB_THEME)
}

export function createBaseOption() {
  return {
    backgroundColor: 'transparent',
    grid: {
      left: 50,
      right: 20,
      top: 30,
      bottom: 30,
    },
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      borderColor: 'rgba(148, 163, 184, 0.15)',
      borderWidth: 1,
      textStyle: { color: '#F1F5F9', fontSize: 12 },
      extraCssText: 'backdrop-filter: blur(8px); border-radius: 8px;',
    },
    xAxis: {
      type: 'category' as const,
      axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } },
      axisTick: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } },
      axisLabel: { color: '#94A3B8', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.08)' } },
    },
    yAxis: {
      type: 'value' as const,
      axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } },
      axisTick: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } },
      axisLabel: { color: '#94A3B8', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.08)' } },
    },
  }
}

export function createLineSeries(
  name: string,
  data: number[],
  color: string,
  options: Record<string, unknown> = {}
) {
  return {
    name,
    type: 'line',
    data,
    smooth: true,
    symbol: 'none',
    lineStyle: { color, width: 2 },
    itemStyle: { color },
    ...options,
  }
}

export function createAreaSeries(
  name: string,
  data: number[],
  color: string
) {
  return {
    name,
    type: 'line',
    data,
    smooth: true,
    symbol: 'none',
    lineStyle: { color, width: 2 },
    itemStyle: { color },
    areaStyle: {
      color: new LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: color + '40' },
        { offset: 1, color: color + '05' },
      ]),
    },
  }
}

export function createBarSeries(
  name: string,
  data: number[],
  positiveColor: string = '#22C55E',
  negativeColor: string = '#EF4444'
) {
  return {
    name,
    type: 'bar',
    data: data.map(v => ({
      value: v,
      itemStyle: { color: v >= 0 ? positiveColor : negativeColor },
    })),
    barWidth: '60%',
  }
}

export function createHeatmapSeries(
  name: string,
  data: [number, number, number][],
  min: number = 0,
  max: number = 1
) {
  return {
    name,
    type: 'heatmap',
    data,
    min,
    max,
    itemStyle: {
      borderColor: '#0B0F1A',
      borderWidth: 2,
    },
    emphasis: {
      itemStyle: {
        borderColor: '#F1F5F9',
        borderWidth: 1,
      },
    },
  }
}
