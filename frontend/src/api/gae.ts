import { request } from './request'
import type { ComputeGAEResponse, StepGAEResponse } from '@/types'

interface ComputeParams {
  tokens: string[]
  rewards: number[]
  values: number[]
  gamma?: number
  lambda?: number
}

interface StepParams {
  t: number
  tokens: string[]
  rewards: number[]
  values: number[]
  gamma?: number
  lambda?: number
  next_advantage?: number
}

export const gaeApi = {
  async compute(params: ComputeParams): Promise<ComputeGAEResponse> {
    return request<ComputeGAEResponse>({
      method: 'POST',
      url: '/api/gae/compute',
      data: {
        tokens: params.tokens,
        rewards: params.rewards,
        values: params.values,
        gamma: params.gamma ?? 0.99,
        lambda: params.lambda ?? 0.95,
      },
    })
  },

  async step(params: StepParams): Promise<StepGAEResponse> {
    return request<StepGAEResponse>({
      method: 'POST',
      url: '/api/gae/step',
      data: {
        t: params.t,
        tokens: params.tokens,
        rewards: params.rewards,
        values: params.values,
        gamma: params.gamma ?? 0.99,
        lambda: params.lambda ?? 0.95,
        next_advantage: params.next_advantage ?? 0.0,
      },
    })
  },
}
