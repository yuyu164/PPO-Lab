import { defineStore } from 'pinia'
import type { CurvePoint, KLBetaInterpretation } from '@/types'
import { generateKLMockData } from '@/mock/kl'

interface KLState {
  beta: number
  refDistribution: { mean: number; std: number }
  baseActorDistribution: { mean: number; std: number }
  actorDistribution: { mean: number; std: number }
  klDivergence: number
  overlapArea: number
  refCurve: CurvePoint[]
  actorCurve: CurvePoint[]
  interpretation: KLBetaInterpretation | null
  formula: { expression: string; highlight: string; beta_value: number }
}

const REF = { mean: 0.0, std: 1.0 }
const BASE_ACTOR = { mean: 0.5, std: 1.2 }

function computeActorFromBeta(beta: number): { mean: number; std: number } {
  const t = 1 - 1 / (1 + beta * 3)
  return {
    mean: BASE_ACTOR.mean * (1 - t) + REF.mean * t,
    std: BASE_ACTOR.std * (1 - t) + REF.std * t,
  }
}

export const useKlStore = defineStore('kl', {
  state: (): KLState => ({
    beta: 0.10,
    refDistribution: { ...REF },
    baseActorDistribution: { ...BASE_ACTOR },
    actorDistribution: computeActorFromBeta(0.10),
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
      this.actorDistribution = computeActorFromBeta(this.beta)
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
      const betaMap = { free: 0.01, standard: 0.10, strict: 0.50 }
      this.beta = betaMap[preset]
      this.actorDistribution = computeActorFromBeta(this.beta)
      await this.calculateKL()
    },
  },
})
