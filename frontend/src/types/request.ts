import type { ModelParams } from './algorithm'

export interface GenerateEpisodeRequest {
  prompt: string
  actor_params?: ModelParams
  ref_params?: ModelParams
  kl_ctl?: number
  max_tokens?: number
}

export interface StepForwardRequest {
  prompt: string
  current_tokens?: string[]
  actor_params?: ModelParams
  ref_params?: ModelParams
  kl_ctl?: number
}

export interface CalculateKLRequest {
  beta: number
  ref_distribution?: { mean: number; std: number }
  actor_distribution?: { mean: number; std: number }
  x_range?: [number, number]
  num_points?: number
}

export interface ComputeGAERequest {
  tokens: string[]
  rewards: number[]
  values: number[]
  gamma?: number
  lambda?: number
}

export interface StepGAERequest {
  t: number
  tokens: string[]
  rewards: number[]
  values: number[]
  gamma?: number
  lambda?: number
  next_advantage?: number
}
