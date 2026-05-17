import { request } from './request'
import type { CalculateKLResponse } from '@/types'

interface CalculateParams {
  beta: number
  ref_distribution?: { mean: number; std: number }
  actor_distribution?: { mean: number; std: number }
  x_range?: [number, number]
  num_points?: number
}

export const klApi = {
  async calculate(params: CalculateParams): Promise<CalculateKLResponse> {
    return request<CalculateKLResponse>({
      method: 'POST',
      url: '/api/kl/calculate',
      data: {
        beta: params.beta,
        ref_distribution: params.ref_distribution || { mean: 0.0, std: 1.0 },
        actor_distribution: params.actor_distribution || { mean: 0.0, std: 1.0 },
        x_range: params.x_range || [-4, 4],
        num_points: params.num_points ?? 200,
      },
    })
  },
}
