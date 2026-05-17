import type { GenerationEpisode, TokenStep, GAEStep, VarianceBiasResult } from './algorithm'
import type { NormalDistribution, KLBetaInterpretation, StepCalculation, TrainingHyperparams } from './api'

export interface GenerateEpisodeResponse {
  episode: GenerationEpisode
}

export interface StepForwardResponse {
  step: TokenStep
  is_complete: boolean
}

export interface CalculateKLResponse {
  kl_divergence: number
  ref_curve: NormalDistribution
  actor_curve: NormalDistribution
  overlap_area: number
  interpretation: KLBetaInterpretation
  formula: { expression: string; highlight: string; beta_value: number }
}

export interface ComputeGAEResponse {
  steps: GAEStep[]
  advantages: number[]
  returns: number[]
  gamma: number
  lambda: number
  variance_bias: VarianceBiasResult
}

export interface StepGAEResponse {
  step: GAEStep
  calculation: StepCalculation
}

export interface PresetsResponse {
  presets: Record<string, { label: string; params: TrainingHyperparams }>
}
