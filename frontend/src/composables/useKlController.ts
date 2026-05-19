import { ref, onUnmounted } from 'vue'
import { useKlStore } from '@/stores/kl'
import { useAnimation } from '@/composables/useAnimation'

interface KLPreset {
  key: string
  label: string
  beta: number
}

const KL_PRESETS: KLPreset[] = [
  { key: 'free', label: '自由模式', beta: 0.01 },
  { key: 'standard', label: '标准模式', beta: 0.10 },
  { key: 'strict', label: '严格模式', beta: 0.50 },
]

export function useKlController() {
  const store = useKlStore()
  const { createTimeline } = useAnimation()

  const activePreset = ref<string | null>(null)

  function onBetaChange(newBeta: number) {
    const clamped = Math.max(0.01, Math.min(1.0, newBeta))
    store.setBeta(clamped)
    updateActivePreset(clamped)
  }

  function updateActivePreset(beta: number) {
    const matched = KL_PRESETS.find(p => Math.abs(p.beta - beta) < 0.005)
    activePreset.value = matched ? matched.key : null
  }

  async function applyPreset(presetKey: string) {
    const preset = KL_PRESETS.find(p => p.key === presetKey)
    if (!preset) return
    activePreset.value = presetKey

    const betaProxy = { value: store.beta }

    const tl = createTimeline({
      onComplete: () => {
        store.setBeta(preset.beta)
      },
    })

    tl.to(betaProxy, {
      value: preset.beta, duration: 0.5, ease: 'power2.inOut',
      onUpdate: () => {
        store.setBeta(betaProxy.value)
      },
    }, 0)

    tl.play()
  }

  onUnmounted(() => {})

  return {
    activePreset, presets: KL_PRESETS,
    onBetaChange, applyPreset,
  }
}
