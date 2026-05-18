import { defineStore } from 'pinia'
import type { GAEResult, StepCalculation, GAEStep } from '@/types'
import { generateGAEMockData, generateStepCalculation } from '@/mock/gae'

interface GAEState {
  status: 'idle' | 'tracing' | 'paused' | 'complete'
  tokens: string[]
  rewards: number[]
  values: number[]
  gamma: number
  lambda: number
  result: GAEResult | null
  currentTraceIndex: number
  currentStepCalc: StepCalculation | null
  animationSpeed: 1 | 2 | 4
}

export const useGaeStore = defineStore('gae', {
  state: (): GAEState => ({
    status: 'idle',
    tokens: ['Hello', 'I', 'am', 'an', 'AI', 'assistant'],
    rewards: [0.5, 0.3, 0.8, -0.1, 1.5, 0.5],
    values: [0.4, 0.6, 0.5, 0.3, 0.8, 0.6],
    gamma: 0.99,
    lambda: 0.95,
    result: null,
    currentTraceIndex: -1,
    currentStepCalc: null,
    animationSpeed: 1,
  }),

  getters: {
    totalTokens(state): number { return state.tokens.length },
    currentGAEStep(): GAEStep | null {
      if (!this.result || this.currentTraceIndex < 0) return null
      return this.result.steps.find(s => s.t === this.currentTraceIndex) || null
    },
    isTracing(state): boolean { return state.status === 'tracing' },
    advantages(state): number[] { return state.result?.advantages || [] },
    returns(state): number[] { return state.result?.returns || [] },
  },

  actions: {
    async startTrace() {
      this.status = 'tracing'
      this.currentTraceIndex = this.tokens.length - 1
      this.result = generateGAEMockData(
        this.tokens,
        this.rewards,
        this.values,
        this.gamma,
        this.lambda,
      )
    },
    pauseTrace() { if (this.status === 'tracing') this.status = 'paused' },
    async stepBackward() {
      if (this.status !== 'paused' && this.status !== 'tracing') return
      if (this.currentTraceIndex < 0) return
      const stepData = this.result?.steps.find(s => s.t === this.currentTraceIndex)
      if (!stepData) {
        this.currentTraceIndex--
        if (this.currentTraceIndex < 0) this.status = 'complete'
        return
      }
      const nextAdv = this.currentTraceIndex < this.result.steps.length - 1
        ? this.result.advantages[this.currentTraceIndex + 1]
        : 0
      this.currentStepCalc = generateStepCalculation(stepData, this.gamma, this.lambda, nextAdv)
      this.currentTraceIndex--
      if (this.currentTraceIndex < 0) this.status = 'complete'
    },
    reset() {
      this.status = 'idle'
      this.result = null
      this.currentTraceIndex = -1
      this.currentStepCalc = null
    },
    setGamma(value: number) { this.gamma = Math.max(0.9, Math.min(1.0, value)) },
    setLambda(value: number) { this.lambda = Math.max(0.0, Math.min(1.0, value)) },
    setSpeed(speed: 1 | 2 | 4) { this.animationSpeed = speed },
    async computeGAE() {
      this.result = generateGAEMockData(
        this.tokens,
        this.rewards,
        this.values,
        this.gamma,
        this.lambda,
      )
    },
  },
})
