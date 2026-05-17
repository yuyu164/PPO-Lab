import { ref, onUnmounted } from 'vue'
import type { TrainingMetrics, TrainingHyperparams, AchievementUnlock } from '@/types'

type WsClientAction = 'start' | 'pause' | 'resume' | 'step' | 'reset' | 'update_params' | 'heartbeat'

interface WsClientMessage {
  action: WsClientAction
  params?: Partial<TrainingHyperparams>
}

interface WsStatusData {
  state: 'idle' | 'running' | 'paused' | 'completed' | 'error'
  epoch: number
  max_epochs: number
}

interface WsErrorData {
  code: string
  message: string
}

class TrainingWebSocket {
  private ws: WebSocket | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectDelay: number = 3000
  private url: string = ''

  onEpoch: ((data: TrainingMetrics) => void) | null = null
  onAchievement: ((data: AchievementUnlock) => void) | null = null
  onStatus: ((data: WsStatusData) => void) | null = null
  onError: ((data: WsErrorData) => void) | null = null
  onOpen: (() => void) | null = null
  onClose: (() => void) | null = null

  connect(url: string): void {
    this.url = url
    this.cleanup()
    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.startHeartbeat()
      if (this.onOpen) this.onOpen()
    }

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (e) {
        console.error('[WS] 消息解析失败:', e)
      }
    }

    this.ws.onclose = (event: CloseEvent) => {
      this.stopHeartbeat()
      if (this.onClose) this.onClose()
      if (!event.wasClean) this.attemptReconnect()
    }

    this.ws.onerror = () => {
      console.error('[WS] 连接错误')
    }
  }

  disconnect(): void {
    this.cleanup()
    this.reconnectAttempts = this.maxReconnectAttempts
  }

  send(message: WsClientMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  startTraining(params: TrainingHyperparams): void {
    this.send({ action: 'start', params })
  }

  pauseTraining(): void { this.send({ action: 'pause' }) }
  resumeTraining(): void { this.send({ action: 'resume' }) }
  stepTraining(): void { this.send({ action: 'step' }) }
  resetTraining(): void { this.send({ action: 'reset' }) }

  updateParams(params: Partial<TrainingHyperparams>): void {
    this.send({ action: 'update_params', params })
  }

  private handleMessage(message: { type: string; data: unknown }): void {
    switch (message.type) {
      case 'epoch': if (this.onEpoch) this.onEpoch(message.data as TrainingMetrics); break
      case 'achievement': if (this.onAchievement) this.onAchievement(message.data as AchievementUnlock); break
      case 'status': if (this.onStatus) this.onStatus(message.data as WsStatusData); break
      case 'error': if (this.onError) this.onError(message.data as WsErrorData); break
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      this.send({ action: 'heartbeat' })
    }, 30000)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) { clearInterval(this.heartbeatTimer); this.heartbeatTimer = null }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (this.onError) this.onError({ code: 'WS_MAX_RECONNECT', message: 'WebSocket连接失败，请刷新页面重试' })
      return
    }
    this.reconnectAttempts++
    const delay = this.reconnectDelay * this.reconnectAttempts
    this.reconnectTimer = setTimeout(() => { this.connect(this.url) }, delay)
  }

  private cleanup(): void {
    this.stopHeartbeat()
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null }
    if (this.ws) {
      this.ws.onopen = null
      this.ws.onmessage = null
      this.ws.onclose = null
      this.ws.onerror = null
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Client disconnect')
      }
      this.ws = null
    }
  }

  getReadyState(): number { return this.ws?.readyState ?? WebSocket.CLOSED }

  destroy(): void {
    this.disconnect()
    this.onEpoch = null
    this.onAchievement = null
    this.onStatus = null
    this.onError = null
    this.onOpen = null
    this.onClose = null
  }
}

const WS_URL: string = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/training'
const globalWs: { instance: TrainingWebSocket | null } = { instance: null }

function useWebSocket() {
  const wsInstance = ref<TrainingWebSocket | null>(null)
  const isConnected = ref(false)
  const lastError = ref<string | null>(null)

  function connect(): void {
    if (globalWs.instance) {
      wsInstance.value = globalWs.instance
      isConnected.value = globalWs.instance.getReadyState() === WebSocket.OPEN
      return
    }
    const ws = new TrainingWebSocket()
    ws.onStatus = () => { isConnected.value = true }
    ws.onError = (data) => { lastError.value = `${data.code}: ${data.message}`; isConnected.value = false }
    ws.onOpen = () => { isConnected.value = true }
    ws.onClose = () => { isConnected.value = false }
    ws.connect(WS_URL)
    globalWs.instance = ws
    wsInstance.value = ws
  }

  function disconnect(): void {
    if (globalWs.instance) { globalWs.instance.destroy(); globalWs.instance = null }
    wsInstance.value = null
    isConnected.value = false
    lastError.value = null
  }

  onUnmounted(() => {
    disconnect()
  })

  return { wsInstance, isConnected, lastError, connect, disconnect }
}

export { TrainingWebSocket, useWebSocket, WS_URL }
export type { WsStatusData, WsErrorData }
