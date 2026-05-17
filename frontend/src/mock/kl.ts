import type { CalculateKLResponse } from '@/types'
import { generateNormalCurve, calculateKLGaussian, calculateOverlapArea, interpretBeta } from '@/utils/algorithm'

export function generateKLMockData(
  beta: number,
  refMean: number = 0.0,
  refStd: number = 1.0,
  actorMean: number = 0.5,
  actorStd: number = 1.2
): CalculateKLResponse {
  const xMin = -4
  const xMax = 4
  const numPoints = 200

  const refCurve = generateNormalCurve(refMean, refStd, xMin, xMax, numPoints)
  const actorCurve = generateNormalCurve(actorMean, actorStd, xMin, xMax, numPoints)
  const klDivergence = calculateKLGaussian(refMean, refStd, actorMean, actorStd)
  const overlapArea = calculateOverlapArea(refCurve, actorCurve)
  const interpretation = interpretBeta(beta, klDivergence)

  return {
    kl_divergence: klDivergence,
    ref_curve: { mean: refMean, std: refStd, curve: refCurve },
    actor_curve: { mean: actorMean, std: actorStd, curve: actorCurve },
    overlap_area: overlapArea,
    interpretation,
    formula: {
      expression: 'R_t = -β·(log P_actor - log P_ref)',
      highlight: 'β',
      beta_value: beta,
    },
  }
}

export const mockKlPresetFree = generateKLMockData(0.01, 0.0, 1.0, 1.5, 0.8)
export const mockKlPresetStandard = generateKLMockData(0.1, 0.0, 1.0, 0.5, 1.2)
export const mockKlPresetStrict = generateKLMockData(0.5, 0.0, 1.0, 0.1, 1.05)
