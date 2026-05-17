import type { GAEResult, StepCalculation } from '@/types'
import { computeGAE, getVarianceBiasInterpretation } from '@/utils/algorithm'

export function generateGAEMockData(
  tokens: string[],
  rewards: number[],
  values: number[],
  gamma: number = 0.99,
  lambda: number = 0.95
): GAEResult {
  const { advantages, returns } = computeGAE(rewards, values, gamma, lambda)
  const varianceBias = getVarianceBiasInterpretation(lambda)

  const steps = []
  for (let t = tokens.length - 1; t >= 0; t--) {
    const vNext = t < tokens.length - 1 ? values[t + 1] : 0
    const delta = parseFloat((rewards[t] + gamma * vNext - values[t]).toFixed(4))
    steps.push({
      t,
      token: tokens[t],
      r_t: rewards[t],
      V_t: values[t],
      V_next: vNext,
      delta,
      A_t: advantages[t],
      is_positive: advantages[t] >= 0,
    })
  }

  return {
    steps,
    advantages,
    returns,
    gamma,
    lambda,
    variance_bias: varianceBias,
  }
}

export const defaultGAEMock = generateGAEMockData(
  ['Hello', 'I', 'am', 'an', 'AI', 'assistant'],
  [0.5, 0.3, 0.8, -0.1, 1.5, 0.5],
  [0.4, 0.6, 0.5, 0.3, 0.8, 0.6],
  0.99,
  0.95
)

export const mockStepCalculation: StepCalculation = {
  step: 3,
  formulas: {
    td_error: {
      formula: 'δ_t = r_t + γ·V_{t+1} - V_t',
      substitution: 'δ_3 = -0.1000 + 0.99×0.8000 - 0.3000',
      result: 0.3920,
    },
    gae: {
      formula: 'A_t = δ_t + γ·λ·A_{t+1}',
      substitution: 'A_3 = 0.3920 + 0.99×0.95×1.1999',
      result: 1.5205,
    },
  },
  is_positive: true,
}
