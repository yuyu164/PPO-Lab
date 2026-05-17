import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, BarChart, HeatmapChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, VisualMapComponent, TitleComponent, MarkLineComponent, MarkAreaComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { registerChartTheme } from '@/utils/chart'

echarts.use([LineChart, BarChart, HeatmapChart, GridComponent, TooltipComponent, LegendComponent, VisualMapComponent, TitleComponent, MarkLineComponent, MarkAreaComponent, CanvasRenderer])

let themeRegistered = false

export function useECharts(containerRef: Ref<HTMLElement | null>) {
  const chart = ref<echarts.ECharts | null>(null)
  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    if (!themeRegistered) {
      registerChartTheme()
      themeRegistered = true
    }
    if (containerRef.value) {
      chart.value = echarts.init(containerRef.value, 'ppo-lab')

      resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          chart.value?.resize()
        })
      })
      resizeObserver.observe(containerRef.value)
    }
  })

  onUnmounted(() => {
    resizeObserver?.disconnect()
    chart.value?.dispose()
    chart.value = null
  })

  function setOption(option: echarts.EChartsCoreOption, notMerge: boolean = false) {
    chart.value?.setOption(option, notMerge)
  }

  function resize() {
    chart.value?.resize()
  }

  return { chart, setOption, resize }
}
