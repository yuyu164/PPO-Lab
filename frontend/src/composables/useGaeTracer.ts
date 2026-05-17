import { ref, computed, watch, onUnmounted } from 'vue'
import { useGaeStore } from '@/stores/gae'
import { useAnimation } from '@/composables/useAnimation'
import type { GAEStep, StepCalculation, GAERetraceStatus, AnimationSpeed } from '@/types'

const SPEED_DURATION_MAP: Record<AnimationSpeed, number> = { 1: 1500, 2: 750, 4: 375 }

export function useGaeTracer() {
  const store = useGaeStore()
  const { createTimeline } = useAnimation()

  type GsapTimeline = ReturnType<typeof createTimeline>

  const traceState = ref<GAERetraceStatus>('idle')
  const speed = ref<AnimationSpeed>(1)
  const singleStepMode = ref(false)
  const displayedAdvantages = ref<number[]>([])
  const typewriterText = ref('')

  const canStart = computed(() => traceState.value === 'idle' && store.tokens.length > 0)
  const canPause = computed(() => traceState.value === 'tracing')
  const canResume = computed(() => traceState.value === 'paused')
  const canReset = computed(() => traceState.value !== 'idle')
  const stepDuration = computed(() => SPEED_DURATION_MAP[speed.value])
  const currentTraceStep = computed<GAEStep | null>(() => {
    if (!store.result || store.currentTraceIndex < 0) return null
    return store.result.steps.find(s => s.t === store.currentTraceIndex) || null
  })

  let traceTimer: ReturnType<typeof setTimeout> | null = null
  let traceTimeline: GsapTimeline | null = null
  let typewriterTimeline: GsapTimeline | null = null

  function transition(newState: GAERetraceStatus) {
    traceState.value = newState
    store.status = newState
  }

  async function startTrace() {
    if (!canStart.value) return
    transition('tracing')
    displayedAdvantages.value = new Array(store.tokens.length).fill(0)
    store.currentTraceIndex = store.tokens.length - 1
    try {
      await store.startTrace()
      if (store.result) await executeTraceStep()
    } catch (error) {
      transition('idle')
      throw error
    }
  }

  function pause() {
    if (!canPause.value) return
    clearTimers()
    if (traceTimeline) traceTimeline.pause()
    if (typewriterTimeline) typewriterTimeline.pause()
    transition('paused')
  }

  function resume() {
    if (!canResume.value) return
    transition('tracing')
    if (traceTimeline) { traceTimeline.resume() } else { executeTraceStep() }
  }

  async function stepOnce() {
    if (traceState.value !== 'paused' && traceState.value !== 'idle') return
    if (traceState.value === 'idle') {
      await startTrace()
      singleStepMode.value = true
      return
    }
    singleStepMode.value = true
    transition('tracing')
    await executeTraceStep()
  }

  async function executeTraceStep() {
    if (store.currentTraceIndex < 0) { transition('complete'); return }
    const t = store.currentTraceIndex
    const stepData = store.result?.steps.find(s => s.t === t)
    if (!stepData) { transition('complete'); return }

    try {
      await store.stepBackward()
    } catch (error) {
      transition('idle')
      throw error
    }

    displayedAdvantages.value[t] = stepData.A_t

    traceTimeline = createBarGrowTimeline(t)
    typewriterTimeline = createTypewriterTimeline(stepData)

    traceTimeline.eventCallback('onComplete', () => {
      if (singleStepMode.value) {
        singleStepMode.value = false
        transition('paused')
        return
      }
      if (store.currentTraceIndex < 0) {
        transition('complete')
      } else {
        traceTimer = setTimeout(() => { executeTraceStep() }, 200)
      }
    })

    traceTimeline.play()
    if (typewriterTimeline) typewriterTimeline.play()
  }

  function createBarGrowTimeline(tokenIndex: number): GsapTimeline {
    const tl = createTimeline({ paused: true })
    tl.to(`.advantage-bar--${tokenIndex}`, {
      scaleY: 1,
      duration: stepDuration.value / 1000 * 0.6,
      ease: 'power2.out',
    }, 0)
    return tl
  }

  function createTypewriterTimeline(stepData: GAEStep): GsapTimeline {
    const tl = createTimeline({ paused: true })
    const calc = store.currentStepCalc
    if (!calc) return tl

    const fullText = buildCalculationText(stepData, calc)
    const textProxy = { charIndex: 0 }

    tl.to(textProxy, {
      charIndex: fullText.length,
      duration: stepDuration.value / 1000 * 0.8,
      ease: 'none',
      onUpdate: () => { typewriterText.value = fullText.substring(0, Math.floor(textProxy.charIndex)) },
    }, 0)

    return tl
  }

  function buildCalculationText(stepData: GAEStep, calc: StepCalculation): string {
    const lines: string[] = []
    lines.push(`t=${stepData.t} Token="${stepData.token}"`)
    lines.push(`δ_${stepData.t} = ${calc.formulas.td_error.substitution}`)
    lines.push(`    = ${calc.formulas.td_error.result.toFixed(4)}`)
    lines.push(`A_${stepData.t} = ${calc.formulas.gae.substitution}`)
    lines.push(`    = ${calc.formulas.gae.result.toFixed(4)}`)
    return lines.join('\n')
  }

  function setSpeed(newSpeed: AnimationSpeed) { speed.value = newSpeed; store.setSpeed(newSpeed) }

  function reset() {
    clearTimers()
    if (traceTimeline) { traceTimeline.kill(); traceTimeline = null }
    if (typewriterTimeline) { typewriterTimeline.kill(); typewriterTimeline = null }
    store.reset()
    transition('idle')
    displayedAdvantages.value = []
    typewriterText.value = ''
    singleStepMode.value = false
  }

  function clearTimers() {
    if (traceTimer) { clearTimeout(traceTimer); traceTimer = null }
  }

  watch([() => store.gamma, () => store.lambda], async () => {
    if (traceState.value !== 'idle') reset()
    await store.computeGAE()
  })

  onUnmounted(() => {
    clearTimers()
    if (traceTimeline) traceTimeline.kill()
    if (typewriterTimeline) typewriterTimeline.kill()
  })

  return {
    traceState, speed, singleStepMode, displayedAdvantages, typewriterText,
    canStart, canPause, canResume, canReset, stepDuration, currentTraceStep,
    startTrace, pause, resume, stepOnce, setSpeed, reset,
  }
}
