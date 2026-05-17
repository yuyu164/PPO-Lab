import type { TrainingMetrics } from './algorithm'
import type { TrainingHyperparams, AchievementUnlock } from './api'

export interface WSStartMessage {
  action: 'start'
  params?: Partial<TrainingHyperparams>
}

export interface WSPauseMessage {
  action: 'pause'
}

export interface WSResumeMessage {
  action: 'resume'
}

export interface WSStepMessage {
  action: 'step'
}

export interface WSResetMessage {
  action: 'reset'
}

export interface WSUpdateParamsMessage {
  action: 'update_params'
  params: Partial<TrainingHyperparams>
}

export interface WSEpochMessage {
  type: 'epoch'
  data: TrainingMetrics
}

export interface WSAchievementMessage {
  type: 'achievement'
  data: AchievementUnlock
}

export interface WSStatusMessage {
  type: 'status'
  data: { state: 'idle' | 'running' | 'paused' | 'completed' | 'error'; epoch: number; max_epochs: number }
}

export interface WSErrorMessage {
  type: 'error'
  data: { code: string; message: string }
}

export type WSClientMessage =
  | WSStartMessage
  | WSPauseMessage
  | WSResumeMessage
  | WSStepMessage
  | WSResetMessage
  | WSUpdateParamsMessage

export type WSServerMessage =
  | WSEpochMessage
  | WSAchievementMessage
  | WSStatusMessage
  | WSErrorMessage
