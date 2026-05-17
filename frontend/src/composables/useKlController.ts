import { ref, onUnmounted } from 'vue'
import { useKlStore } from '@/stores/kl'
import { useAnimation } from '@/composables/useAnimation'

interface KLPreset {
  key: string
  label: string
  beta: number
  actorMean: number
  actorStd: number
}

const KL_PRESETS: KLPreset[] = [
  { key: 'free', label: '自由模式', beta: 0.01, actorMean: 1.5, actorStd: 0.8 },
  { key: 'standard', label: '标准模式', beta: 0.1, actorMean: 0.5, actorStd: 1.2 },
  { key: 'strict', label: '严格模式', beta: 0.5, actorMean: 0.1, actorStd: 1.05 },
]

export function useKlController() {
  const store = useKlStore()
  const { createTimeline } = useAnimation()

  const isCalculating = ref(false)
  const activePreset = ref<string | null>(null)
  const formulaHighlightActive = ref(false)

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  const DEBOUNCE_MS = 300

  function debouncedCalculate() {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => { await doCalculate() }, DEBOUNCE_MS)
  }

  function immediateCalculate() {
    if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null }
    doCalculate()
  }

  async function doCalculate() {
    if (isCalculating.value) return
    isCalculating.value = true
    try {
      await store.calculateKL()
      flashFormulaHighlight()
    } finally {
      isCalculating.value = false
    }
  }

  function onBetaChange(newBeta: number, immediate: boolean = false) {
    const clamped = Math.max(0.01, Math.min(1.0, newBeta))
    store.beta = clamped
    updateActivePreset(clamped)
    if (immediate) { immediateCalculate() } else { debouncedCalculate() }
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
    const actorMeanProxy = { value: store.actorDistribution.mean }
    const actorStdProxy = { value: store.actorDistribution.std }

    const tl = createTimeline({
      onComplete: () => {
        store.beta = preset.beta
        store.actorDistribution = { mean: preset.actorMean, std: preset.actorStd }
        immediateCalculate()
      },
    })

    tl.to(betaProxy, {
      value: preset.beta, duration: 0.5, ease: 'power2.inOut',
      onUpdate: () => { store.beta = betaProxy.value },
    }, 0)

    tl.to(actorMeanProxy, {
      value: preset.actorMean, duration: 0.5, ease: 'power2.inOut',
      onUpdate: () => { store.actorDistribution.mean = actorMeanProxy.value },
    }, 0)

    tl.to(actorStdProxy, {
      value: preset.actorStd, duration: 0.5, ease: 'power2.inOut',
      onUpdate: () => { store.actorDistribution.std = actorStdProxy.value },
    }, 0)

    tl.play()
  }

  function flashFormulaHighlight() {
    formulaHighlightActive.value = true
    setTimeout(() => { formulaHighlightActive.value = false }, 800)
  }

  onUnmounted(() => { if (debounceTimer) clearTimeout(debounceTimer) })

  return {
    isCalculating, activePreset, formulaHighlightActive, presets: KL_PRESETS,
    onBetaChange, applyPreset, debouncedCalculate, immediateCalculate,
  }
}
