import type { CurvePoint, KLBetaInterpretation } from '@/types'

export function generateNormalCurve(
  mean: number,
  std: number,
  xMin: number,
  xMax: number,
  numPoints: number
): CurvePoint[] {
  const step = (xMax - xMin) / (numPoints - 1)
  const coefficient = 1 / (std * Math.sqrt(2 * Math.PI))
  const points: CurvePoint[] = []

  for (let i = 0; i < numPoints; i++) {
    const x = xMin + i * step
    const exponent = -Math.pow(x - mean, 2) / (2 * std * std)
    const y = coefficient * Math.exp(exponent)
    points.push({ x: parseFloat(x.toFixed(4)), y: parseFloat(y.toFixed(4)) })
  }

  return points
}

export function calculateKLGaussian(
  refMean: number,
  refStd: number,
  actorMean: number,
  actorStd: number
): number {
  const logRatio = Math.log(actorStd / refStd)
  const numerator = refStd * refStd + (refMean - actorMean) * (refMean - actorMean)
  const denominator = 2 * actorStd * actorStd
  return parseFloat((logRatio + numerator / denominator - 0.5).toFixed(4))
}

export function computeGAE(
  rewards: number[],
  values: number[],
  gamma: number,
  lambda: number
): { advantages: number[]; returns: number[] } {
  const T = rewards.length
  const advantages = new Array(T).fill(0)
  let nextAdvantage = 0

  for (let t = T - 1; t >= 0; t--) {
    const vNext = t < T - 1 ? values[t + 1] : 0
    const delta = rewards[t] + gamma * vNext - values[t]
    advantages[t] = parseFloat((delta + gamma * lambda * nextAdvantage).toFixed(4))
    nextAdvantage = advantages[t]
  }

  const returns = advantages.map((a, i) => parseFloat((a + values[i]).toFixed(4)))

  return { advantages, returns }
}

export function interpretBeta(beta: number, klDivergence: number): KLBetaInterpretation {
  const penaltyStrength = beta * klDivergence
  if (beta < 0.03) {
    return {
      status: 'warning',
      title: '偏离警告',
      description: `β=${beta}过小，KL约束几乎失效，Actor可能偏离Ref过远产生不可控输出。建议增大β至0.05以上。`
    }
  }
  if (klDivergence > 1.0) {
    return {
      status: 'warning',
      title: '偏离警告',
      description: `KL散度=${klDivergence.toFixed(4)}过大，Actor偏离Ref过远，模型可能产生不可控输出。建议增大β加强约束。`
    }
  }
  if (beta > 0.50 && klDivergence < 0.02) {
    return {
      status: 'locked',
      title: '过度约束',
      description: `β=${beta}的强约束使Actor非常接近Ref（KL散度=${klDivergence.toFixed(4)}），模型探索空间有限，抑制了奖励优化。`
    }
  }
  return {
    status: 'optimal',
    title: '理想状态',
    description: `β=${beta}使Actor在探索与约束之间取得平衡（KL散度=${klDivergence.toFixed(4)}，惩罚项β·KL=${penaltyStrength.toFixed(4)}），模型有适度自由度且保持对齐。`
  }
}

export function getVarianceBiasInterpretation(lambda: number): { bias: string; variance: string; description: string } {
  if (lambda < 0.3) {
    return {
      bias: '高偏差',
      variance: '低方差',
      description: `λ=${lambda}使GAE更接近单步TD估计，偏差高但方差低。适合样本稀少但Critic较准确的场景。`
    }
  }
  if (lambda < 0.7) {
    return {
      bias: '中等偏差',
      variance: '中等方差',
      description: `λ=${lambda}在偏差与方差之间取得平衡，是PPO算法的常用设置。`
    }
  }
  return {
    bias: '低偏差',
    variance: '高方差',
    description: `λ=${lambda}使GAE更接近Monte Carlo估计，偏差低但方差高。更信任实际采样结果，偏差小但需要更多采样。`
  }
}

export function calculateOverlapArea(
  refCurve: CurvePoint[],
  actorCurve: CurvePoint[]
): number {
  if (refCurve.length === 0 || actorCurve.length === 0) return 0
  let overlap = 0
  const n = Math.min(refCurve.length, actorCurve.length)
  for (let i = 0; i < n - 1; i++) {
    const dx = Math.abs(refCurve[i + 1].x - refCurve[i].x)
    const minPdf = Math.min(refCurve[i].y, actorCurve[i].y)
    overlap += minPdf * dx
  }
  return parseFloat(overlap.toFixed(4))
}
