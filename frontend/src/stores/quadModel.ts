import { defineStore } from 'pinia'
import type { TokenStep, GenerationEpisode, ModelParams } from '@/types'
import { mockGenerationEpisode } from '@/mock/quadModel'

interface QuadModelState {
  status: 'idle' | 'generating' | 'paused' | 'complete'
  currentStep: number
  episode: GenerationEpisode | null
  steps: TokenStep[]
  prompt: string
  actorParams: ModelParams
  refParams: ModelParams
  klCtl: number
}

export const useQuadModelStore = defineStore('quadModel', {
  state: (): QuadModelState => ({
    status: 'idle',
    currentStep: 0,
    episode: null,
    steps: [],
    prompt: 'Hello',
    actorParams: { mean: 0.0, std: 1.0 },
    refParams: { mean: 0.0, std: 1.0 },
    klCtl: 0.2,
  }),

  getters: {
    totalSteps(state): number { return state.steps.length },
    currentStepData(state): TokenStep | null {
      if (state.currentStep > 0 && state.currentStep <= state.steps.length) {
        return state.steps[state.currentStep - 1]
      }
      return null
    },
    isPlaying(state): boolean { return state.status === 'generating' },
    canStepForward(state): boolean { return state.status === 'generating' || state.status === 'paused' },
  },

  actions: {
    async startGeneration() {
      this.reset()
      this.status = 'generating'
      this.episode = { ...mockGenerationEpisode, steps: [...mockGenerationEpisode.steps] }
      this.steps = [...this.episode.steps]
    },
    pauseGeneration() { if (this.status === 'generating') this.status = 'paused' },
    resumeGeneration() { if (this.status === 'paused') this.status = 'generating' },
    async stepForward() {
      if (!this.canStepForward) return
      if (this.currentStep < this.steps.length) {
        this.currentStep++
      }
      if (this.currentStep >= this.steps.length) {
        this.status = 'complete'
      }
    },
    reset() {
      this.status = 'idle'
      this.currentStep = 0
      this.episode = null
      this.steps = []
    },
  },
})
