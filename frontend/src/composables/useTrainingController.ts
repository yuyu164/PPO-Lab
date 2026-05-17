import { ref, computed, watch, onUnmounted } from 'vue'
import { useTrainingStore } from '@/stores/training'
import type { TrainingHyperparams, TrainingMetrics, AchievementType, AchievementUnlock } from '@/types'

interface AchievementConfig {
  type: AchievementType
  label: string
  icon: string
  description: string
  condition: (history: TrainingMetrics[]) => boolean
}

const ACHIEVEMENT_CONFIGS: AchievementConfig[] = [
  {
    type: 'first_converge', label: '首次收敛', icon: 'Trophy',
    description: 'Actor Loss首次降到0.5以下',
    condition: (h) => h.some(m => m.actor_loss < 0.5),
  },
  {
    type: 'kl_stable', label: 'KL稳定', icon: 'Target',
    description: 'KL散度连续10个Epoch在[0.1, 0.3]',
    condition: (h) => { if (h.length < 10) return false; return h.slice(-10).every(m => m.kl_div >= 0.1 && m.kl_div <= 0.3) },
  },
  {
    type: 'continuous_improve', label: '连续优化', icon: 'Flame',
    description: 'Actor Loss连续20个Epoch下降',
    condition: (h) => {
      if (h.length < 20) return false
      const last20 = h.slice(-20)
      for (let i = 1; i < last20.length; i++) { if (last20[i].actor_loss >= last20[i - 1].actor_loss) return false }
      return true
    },
  },
  {
    type: 'precise_tuning', label: '精准调参', icon: 'Award',
    description: 'Actor Loss < 0.3 且 KL散度 < 0.2',
    condition: (h) => { const l = h[h.length - 1]; return l.actor_loss < 0.3 && l.kl_div < 0.2 },
  },
  {
    type: 'master', label: '驯化大师', icon: 'Star',
    description: 'Actor Loss < 0.1 且 KL散度 < 0.2 且 Reward > 0.8',
    condition: (h) => { const l = h[h.length - 1]; return l.actor_loss < 0.1 && l.kl_div < 0.2 && l.reward > 0.8 },
  },
]

export function useTrainingController() {
  const store = useTrainingStore()

  const isConnecting = ref(false)

  const isConnected = computed(() => store.connectionStatus === 'connected')
  const isTraining = computed(() => store.trainingStatus === 'running')
  const isPaused = computed(() => store.trainingStatus === 'paused')
  const isIdle = computed(() => store.trainingStatus === 'idle')
  const isCompleted = computed(() => store.trainingStatus === 'completed')
  const hasError = computed(() => store.trainingStatus === 'error')
  const progressPercent = computed(() => store.maxEpochs > 0 ? (store.currentEpoch / store.maxEpochs) * 100 : 0)

  async function connect() {
    if (isConnected.value) return
    isConnecting.value = true
    try { await store.connect() } finally { isConnecting.value = false }
  }

  function disconnect() { store.disconnect() }
  function startTraining() { if (isConnected.value) store.startTraining() }
  function pauseTraining() { if (isTraining.value) store.pauseTraining() }
  function resumeTraining() { if (isPaused.value) store.resumeTraining() }
  function stepTraining() { if (isConnected.value) store.stepTraining() }
  function resetTraining() { store.resetTraining() }

  function updateParam(key: keyof TrainingHyperparams, value: number) {
    store.updateParams({ [key]: value })
  }

  function applyPreset(presetKey: string) {
    if (!store.presets || !store.presets[presetKey]) return
    const preset = store.presets[presetKey]
    store.updateParams(preset.params)
  }

  function checkAchievements() {
    if (store.history.length === 0) return
    const unlockedTypes = new Set(store.achievements.map(a => a.achievement))
    for (const config of ACHIEVEMENT_CONFIGS) {
      if (unlockedTypes.has(config.type)) continue
      if (config.condition(store.history)) {
        const unlock: AchievementUnlock = {
          achievement: config.type,
          description: config.description,
          unlocked_at_epoch: store.currentEpoch,
        }
        store.handleAchievement(unlock)
      }
    }
  }

  watch(() => store.history.length, () => { checkAchievements() })
  onUnmounted(() => { disconnect() })

  return {
    isConnecting, isConnected, isTraining, isPaused, isIdle, isCompleted, hasError,
    progressPercent, achievementConfigs: ACHIEVEMENT_CONFIGS,
    connect, disconnect, startTraining, pauseTraining, resumeTraining,
    stepTraining, resetTraining, updateParam, applyPreset,
  }
}
