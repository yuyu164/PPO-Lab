import { ref, computed, onUnmounted } from 'vue'
import { useQuadModelStore } from '@/stores/quadModel'
import { useAnimation } from '@/composables/useAnimation'
import type { TokenStep, QuadModelStatus } from '@/types'

interface SubStep {
  id: number
  label: string
  color: string
  duration: number
}

const SUB_STEPS: SubStep[] = [
  { id: 0, label: 'Actor生成Token', color: '#3B82F6', duration: 800 },
  { id: 1, label: 'Reference对比概率', color: '#F59E0B', duration: 600 },
  { id: 2, label: 'Critic预测价值', color: '#A78BFA', duration: 600 },
  { id: 3, label: '计算优势函数', color: '#34D399', duration: 700 },
]

export function useQuadModelStateMachine() {
  const store = useQuadModelStore()
  const { createTimeline } = useAnimation()

  type GsapTimeline = ReturnType<typeof createTimeline>

  const state = ref<QuadModelStatus>('idle')
  const currentTokenIndex = ref(0)
  const currentSubStep = ref(0)
  const isTransitioning = ref(false)

  const canStart = computed(() => state.value === 'idle')
  const canPause = computed(() => state.value === 'generating')
  const canResume = computed(() => state.value === 'paused')
  const canReset = computed(() => state.value !== 'idle')
  const canStepForward = computed(() => state.value === 'generating' || state.value === 'paused')
  const hasMoreSteps = computed(() => {
    if (!store.episode) return false
    return currentTokenIndex.value < store.episode.steps.length
  })
  const currentStepData = computed<TokenStep | null>(() => {
    if (!store.episode || currentTokenIndex.value <= 0) return null
    return store.episode.steps[currentTokenIndex.value - 1]
  })

  let autoPlayTimer: ReturnType<typeof setTimeout> | null = null
  let stepTimeline: GsapTimeline | null = null

  function transition(newState: QuadModelStatus) {
    state.value = newState
    store.status = newState
  }

  async function startGeneration() {
    if (!canStart.value) return
    transition('generating')
    currentTokenIndex.value = 0
    currentSubStep.value = 0
    try {
      await store.startGeneration()
      if (store.episode && store.episode.steps.length > 0) {
        await executeNextStep()
      }
    } catch (error) {
      transition('idle')
      throw error
    }
  }

  function pause() {
    if (!canPause.value) return
    if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null }
    if (stepTimeline) stepTimeline.pause()
    transition('paused')
  }

  function resume() {
    if (!canResume.value) return
    transition('generating')
    if (stepTimeline) { stepTimeline.resume() } else { executeNextStep() }
  }

  async function stepForward() {
    if (!canStepForward.value) return
    if (state.value === 'paused') transition('generating')
    await executeNextStep()
  }

  async function executeNextStep() {
    if (isTransitioning.value) return
    if (!hasMoreSteps.value) { transition('complete'); return }

    isTransitioning.value = true
    currentTokenIndex.value++
    currentSubStep.value = 0
    store.currentStep = currentTokenIndex.value

    stepTimeline = createStepTimeline(currentTokenIndex.value - 1)

    stepTimeline.eventCallback('onComplete', () => {
      isTransitioning.value = false
      if (state.value === 'generating' && hasMoreSteps.value) {
        autoPlayTimer = setTimeout(() => { executeNextStep() }, 300)
      } else if (!hasMoreSteps.value) {
        transition('complete')
      }
    })

    stepTimeline.play()
  }

  function createStepTimeline(stepIndex: number): GsapTimeline {
    const tl = createTimeline({ paused: true })

    SUB_STEPS.forEach((sub, i) => {
      tl.call(() => { currentSubStep.value = i }, undefined, '+=0.1')

      const modelName = ['actor', 'reference', 'critic', 'reward'][i]
      tl.to(`.model-node--${modelName}`, {
        scale: 1.15,
        boxShadow: `0 0 20px ${sub.color}80`,
        duration: 0.3,
        ease: 'power2.out',
      }, '+=0.05')

      tl.to(`.model-node--${modelName}`, {
        scale: 1,
        boxShadow: 'none',
        duration: 0.2,
        ease: 'power2.in',
      }, `+=${sub.duration / 1000}`)

      if (i === 0) {
        tl.fromTo(`.token-chip--${stepIndex}`, {
          opacity: 0, y: -20, scale: 0.8,
        }, {
          opacity: 1, y: 0, scale: 1,
          duration: 0.5, ease: 'back.out(1.7)',
        }, '<0.2')
      }
    })

    return tl
  }

  function reset() {
    if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null }
    if (stepTimeline) { stepTimeline.kill(); stepTimeline = null }
    store.reset()
    transition('idle')
    currentTokenIndex.value = 0
    currentSubStep.value = 0
    isTransitioning.value = false
  }

  onUnmounted(() => {
    if (autoPlayTimer) clearTimeout(autoPlayTimer)
    if (stepTimeline) stepTimeline.kill()
  })

  return {
    state, currentTokenIndex, currentSubStep, isTransitioning,
    canStart, canPause, canResume, canReset, canStepForward,
    hasMoreSteps, currentStepData, subSteps: SUB_STEPS,
    startGeneration, pause, resume, stepForward, reset,
  }
}
