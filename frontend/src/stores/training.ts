import { defineStore } from 'pinia'
import type { TrainingHyperparams, TrainingMetrics, AchievementUnlock } from '@/types'
import { mockTrainingPresets } from '@/mock/training'

interface TrainingState {
  connectionStatus: 'disconnected' | 'connecting' | 'connected'
  trainingStatus: 'idle' | 'running' | 'paused' | 'completed' | 'error'
  currentEpoch: number
  maxEpochs: number
  hyperparams: TrainingHyperparams
  history: TrainingMetrics[]
  achievements: AchievementUnlock[]
  presets: Record<string, { label: string; params: TrainingHyperparams }> | null
  errorMessage: string | null
}

export const useTrainingStore = defineStore('training', {
  state: (): TrainingState => ({
    connectionStatus: 'disconnected',
    trainingStatus: 'idle',
    currentEpoch: 0,
    maxEpochs: 100,
    hyperparams: { kl_ctl: 0.1, gamma: 0.99, lam: 0.95, clip_range: 0.2, learning_rate: 0.03, ppo_epochs: 3 },
    history: [],
    achievements: [],
    presets: null,
    errorMessage: null,
  }),

  getters: {
    latestMetrics(state): TrainingMetrics | null {
      return state.history.length > 0 ? state.history[state.history.length - 1] : null
    },
    actorLossHistory(state): { epoch: number; value: number }[] {
      return state.history.map(m => ({ epoch: m.epoch, value: m.actor_loss }))
    },
    criticLossHistory(state): { epoch: number; value: number }[] {
      return state.history.map(m => ({ epoch: m.epoch, value: m.critic_loss }))
    },
    klHistory(state): { epoch: number; value: number }[] {
      return state.history.map(m => ({ epoch: m.epoch, value: m.kl_div }))
    },
    rewardHistory(state): { epoch: number; value: number }[] {
      return state.history.map(m => ({ epoch: m.epoch, value: m.reward }))
    },
    unlockedAchievements(state): string[] {
      return state.achievements.map(a => a.achievement)
    },
    achievementCount(state): { unlocked: number; total: number } {
      return { unlocked: state.achievements.length, total: 5 }
    },
  },

  actions: {
    async connect() {
      this.connectionStatus = 'connecting'
      this.connectionStatus = 'connected'
    },
    disconnect() { this.connectionStatus = 'disconnected' },
    startTraining() { this.trainingStatus = 'running' },
    pauseTraining() { this.trainingStatus = 'paused' },
    resumeTraining() { this.trainingStatus = 'running' },
    stepTraining() {},
    resetTraining() {
      this.history = []
      this.achievements = []
      this.currentEpoch = 0
      this.trainingStatus = 'idle'
      this.errorMessage = null
    },
    updateParams(params: Partial<TrainingHyperparams>) {
      this.hyperparams = { ...this.hyperparams, ...params }
    },
    async loadPresets() {
      this.presets = mockTrainingPresets
    },
    handleEpochData(data: TrainingMetrics) {
      this.history.push(data)
      this.currentEpoch = data.epoch
    },
    handleAchievement(data: AchievementUnlock) {
      const exists = this.achievements.some(a => a.achievement === data.achievement)
      if (!exists) this.achievements.push(data)
    },
    handleStatus(data: { state: 'idle' | 'running' | 'paused' | 'completed' | 'error'; epoch: number; max_epochs: number }) {
      this.trainingStatus = data.state
      this.currentEpoch = data.epoch
      this.maxEpochs = data.max_epochs
    },
    handleError(data: { code: string; message: string }) {
      this.trainingStatus = 'error'
      this.errorMessage = data.message
    },
  },
})
