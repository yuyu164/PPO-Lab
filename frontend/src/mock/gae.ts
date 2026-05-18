import type { GAEResult, StepCalculation, GAEStep } from '@/types'
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

export function generateStepCalculation(
  step: GAEStep,
  gamma: number,
  lambda: number,
  nextAdvantage: number,
): StepCalculation {
  const tdSub = `δ_${step.t} = ${step.r_t.toFixed(4)} + ${gamma.toFixed(2)}×${step.V_next.toFixed(4)} - ${step.V_t.toFixed(4)}`
  const gaeSub = `A_${step.t} = ${step.delta.toFixed(4)} + ${gamma.toFixed(2)}×${lambda.toFixed(2)}×${nextAdvantage.toFixed(4)}`

  return {
    step: step.t,
    token: step.token,
    formulas: {
      td_error: {
        formula: 'δ_t = r_t + γ·V_{t+1} - V_t',
        substitution: tdSub,
        result: step.delta,
      },
      gae: {
        formula: 'A_t = δ_t + γ·λ·A_{t+1}',
        substitution: gaeSub,
        result: step.A_t,
      },
    },
    is_positive: step.is_positive,
  }
}

export const mockStepCalculation: StepCalculation = generateStepCalculation(
  { t: 3, token: 'an', r_t: -0.1, V_t: 0.3, V_next: 0.8, delta: 0.392, A_t: 1.5205, is_positive: true },
  0.99, 0.95, 1.1999,
)
