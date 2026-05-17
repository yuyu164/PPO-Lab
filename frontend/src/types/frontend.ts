export interface ChartDataPoint {
  epoch: number
  value: number
}

export interface HeatmapData {
  epochs: number[]
  dimensions: string[]
  values: number[][]
}

export type AnimationSpeed = 1 | 2 | 4

export type QuadModelStatus = 'idle' | 'generating' | 'paused' | 'complete'
export type GAERetraceStatus = 'idle' | 'tracing' | 'paused' | 'complete'
export type TrainingStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error'
export type WSConnectionStatus = 'disconnected' | 'connecting' | 'connected'

export interface SectionProgress {
  id: string
  title: string
  visited: boolean
  current: boolean
}
