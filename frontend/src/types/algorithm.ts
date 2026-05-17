export interface TokenStep {
  token: string
  log_prob: number
  ref_log_prob: number
  kl_div: number
  V_t: number
  V_next: number
  r_t: number
  A_t: number
}

export interface GenerationEpisode {
  prompt: string
  steps: TokenStep[]
  R_global: number
}

export interface GAEStep {
  t: number
  token: string
  r_t: number
  V_t: number
  V_next: number
  delta: number
  A_t: number
  is_positive: boolean
}

export interface VarianceBiasResult {
  bias: string
  variance: string
  description: string
}

export interface GAEResult {
  steps: GAEStep[]
  advantages: number[]
  returns: number[]
  gamma: number
  lambda: number
  variance_bias: VarianceBiasResult
}

export interface TrainingMetrics {
  epoch: number
  actor_loss: number
  critic_loss: number
  kl_div: number
  reward: number
  advantages: number[]
  returns: number[]
}

export interface ModelParams {
  mean: number
  std: number
  weights?: number[]
}
