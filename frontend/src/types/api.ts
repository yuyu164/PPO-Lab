export interface ApiResponse<T = unknown> {
  success: boolean
  data: T | null
  error: { code: string; message: string } | null
}

export interface KLBetaInterpretation {
  status: 'warning' | 'optimal' | 'locked'
  title: string
  description: string
}

export interface CurvePoint {
  x: number
  y: number
}

export interface NormalDistribution {
  mean: number
  std: number
  curve: CurvePoint[]
}

export interface StepCalculation {
  step: number
  token: string
  formulas: {
    td_error: { formula: string; substitution: string; result: number }
    gae: { formula: string; substitution: string; result: number }
  }
  is_positive: boolean
}

export interface TrainingHyperparams {
  kl_ctl: number
  gamma: number
  lam: number
  clip_range: number
  learning_rate: number
  ppo_epochs: number
}

export type AchievementType = 'first_converge' | 'kl_stable' | 'continuous_improve' | 'precise_tuning' | 'master'

export interface AchievementUnlock {
  achievement: AchievementType
  description: string
  unlocked_at_epoch: number
}

export type PresetType = 'beginner' | 'standard' | 'aggressive'
