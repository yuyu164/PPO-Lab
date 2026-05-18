import { defineStore } from 'pinia'
import type { CurvePoint, KLBetaInterpretation } from '@/types'
import { generateKLMockData } from '@/mock/kl'

interface KLState {
  beta: number
  refDistribution: { mean: number; std: number }
  actorDistribution: { mean: number; std: number }
  klDivergence: number
  overlapArea: number
  refCurve: CurvePoint[]
  actorCurve: CurvePoint[]
  interpretation: KLBetaInterpretation | null
  formula: { expression: string; highlight: string; beta_value: number }
}

export const useKlStore = defineStore('kl', {
  state: (): KLState => ({
    beta: 0.10,
    refDistribution: { mean: 0.0, std: 1.0 },
    actorDistribution: { mean: 0.3, std: 1.1 },
    klDivergence: 0,
    overlapArea: 0,
    refCurve: [],
    actorCurve: [],
    interpretation: null,
    formula: { expression: '', highlight: '', beta_value: 0 },
  }),

  getters: {
    betaStatus(state): 'warning' | 'optimal' | 'locked' {
      if (state.interpretation) return state.interpretation.status
      if (state.beta < 0.05) return 'warning'
      if (state.beta <= 0.20) return 'optimal'
      return 'locked'
    },
  },

  actions: {
    async setBeta(newBeta: number) {
      this.beta = Math.max(0.01, Math.min(1.0, newBeta))
      await this.calculateKL()
    },
    async calculateKL() {
      const result = generateKLMockData(
        this.beta,
        this.refDistribution.mean,
        this.refDistribution.std,
        this.actorDistribution.mean,
        this.actorDistribution.std,
      )
      this.klDivergence = result.kl_divergence
      this.overlapArea = result.overlap_area
      this.refCurve = result.ref_curve.curve
      this.actorCurve = result.actor_curve.curve
      this.interpretation = result.interpretation
      this.formula = result.formula
    },
    async applyPreset(preset: 'free' | 'standard' | 'strict') {
      const presets = {
        free: { beta: 0.01, actor: { mean: 1.5, std: 0.8 } },
        standard: { beta: 0.10, actor: { mean: 0.5, std: 1.2 } },
        strict: { beta: 0.50, actor: { mean: 0.1, std: 1.05 } },
      }
      const p = presets[preset]
      this.beta = p.beta
      this.actorDistribution = p.actor
      await this.calculateKL()
    },
  },
})
