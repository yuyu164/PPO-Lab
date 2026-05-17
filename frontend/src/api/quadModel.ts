import { request } from './request'
import type { GenerationEpisode, TokenStep, ModelParams } from '@/types'

interface GenerateParams {
  prompt: string
  actor_params?: ModelParams
  ref_params?: ModelParams
  kl_ctl?: number
  max_tokens?: number
}

interface StepParams {
  prompt: string
  current_tokens?: string[]
  actor_params?: ModelParams
  ref_params?: ModelParams
  kl_ctl?: number
}

export const quadModelApi = {
  async generate(params: GenerateParams): Promise<{ episode: GenerationEpisode }> {
    return request<{ episode: GenerationEpisode }>({
      method: 'POST',
      url: '/api/quad-model/generate',
      data: {
        prompt: params.prompt,
        actor_params: params.actor_params || { mean: 0.0, std: 1.0 },
        ref_params: params.ref_params || { mean: 0.0, std: 1.0 },
        kl_ctl: params.kl_ctl ?? 0.1,
        max_tokens: params.max_tokens ?? 6,
      },
    })
  },

  async step(params: StepParams): Promise<{ step: TokenStep; is_complete: boolean }> {
    return request<{ step: TokenStep; is_complete: boolean }>({
      method: 'POST',
      url: '/api/quad-model/step',
      data: {
        prompt: params.prompt,
        current_tokens: params.current_tokens || [],
        actor_params: params.actor_params || { mean: 0.0, std: 1.0 },
        ref_params: params.ref_params || { mean: 0.0, std: 1.0 },
        kl_ctl: params.kl_ctl ?? 0.1,
      },
    })
  },
}
