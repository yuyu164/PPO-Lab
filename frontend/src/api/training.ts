import { request } from './request'
import type { PresetsResponse } from '@/types'

export const trainingApi = {
  async getPresets(): Promise<PresetsResponse> {
    return request<PresetsResponse>({
      method: 'GET',
      url: '/api/training/presets',
    })
  },
}
